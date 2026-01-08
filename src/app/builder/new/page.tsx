'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { createForm, type CreateFormData } from '@/app/actions/forms'
import { getCurrentUserId } from '@/lib/mock-user'

type QuestionType = 'likert' | 'multiple_choice' | 'single_choice' | 'text' | 'slider' | 'yes_no'

interface Question {
  id: string
  type: QuestionType
  title: string
  description?: string
  required: boolean
  options?: Array<{
    id: string
    text: string
    scoreWeights: Record<string, number>
  }>
  settings?: Record<string, any>
}

interface ScoringScale {
  id: string
  name: string
  description?: string
  minScore: number
  maxScore: number
  interpretations: Array<{
    min: number
    max: number
    label: string
    color: string
  }>
}

export default function NewFormBuilderPage() {
  const router = useRouter()
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [scoringScales, setScoringScales] = useState<ScoringScale[]>([])
  const [activePanel, setActivePanel] = useState<'questions' | 'scales'>('questions')
  const [saving, setSaving] = useState(false)

  const questionTypes: Array<{ type: QuestionType; label: string; icon: string }> = [
    { type: 'likert', label: 'Шкала Лайкерта', icon: '📊' },
    { type: 'single_choice', label: 'Одиночний вибір', icon: '⭕' },
    { type: 'multiple_choice', label: 'Множинний вибір', icon: '☑️' },
    { type: 'text', label: 'Текстова відповідь', icon: '📝' },
    { type: 'slider', label: 'Повзунок (VAS)', icon: '🎚️' },
    { type: 'yes_no', label: 'Так/Ні', icon: '✅' },
  ]

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type,
      title: '',
      required: true,
      options:
        type === 'single_choice' || type === 'multiple_choice' || type === 'likert'
          ? [{ id: '1', text: '', scoreWeights: {} }]
          : undefined,
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const addScoringScale = () => {
    const newScale: ScoringScale = {
      id: `scale-${Date.now()}`,
      name: '',
      description: '',
      minScore: 0,
      maxScore: 100,
      interpretations: [
        { min: 0, max: 25, label: 'Низький рівень', color: 'green' },
        { min: 26, max: 50, label: 'Помірний рівень', color: 'yellow' },
        { min: 51, max: 75, label: 'Високий рівень', color: 'orange' },
        { min: 76, max: 100, label: 'Дуже високий рівень', color: 'red' },
      ],
    }
    setScoringScales([...scoringScales, newScale])
  }

  const handleSave = async (publish: boolean = false) => {
    if (!formTitle.trim()) {
      alert('Будь ласка, введіть назву тесту')
      return
    }

    if (questions.length === 0) {
      alert('Додайте хоча б одне питання')
      return
    }

    setSaving(true)

    try {
      const formData: CreateFormData = {
        title: formTitle,
        description: formDescription,
        questions: questions.map((q, index) => ({
          type: q.type,
          title: q.title,
          description: q.description,
          required: q.required,
          order: index,
          settings: q.settings,
          options: q.options?.map((opt, optIndex) => ({
            text: opt.text,
            order: optIndex,
            scoreWeights: opt.scoreWeights,
          })),
        })),
        scoringScales: scoringScales.map((scale) => ({
          name: scale.name,
          description: scale.description,
          minScore: scale.minScore,
          maxScore: scale.maxScore,
          interpretations: scale.interpretations,
        })),
      }

      const result = await createForm(getCurrentUserId(), formData)

      if (result.success) {
        alert('Тест успішно збережено!')
        router.push('/dashboard')
      } else {
        // Fallback: зберегти в localStorage
        const savedForms = JSON.parse(localStorage.getItem('mindflow-forms') || '[]')
        const newForm = {
          id: `form-${Date.now()}`,
          ...formData,
          status: publish ? 'published' : 'draft',
          createdAt: new Date().toISOString(),
          submissions: 0,
        }
        savedForms.push(newForm)
        localStorage.setItem('mindflow-forms', JSON.stringify(savedForms))
        alert('Тест збережено локально (БД не підключена)')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error saving form:', error)
      alert('Помилка збереження. Спробуйте ще раз.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-mindflow-cream p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold">Конструктор тестів</h1>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => router.back()}>
                Скасувати
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleSave(false)}
                disabled={saving}
                loading={saving}
              >
                Зберегти чернетку
              </Button>
              <Button
                variant="primary"
                onClick={() => handleSave(true)}
                disabled={saving}
                loading={saving}
              >
                Опублікувати
              </Button>
            </div>
          </div>
          <p className="text-mindflow-slate">
            Створіть професійний психологічний тест з автоматичним підрахунком результатів
          </p>
        </div>

        {/* Form Info */}
        <GlassCard className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Інформація про тест</h2>
          <div className="space-y-4">
            <Input
              label="Назва тесту"
              placeholder="напр. Шкала депресії Бека"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
            <Textarea
              label="Опис"
              placeholder="Коротко опишіть призначення тесту..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>
        </GlassCard>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActivePanel('questions')}
            className={`px-6 py-3 rounded-2xl font-medium transition-all ${
              activePanel === 'questions'
                ? 'bg-white/60 backdrop-blur-xl shadow-soft'
                : 'hover:bg-white/40'
            }`}
          >
            📋 Питання ({questions.length})
          </button>
          <button
            onClick={() => setActivePanel('scales')}
            className={`px-6 py-3 rounded-2xl font-medium transition-all ${
              activePanel === 'scales'
                ? 'bg-white/60 backdrop-blur-xl shadow-soft'
                : 'hover:bg-white/40'
            }`}
          >
            📊 Шкали оцінювання ({scoringScales.length})
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Panel - Question Types */}
          <div className="lg:col-span-3">
            {activePanel === 'questions' ? (
              <GlassCard className="p-4 sticky top-4">
                <h3 className="font-semibold mb-4">Типи питань</h3>
                <div className="space-y-2">
                  {questionTypes.map((qt) => (
                    <button
                      key={qt.type}
                      onClick={() => addQuestion(qt.type)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/40 transition-all text-left"
                    >
                      <span className="text-xl">{qt.icon}</span>
                      <span className="text-sm font-medium">{qt.label}</span>
                    </button>
                  ))}
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="p-4 sticky top-4">
                <h3 className="font-semibold mb-4">Шкали</h3>
                <Button onClick={addScoringScale} variant="secondary" fullWidth>
                  ➕ Додати шкалу
                </Button>
                <div className="mt-4 space-y-2">
                  {scoringScales.map((scale) => (
                    <div
                      key={scale.id}
                      className="p-3 rounded-xl bg-white/40 cursor-pointer hover:bg-white/60 transition-all"
                    >
                      <p className="font-medium text-sm">{scale.name || 'Нова шкала'}</p>
                      <p className="text-xs text-mindflow-slate">
                        {scale.minScore}-{scale.maxScore}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </div>

          {/* Main Canvas */}
          <div className="lg:col-span-9">
            {activePanel === 'questions' ? (
              <div className="space-y-4">
                {questions.length === 0 ? (
                  <GlassCard className="p-12 text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-2xl font-semibold mb-2">Додайте питання</h3>
                    <p className="text-mindflow-slate">Виберіть тип питання зліва для початку</p>
                  </GlassCard>
                ) : (
                  questions.map((question, index) => (
                    <GlassCard key={question.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {questionTypes.find((qt) => qt.type === question.type)?.icon}
                          </span>
                          <span className="font-medium text-mindflow-slate">
                            Питання {index + 1}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteQuestion(question.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>

                      <Input
                        label="Текст питання"
                        placeholder="Введіть ваше питання..."
                        value={question.title}
                        onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
                        className="mb-4"
                      />

                      {(question.type === 'single_choice' ||
                        question.type === 'multiple_choice' ||
                        question.type === 'likert') && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Варіанти відповідей
                          </label>
                          {question.options?.map((option, optIndex) => (
                            <div key={option.id} className="flex gap-2 mb-3">
                              <Input
                                placeholder={`Варіант ${optIndex + 1}`}
                                value={option.text}
                                onChange={(e) => {
                                  const newOptions = [...(question.options || [])]
                                  newOptions[optIndex].text = e.target.value
                                  updateQuestion(question.id, { options: newOptions })
                                }}
                              />
                              {scoringScales.length > 0 && (
                                <select
                                  className="px-3 py-2 rounded-xl bg-white/40 backdrop-blur-xl border border-white/30 text-sm"
                                  value={
                                    Object.keys(option.scoreWeights)[0] || scoringScales[0]?.id
                                  }
                                  onChange={(e) => {
                                    const scaleId = e.target.value
                                    const weight = option.scoreWeights[scaleId] || optIndex + 1
                                    const newOptions = [...(question.options || [])]
                                    newOptions[optIndex].scoreWeights = { [scaleId]: weight }
                                    updateQuestion(question.id, { options: newOptions })
                                  }}
                                >
                                  {scoringScales.map((scale) => (
                                    <option key={scale.id} value={scale.id}>
                                      {scale.name} (+{option.scoreWeights[scale.id] || optIndex + 1}
                                      )
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newOption = {
                                id: `${Date.now()}`,
                                text: '',
                                scoreWeights: {},
                              }
                              updateQuestion(question.id, {
                                options: [...(question.options || []), newOption],
                              })
                            }}
                          >
                            ➕ Додати варіант
                          </Button>
                        </div>
                      )}
                    </GlassCard>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {scoringScales.length === 0 ? (
                  <GlassCard className="p-12 text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-2xl font-semibold mb-2">Створіть шкалу оцінювання</h3>
                    <p className="text-mindflow-slate mb-6">
                      Додайте шкалу (напр. Депресія, Тривожність) для автоматичного підрахунку
                    </p>
                    <Button onClick={addScoringScale} variant="primary">
                      ➕ Додати шкалу
                    </Button>
                  </GlassCard>
                ) : (
                  scoringScales.map((scale, index) => (
                    <GlassCard key={scale.id} className="p-6">
                      <h3 className="font-semibold mb-4">Шкала {index + 1}</h3>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <Input
                          label="Назва шкали"
                          placeholder="напр. Депресія"
                          value={scale.name}
                          onChange={(e) => {
                            setScoringScales(
                              scoringScales.map((s) =>
                                s.id === scale.id ? { ...s, name: e.target.value } : s
                              )
                            )
                          }}
                        />
                        <Input
                          label="Максимальний бал"
                          type="number"
                          value={scale.maxScore}
                          onChange={(e) => {
                            setScoringScales(
                              scoringScales.map((s) =>
                                s.id === scale.id ? { ...s, maxScore: Number(e.target.value) } : s
                              )
                            )
                          }}
                        />
                      </div>
                      <Textarea
                        label="Опис"
                        placeholder="Опишіть що вимірює ця шкала..."
                        value={scale.description || ''}
                        onChange={(e) => {
                          setScoringScales(
                            scoringScales.map((s) =>
                              s.id === scale.id ? { ...s, description: e.target.value } : s
                            )
                          )
                        }}
                      />
                    </GlassCard>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
