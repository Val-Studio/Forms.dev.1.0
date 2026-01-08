import { z } from 'zod'

// ============================================
// ENUMS для типів питань (18 типів)
// ============================================

export const QuestionTypeEnum = z.enum([
  // Група 1: Базові (7 типів)
  'short_text',
  'long_text',
  'single_choice',
  'multiple_choice',
  'dropdown',
  'date',
  'file_upload',

  // Група 2: Клінічні Шкали (3 типи)
  'likert',
  'matrix',
  'semantic_differential',

  // Група 3: Проективні та Візуальні (4 типи)
  'image_selection',
  'slider', // VAS
  'body_map',
  'drawing_canvas',

  // Група 4: Когнітивні та Інтерактивні (4 типи)
  'ranking',
  'timed_question',
  'audio_video_stimulus',
  'voice_response',

  // Група 5: Спеціальні (3 типи)
  'info_block',
  'section_break',
  'consent_form',
])

export type QuestionType = z.infer<typeof QuestionTypeEnum>

// ============================================
// Категорії питань для UI
// ============================================

export const QUESTION_CATEGORIES = {
  basic: {
    label: 'Базові',
    icon: '📝',
    types: [
      { type: 'short_text', label: 'Короткий текст', icon: '✏️', description: 'ПІБ, вік' },
      { type: 'long_text', label: 'Довгий текст', icon: '📄', description: 'Розгорнута відповідь' },
      { type: 'single_choice', label: 'Одиночний вибір', icon: '⭕', description: 'Радіо-кнопки' },
      { type: 'multiple_choice', label: 'Множинний вибір', icon: '☑️', description: 'Чекбокси' },
      { type: 'dropdown', label: 'Випадаючий список', icon: '📋', description: 'Для довгих списків' },
      { type: 'date', label: 'Дата/Час', icon: '📅', description: 'Календар' },
      { type: 'file_upload', label: 'Завантаження файлу', icon: '📎', description: 'PDF/JPG' },
    ],
  },
  clinical: {
    label: 'Клінічні Шкали',
    icon: '📊',
    types: [
      { type: 'likert', label: 'Шкала Лайкерта', icon: '📊', description: '1...5 або 1...7' },
      { type: 'matrix', label: 'Матриця (Grid)', icon: '▦', description: 'Таблиця питань' },
      { type: 'semantic_differential', label: 'Семантичний диференціал', icon: '↔️', description: 'Полярні прикметники' },
    ],
  },
  visual: {
    label: 'Візуальні та Проективні',
    icon: '🎨',
    types: [
      { type: 'image_selection', label: 'Вибір зображень', icon: '🖼️', description: 'МАК карти' },
      { type: 'slider', label: 'Повзунок (VAS)', icon: '🎚️', description: '0-100 без поділок' },
      { type: 'body_map', label: 'Карта тіла', icon: '🧍', description: 'Соматичні симптоми' },
      { type: 'drawing_canvas', label: 'Полотно для малювання', icon: '🎨', description: 'Дім-Дерево-Людина' },
    ],
  },
  interactive: {
    label: 'Когнітивні',
    icon: '🧠',
    types: [
      { type: 'ranking', label: 'Ранжування', icon: '↕️', description: 'Drag & Drop' },
      { type: 'timed_question', label: 'Питання з таймером', icon: '⏱️', description: 'Вимірювання реакції' },
      { type: 'audio_video_stimulus', label: 'Аудіо/Відео стимул', icon: '🎬', description: 'Медіа + питання' },
      { type: 'voice_response', label: 'Голосова відповідь', icon: '🎤', description: 'Запис аудіо' },
    ],
  },
  system: {
    label: 'Системні',
    icon: '⚙️',
    types: [
      { type: 'info_block', label: 'Інформаційний блок', icon: 'ℹ️', description: 'Текст/інструкція' },
      { type: 'section_break', label: 'Розділ', icon: '➖', description: 'Нова сторінка' },
      { type: 'consent_form', label: 'Згода', icon: '✅', description: 'GDPR' },
    ],
  },
} as const

// ============================================
// Налаштування для кожного типу питання
// ============================================

export const LikertSettingsSchema = z.object({
  min: z.number().default(1),
  max: z.number().default(5),
  minLabel: z.string().optional(),
  maxLabel: z.string().optional(),
  showNumbers: z.boolean().default(true),
})

export const MatrixSettingsSchema = z.object({
  rows: z.array(z.string()),
  columns: z.array(z.string()),
})

export const SliderSettingsSchema = z.object({
  min: z.number().default(0),
  max: z.number().default(100),
  step: z.number().default(1),
  showValue: z.boolean().default(false),
  gradient: z.boolean().default(true),
})

export const ImageSelectionSettingsSchema = z.object({
  images: z.array(z.object({
    url: z.string(),
    label: z.string().optional(),
  })),
  multipleSelection: z.boolean().default(false),
  layout: z.enum(['grid', 'carousel']).default('grid'),
})

export const BodyMapSettingsSchema = z.object({
  view: z.enum(['front', 'back', 'both']).default('both'),
  symptoms: z.array(z.string()).default(['Біль', 'Тепло', 'Стиснення', 'Поколювання']),
})

export const RankingSettingsSchema = z.object({
  items: z.array(z.string()),
})

export const TimedQuestionSettingsSchema = z.object({
  timeLimit: z.number().optional(), // секунди
  measureReaction: z.boolean().default(false),
})

export const AudioVideoStimulusSettingsSchema = z.object({
  mediaUrl: z.string(),
  mediaType: z.enum(['audio', 'video']),
  autoplay: z.boolean().default(false),
})

// ============================================
// Опція відповіді з ваговими коефіцієнтами
// ============================================

export const OptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  order: z.number(),
  scoreWeights: z.record(z.number()).default({}), // { scaleId: weight }
  image: z.string().optional(),
})

// ============================================
// Питання (з усіма типами)
// ============================================

// Safety Trigger для критичних відповідей
export const SafetyTriggerSchema = z.object({
  id: z.string(),
  optionId: z.string().optional(), // Якщо тригер спрацьовує на конкретний варіант
  type: z.enum(['suicide_risk', 'self_harm', 'violence', 'severe_depression', 'psychosis', 'custom']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  message: z.string(),
  alertPsychologist: z.boolean().default(true),
})

export const QuestionSchema = z.object({
  id: z.string(),
  type: QuestionTypeEnum,
  title: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(true),
  order: z.number(),

  // Варіанти (для choice типів)
  options: z.array(OptionSchema).optional(),

  // Специфічні налаштування
  settings: z.any().optional(), // Буде типізовано залежно від type

  // Safety Triggers для критичних відповідей
  safetyTriggers: z.array(SafetyTriggerSchema).optional(),
})

// ============================================
// Шкала оцінювання
// ============================================

export const InterpretationSchema = z.object({
  min: z.number(),
  max: z.number(),
  label: z.string(),
  color: z.enum(['green', 'yellow', 'orange', 'red', 'blue']),
  description: z.string().optional(),
})

export const ScoringScaleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  minScore: z.number().default(0),
  maxScore: z.number(),
  interpretations: z.array(InterpretationSchema),
  reverseScoring: z.boolean().default(false),
})

// ============================================
// Logic Jump (умовний перехід)
// ============================================

export const LogicConditionSchema = z.object({
  type: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains']),
  optionId: z.string().optional(),
  value: z.any(),
})

export const LogicActionSchema = z.object({
  type: z.enum(['jump_to', 'end_form', 'skip_to_section']),
  targetQuestionId: z.string().optional(),
  targetSectionId: z.string().optional(),
})

export const LogicJumpSchema = z.object({
  id: z.string(),
  questionId: z.string(),
  condition: LogicConditionSchema,
  action: LogicActionSchema,
})

// ============================================
// Повна форма (тест)
// ============================================

export const FormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Назва обов\'язкова'),
  description: z.string().optional(),

  questions: z.array(QuestionSchema),
  scoringScales: z.array(ScoringScaleSchema),
  logicJumps: z.array(LogicJumpSchema).optional(),

  // Налаштування відображення
  settings: z.object({
    showProgressBar: z.boolean().default(true),
    oneQuestionPerPage: z.boolean().default(true),
    allowBackNavigation: z.boolean().default(true),
    randomizeQuestions: z.boolean().default(false),
    theme: z.any().optional(),
  }).optional(),
})

export type Form = z.infer<typeof FormSchema>
export type Question = z.infer<typeof QuestionSchema>
export type Option = z.infer<typeof OptionSchema>
export type ScoringScale = z.infer<typeof ScoringScaleSchema>
export type LogicJump = z.infer<typeof LogicJumpSchema>
export type Interpretation = z.infer<typeof InterpretationSchema>
export type SafetyTrigger = z.infer<typeof SafetyTriggerSchema>

// ============================================
// AI Import JSON Schema
// ============================================

export const AIImportSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  scales: z.array(z.object({
    id: z.string(),
    name: z.string(),
    norm_min: z.number().default(0),
    norm_max: z.number(),
    interpretations: z.array(InterpretationSchema).optional(),
  })),
  questions: z.array(z.object({
    type: QuestionTypeEnum,
    text: z.string(),
    description: z.string().optional(),
    options: z.array(z.object({
      text: z.string(),
      weight: z.number(),
      scale_id: z.string(),
    })).optional(),
    settings: z.any().optional(),
  })),
})

export type AIImportData = z.infer<typeof AIImportSchema>
