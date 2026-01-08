/**
 * Logic Jump Validator
 * Перевіряє граф переходів на циклічні петлі та мертві гілки
 */

import type { LogicJump, Question } from './schemas'

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  type: 'cycle' | 'dead_end' | 'missing_target' | 'invalid_condition'
  message: string
  questionId?: string
  jumpId?: string
  path?: string[]
}

export interface ValidationWarning {
  type: 'unreachable' | 'no_jumps' | 'incomplete_coverage'
  message: string
  questionId?: string
}

/**
 * Валідує всі Logic Jumps на наявність циклів та інших проблем
 */
export function validateLogicJumps(
  questions: Question[],
  logicJumps: LogicJump[]
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // 1. Перевірка на відсутні цілі
  for (const jump of logicJumps) {
    if (jump.action.targetQuestionId && jump.action.targetQuestionId !== 'END') {
      const targetExists = questions.some((q) => q.id === jump.action.targetQuestionId)
      if (!targetExists) {
        errors.push({
          type: 'missing_target',
          message: `Питання "${jump.action.targetQuestionId}" не існує`,
          jumpId: jump.id,
          questionId: jump.questionId,
        })
      }
    }
  }

  // 2. Перевірка на цикли (DFS алгоритм)
  const cycles = detectCycles(questions, logicJumps)
  errors.push(...cycles)

  // 3. Перевірка на недосяжні питання
  const unreachable = findUnreachableQuestions(questions, logicJumps)
  warnings.push(...unreachable)

  // 4. Перевірка на неповне покриття варіантів
  const incomplete = findIncompleteJumps(questions, logicJumps)
  warnings.push(...incomplete)

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Алгоритм виявлення циклів за допомогою DFS
 */
function detectCycles(questions: Question[], logicJumps: LogicJump[]): ValidationError[] {
  const errors: ValidationError[] = []
  const visited = new Set<string>()
  const recursionStack = new Set<string>()
  const questionMap = new Map(questions.map((q) => [q.id, q]))

  function dfs(questionId: string, path: string[]): boolean {
    if (recursionStack.has(questionId)) {
      // Знайдено цикл!
      const cycleStart = path.indexOf(questionId)
      const cyclePath = path.slice(cycleStart)
      errors.push({
        type: 'cycle',
        message: `Виявлено циклічну петлю: ${cyclePath.map((id) => questionMap.get(id)?.title || id).join(' → ')} → ${questionMap.get(questionId)?.title || questionId}`,
        path: [...cyclePath, questionId],
      })
      return true
    }

    if (visited.has(questionId)) {
      return false
    }

    visited.add(questionId)
    recursionStack.add(questionId)
    path.push(questionId)

    // Знайти всі переходи з цього питання
    const jumpsFromQuestion = logicJumps.filter((j) => j.questionId === questionId)

    for (const jump of jumpsFromQuestion) {
      const target = jump.action.targetQuestionId
      if (target && target !== 'END') {
        dfs(target, [...path])
      }
    }

    recursionStack.delete(questionId)
    return false
  }

  // Перевірити кожне питання як можливу точку входу
  for (const question of questions) {
    if (!visited.has(question.id)) {
      dfs(question.id, [])
    }
  }

  return errors
}

/**
 * Знаходить питання, до яких неможливо дійти
 */
function findUnreachableQuestions(
  questions: Question[],
  logicJumps: LogicJump[]
): ValidationWarning[] {
  const warnings: ValidationWarning[] = []

  // Питання, до яких можна дійти через jumps
  const reachableFromJumps = new Set<string>()
  for (const jump of logicJumps) {
    if (jump.action.targetQuestionId && jump.action.targetQuestionId !== 'END') {
      reachableFromJumps.add(jump.action.targetQuestionId)
    }
  }

  // Перше питання завжди досяжне
  const firstQuestion = questions[0]
  if (!firstQuestion) return warnings

  const reachable = new Set<string>([firstQuestion.id])

  // Якщо є jumps, перевіряємо чи всі питання досяжні
  if (logicJumps.length > 0) {
    // Питання досяжне, якщо воно в природному порядку ДО першого jump
    // або якщо на нього є jump
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      const hasJumpsFromPrev = logicJumps.some(
        (j) => questions.findIndex((quest) => quest.id === j.questionId) < i
      )

      if (!hasJumpsFromPrev || i === 0) {
        reachable.add(q.id)
      } else if (reachableFromJumps.has(q.id)) {
        reachable.add(q.id)
      }
    }

    // Знайти недосяжні
    for (const question of questions) {
      if (!reachable.has(question.id) && !reachableFromJumps.has(question.id)) {
        warnings.push({
          type: 'unreachable',
          message: `Питання "${question.title || question.id}" може бути недосяжним через умовні переходи`,
          questionId: question.id,
        })
      }
    }
  }

  return warnings
}

/**
 * Знаходить питання, де не всі варіанти мають jumps
 */
function findIncompleteJumps(questions: Question[], logicJumps: LogicJump[]): ValidationWarning[] {
  const warnings: ValidationWarning[] = []

  for (const question of questions) {
    const jumpsForQuestion = logicJumps.filter((j) => j.questionId === question.id)

    if (jumpsForQuestion.length > 0 && question.options && question.options.length > 0) {
      // Перевірити чи є jump для кожного варіанту
      const coveredOptions = new Set(
        jumpsForQuestion.map((j) => j.condition.value).filter(Boolean)
      )

      if (coveredOptions.size < question.options.length && coveredOptions.size > 0) {
        warnings.push({
          type: 'incomplete_coverage',
          message: `Не для всіх варіантів налаштовані переходи. Деякі респонденти можуть отримати непередбачувану поведінку.`,
          questionId: question.id,
        })
      }
    }
  }

  return warnings
}

/**
 * Швидка перевірка перед збереженням
 */
export function quickValidate(questions: Question[], logicJumps: LogicJump[]): boolean {
  const result = validateLogicJumps(questions, logicJumps)
  return result.isValid
}
