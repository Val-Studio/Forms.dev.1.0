import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Question, ScoringScale, LogicJump } from '@/lib/schemas'

interface FormBuilderState {
  // Form metadata
  formId: string | null
  title: string
  description: string

  // Questions
  questions: Question[]
  selectedQuestionId: string | null

  // Scoring
  scoringScales: ScoringScale[]
  selectedScaleId: string | null

  // Logic
  logicJumps: LogicJump[]

  // UI State
  activePanel: 'questions' | 'scales' | 'logic' | 'settings'
  isDragging: boolean

  // Actions
  setFormId: (id: string) => void
  setTitle: (title: string) => void
  setDescription: (description: string) => void

  // Questions
  addQuestion: (type: Question['type']) => void
  updateQuestion: (id: string, updates: Partial<Question>) => void
  deleteQuestion: (id: string) => void
  duplicateQuestion: (id: string) => void
  reorderQuestions: (startIndex: number, endIndex: number) => void
  selectQuestion: (id: string | null) => void

  // Scoring Scales
  addScoringScale: () => void
  updateScoringScale: (id: string, updates: Partial<ScoringScale>) => void
  deleteScoringScale: (id: string) => void
  selectScale: (id: string | null) => void

  // Logic Jumps
  addLogicJump: (questionId: string) => void
  updateLogicJump: (id: string, updates: Partial<LogicJump>) => void
  deleteLogicJump: (id: string) => void

  // UI
  setActivePanel: (panel: FormBuilderState['activePanel']) => void
  setIsDragging: (isDragging: boolean) => void

  // Bulk actions
  importFromJSON: (data: any) => void
  resetForm: () => void
  getFormData: () => any
}

const initialState = {
  formId: null,
  title: '',
  description: '',
  questions: [],
  selectedQuestionId: null,
  scoringScales: [],
  selectedScaleId: null,
  logicJumps: [],
  activePanel: 'questions' as const,
  isDragging: false,
}

export const useFormBuilder = create<FormBuilderState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setFormId: (id) => set({ formId: id }),
      setTitle: (title) => set({ title }),
      setDescription: (description) => set({ description }),

      // Questions
      addQuestion: (type) => {
        const newQuestion: Question = {
          id: `q-${Date.now()}`,
          type,
          title: '',
          description: '',
          required: true,
          order: get().questions.length,
          options:
            type === 'single_choice' ||
            type === 'multiple_choice' ||
            type === 'dropdown' ||
            type === 'likert'
              ? [
                  { id: '1', text: '', order: 0, scoreWeights: {} },
                  { id: '2', text: '', order: 1, scoreWeights: {} },
                ]
              : undefined,
          settings: getDefaultSettings(type),
        }
        set((state) => ({
          questions: [...state.questions, newQuestion],
          selectedQuestionId: newQuestion.id,
        }))
      },

      updateQuestion: (id, updates) =>
        set((state) => ({
          questions: state.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
        })),

      deleteQuestion: (id) =>
        set((state) => ({
          questions: state.questions.filter((q) => q.id !== id).map((q, index) => ({ ...q, order: index })),
          selectedQuestionId: state.selectedQuestionId === id ? null : state.selectedQuestionId,
        })),

      duplicateQuestion: (id) => {
        const question = get().questions.find((q) => q.id === id)
        if (!question) return

        const newQuestion: Question = {
          ...question,
          id: `q-${Date.now()}`,
          order: get().questions.length,
          title: `${question.title} (копія)`,
        }
        set((state) => ({
          questions: [...state.questions, newQuestion],
        }))
      },

      reorderQuestions: (startIndex, endIndex) => {
        const result = Array.from(get().questions)
        const [removed] = result.splice(startIndex, 1)
        result.splice(endIndex, 0, removed)
        set({
          questions: result.map((q, index) => ({ ...q, order: index })),
        })
      },

      selectQuestion: (id) => set({ selectedQuestionId: id }),

      // Scoring Scales
      addScoringScale: () => {
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
          reverseScoring: false,
        }
        set((state) => ({
          scoringScales: [...state.scoringScales, newScale],
          selectedScaleId: newScale.id,
        }))
      },

      updateScoringScale: (id, updates) =>
        set((state) => ({
          scoringScales: state.scoringScales.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        })),

      deleteScoringScale: (id) =>
        set((state) => ({
          scoringScales: state.scoringScales.filter((s) => s.id !== id),
          selectedScaleId: state.selectedScaleId === id ? null : state.selectedScaleId,
        })),

      selectScale: (id) => set({ selectedScaleId: id }),

      // Logic Jumps
      addLogicJump: (questionId) => {
        const newJump: LogicJump = {
          id: `jump-${Date.now()}`,
          questionId,
          condition: {
            type: 'equals',
            value: null,
          },
          action: {
            type: 'jump_to',
          },
        }
        set((state) => ({
          logicJumps: [...state.logicJumps, newJump],
        }))
      },

      updateLogicJump: (id, updates) =>
        set((state) => ({
          logicJumps: state.logicJumps.map((j) => (j.id === id ? { ...j, ...updates } : j)),
        }))  ,

      deleteLogicJump: (id) =>
        set((state) => ({
          logicJumps: state.logicJumps.filter((j) => j.id !== id),
        })),

      // UI
      setActivePanel: (panel) => set({ activePanel: panel }),
      setIsDragging: (isDragging) => set({ isDragging }),

      // Bulk actions
      importFromJSON: (data) => {
        // Конвертація AI JSON в наш формат
        const questions: Question[] = data.questions.map((q: any, index: number) => ({
          id: `q-${Date.now()}-${index}`,
          type: q.type,
          title: q.text,
          description: q.description,
          required: true,
          order: index,
          options: q.options?.map((opt: any, optIndex: number) => ({
            id: `opt-${Date.now()}-${optIndex}`,
            text: opt.text,
            order: optIndex,
            scoreWeights: { [opt.scale_id]: opt.weight },
          })),
          settings: q.settings,
        }))

        const scoringScales: ScoringScale[] = data.scales.map((scale: any) => ({
          id: scale.id,
          name: scale.name,
          description: '',
          minScore: scale.norm_min || 0,
          maxScore: scale.norm_max,
          interpretations: scale.interpretations || [
            { min: 0, max: scale.norm_max * 0.25, label: 'Низький', color: 'green' },
            { min: scale.norm_max * 0.26, max: scale.norm_max * 0.5, label: 'Помірний', color: 'yellow' },
            { min: scale.norm_max * 0.51, max: scale.norm_max * 0.75, label: 'Високий', color: 'orange' },
            { min: scale.norm_max * 0.76, max: scale.norm_max, label: 'Дуже високий', color: 'red' },
          ],
          reverseScoring: false,
        }))

        set({
          title: data.title,
          description: data.description || '',
          questions,
          scoringScales,
          logicJumps: [],
        })
      },

      resetForm: () => set(initialState),

      getFormData: () => {
        const state = get()
        return {
          title: state.title,
          description: state.description,
          questions: state.questions,
          scoringScales: state.scoringScales,
          logicJumps: state.logicJumps,
        }
      },
    }),
    { name: 'FormBuilder' }
  )
)

// Helpers
function getDefaultSettings(type: Question['type']): any {
  switch (type) {
    case 'likert':
      return { min: 1, max: 5, minLabel: 'Зовсім не згоден', maxLabel: 'Повністю згоден', showNumbers: true }
    case 'matrix':
      return { rows: [''], columns: [''] }
    case 'slider':
      return { min: 0, max: 100, step: 1, showValue: false, gradient: true }
    case 'ranking':
      return { items: ['Варіант 1', 'Варіант 2', 'Варіант 3'] }
    case 'image_selection':
      return { images: [], multipleSelection: false, layout: 'grid' }
    case 'body_map':
      return { view: 'both', symptoms: ['Біль', 'Тепло', 'Стиснення'] }
    case 'timed_question':
      return { timeLimit: undefined, measureReaction: false }
    case 'semantic_differential':
      return { leftLabel: '', rightLabel: '', steps: 7 }
    default:
      return {}
  }
}
