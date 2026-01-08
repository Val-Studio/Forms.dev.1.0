'use server'

import { db } from '@/db'
import { forms, questions, options, scoringScales, submissions, answers } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type CreateFormData = {
  title: string
  description?: string
  questions: Array<{
    type: 'likert' | 'single_choice' | 'multiple_choice' | 'text' | 'slider' | 'yes_no'
    title: string
    description?: string
    required: boolean
    order: number
    settings?: any
    options?: Array<{
      text: string
      order: number
      scoreWeights: Record<string, number>
    }>
  }>
  scoringScales: Array<{
    name: string
    description?: string
    minScore: number
    maxScore: number
    interpretations: any
  }>
}

// Створити новий тест
export async function createForm(userId: string, data: CreateFormData) {
  try {
    const [form] = await db.insert(forms).values({
      userId,
      title: data.title,
      description: data.description,
      status: 'draft',
    }).returning()

    // Створити шкали оцінювання
    const createdScales = await Promise.all(
      data.scoringScales.map(async (scale) => {
        const [created] = await db.insert(scoringScales).values({
          formId: form.id,
          name: scale.name,
          description: scale.description,
          minScore: scale.minScore,
          maxScore: scale.maxScore,
          interpretations: scale.interpretations,
        }).returning()
        return created
      })
    )

    // Створити питання
    for (const question of data.questions) {
      const [createdQuestion] = await db.insert(questions).values({
        formId: form.id,
        type: question.type,
        title: question.title,
        description: question.description,
        order: question.order,
        required: question.required,
        settings: question.settings,
      }).returning()

      // Створити варіанти відповідей
      if (question.options) {
        await Promise.all(
          question.options.map((option) =>
            db.insert(options).values({
              questionId: createdQuestion.id,
              text: option.text,
              order: option.order,
              scoreWeights: option.scoreWeights,
            })
          )
        )
      }
    }

    revalidatePath('/dashboard')
    return { success: true, formId: form.id }
  } catch (error) {
    console.error('Error creating form:', error)
    return { success: false, error: 'Failed to create form' }
  }
}

// Отримати всі форми користувача
export async function getUserForms(userId: string) {
  try {
    const userForms = await db.query.forms.findMany({
      where: eq(forms.userId, userId),
      with: {
        questions: {
          with: {
            options: true,
          },
        },
        scoringScales: true,
        submissions: true,
      },
      orderBy: (forms, { desc }) => [desc(forms.createdAt)],
    })

    return userForms
  } catch (error) {
    console.error('Error fetching forms:', error)
    return []
  }
}

// Отримати форму за ID
export async function getFormById(formId: string) {
  try {
    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
      with: {
        questions: {
          with: {
            options: true,
          },
          orderBy: (questions, { asc }) => [asc(questions.order)],
        },
        scoringScales: true,
      },
    })

    return form
  } catch (error) {
    console.error('Error fetching form:', error)
    return null
  }
}

// Опублікувати форму
export async function publishForm(formId: string) {
  try {
    await db.update(forms).set({ status: 'published' }).where(eq(forms.id, formId))
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Error publishing form:', error)
    return { success: false, error: 'Failed to publish form' }
  }
}

// Видалити форму
export async function deleteForm(formId: string) {
  try {
    await db.delete(forms).where(eq(forms.id, formId))
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Error deleting form:', error)
    return { success: false, error: 'Failed to delete form' }
  }
}

// Отримати публічну форму для проходження
export async function getPublicForm(formId: string) {
  try {
    const form = await db.query.forms.findFirst({
      where: eq(forms.id, formId),
      with: {
        questions: {
          with: {
            options: true,
          },
          orderBy: (questions, { asc }) => [asc(questions.order)],
        },
        scoringScales: true,
      },
    })

    if (!form || form.status !== 'published') {
      return null
    }

    return form
  } catch (error) {
    console.error('Error fetching public form:', error)
    return null
  }
}

// Зберегти відповіді на тест
export async function submitTestAnswers(
  formId: string,
  answersData: Record<string, any>,
  patientId?: string
) {
  try {
    // Отримати форму зі шкалами та питаннями
    const form = await getFormById(formId)
    if (!form) {
      return { success: false, error: 'Form not found' }
    }

    // Підрахувати бали по шкалах
    const scores: Record<string, number> = {}
    const interpretations: Record<string, any> = {}

    // Ініціалізувати бали для всіх шкал
    form.scoringScales?.forEach((scale) => {
      scores[scale.id] = 0
    })

    // Підрахувати бали
    for (const question of form.questions || []) {
      const answer = answersData[question.id]
      if (!answer) continue

      // Для питань з варіантами відповідей
      if (question.options && question.options.length > 0) {
        const selectedOption = question.options.find((opt) => opt.id === answer.optionId)
        if (selectedOption && selectedOption.scoreWeights) {
          // Додати бали до кожної шкали
          Object.entries(selectedOption.scoreWeights as Record<string, number>).forEach(
            ([scaleId, weight]) => {
              scores[scaleId] = (scores[scaleId] || 0) + weight
            }
          )
        }
      }
    }

    // Визначити інтерпретації
    form.scoringScales?.forEach((scale) => {
      const score = scores[scale.id] || 0
      const scaleInterpretations = scale.interpretations as Array<{
        min: number
        max: number
        label: string
        color: string
      }>

      const interpretation = scaleInterpretations?.find(
        (interp) => score >= interp.min && score <= interp.max
      )

      if (interpretation) {
        interpretations[scale.id] = interpretation
      }
    })

    // Створити submission
    const [submission] = await db.insert(submissions).values({
      formId,
      patientId: patientId || null,
      status: 'completed',
      scores,
      interpretations,
      completedAt: new Date(),
    }).returning()

    // Зберегти відповіді
    await Promise.all(
      Object.entries(answersData).map(([questionId, answerValue]) =>
        db.insert(answers).values({
          submissionId: submission.id,
          questionId,
          value: answerValue,
        })
      )
    )

    revalidatePath('/dashboard')
    return { success: true, submissionId: submission.id, scores, interpretations }
  } catch (error) {
    console.error('Error submitting answers:', error)
    return { success: false, error: 'Failed to submit answers' }
  }
}

// Отримати результати тесту
export async function getSubmissionResults(submissionId: string) {
  try {
    const submission = await db.query.submissions.findFirst({
      where: eq(submissions.id, submissionId),
      with: {
        form: {
          with: {
            scoringScales: true,
            questions: {
              with: {
                options: true,
              },
            },
          },
        },
        answers: true,
      },
    })

    return submission
  } catch (error) {
    console.error('Error fetching submission:', error)
    return null
  }
}

// Отримати всі результати форми
export async function getFormSubmissions(formId: string) {
  try {
    const formSubmissions = await db.query.submissions.findMany({
      where: eq(submissions.formId, formId),
      orderBy: (submissions, { desc }) => [desc(submissions.createdAt)],
    })

    return formSubmissions
  } catch (error) {
    console.error('Error fetching submissions:', error)
    return []
  }
}
