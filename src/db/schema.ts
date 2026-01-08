import { pgTable, text, timestamp, integer, boolean, jsonb, pgEnum, uuid, real } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ============================================
// ENUMS
// ============================================

export const questionTypeEnum = pgEnum('question_type', [
  'likert',        // Шкала Лайкерта (1-5, 1-7)
  'matrix',        // Матриця питань з однаковими варіантами
  'multiple_choice', // Множинний вибір
  'single_choice',   // Одиночний вибір
  'text',          // Текстова відповідь
  'slider',        // Visual Analog Scale (повзунок)
  'yes_no',        // Так/Ні
  'rating',        // Рейтинг зірками
])

export const formStatusEnum = pgEnum('form_status', [
  'draft',
  'published',
  'archived',
])

export const submissionStatusEnum = pgEnum('submission_status', [
  'in_progress',
  'completed',
  'abandoned',
])

// ============================================
// USERS (Психологи)
// ============================================

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  organization: text('organization'),
  specialization: text('specialization'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================
// PATIENTS (Клієнти)
// ============================================

export const patients = pgTable('patients', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: text('name'),
  email: text('email'),
  phone: text('phone'),
  dateOfBirth: timestamp('date_of_birth'),
  isAnonymous: boolean('is_anonymous').default(false).notNull(),
  metadata: jsonb('metadata'), // Додаткові дані про пацієнта
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================
// FORMS (Психологічні тести)
// ============================================

export const forms = pgTable('forms', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: formStatusEnum('status').default('draft').notNull(),

  // Налаштування відображення
  showProgressBar: boolean('show_progress_bar').default(true).notNull(),
  oneQuestionPerPage: boolean('one_question_per_page').default(true).notNull(),
  allowBackNavigation: boolean('allow_back_navigation').default(false).notNull(),
  randomizeQuestions: boolean('randomize_questions').default(false).notNull(),

  // Налаштування доступу
  isPublic: boolean('is_public').default(true).notNull(),
  requiresAuth: boolean('requires_auth').default(false).notNull(),
  expiresAt: timestamp('expires_at'),

  // Брендинг
  theme: jsonb('theme'), // Кольори, логотип

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================
// SCORING SCALES (Шкали оцінювання)
// ============================================

export const scoringScales = pgTable('scoring_scales', {
  id: uuid('id').defaultRandom().primaryKey(),
  formId: uuid('form_id').references(() => forms.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(), // напр. "Депресія", "Тривожність"
  description: text('description'),
  minScore: real('min_score').default(0).notNull(),
  maxScore: real('max_score').notNull(),

  // Інтерпретація результатів
  interpretations: jsonb('interpretations').notNull(),
  // Приклад: [
  //   { min: 0, max: 10, label: "Мінімальна депресія", color: "green" },
  //   { min: 11, max: 20, label: "Легка депресія", color: "yellow" },
  //   { min: 21, max: 30, label: "Помірна депресія", color: "orange" },
  //   { min: 31, max: 63, label: "Важка депресія", color: "red" }
  // ]

  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ============================================
// QUESTIONS (Питання)
// ============================================

export const questions = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  formId: uuid('form_id').references(() => forms.id, { onDelete: 'cascade' }).notNull(),
  type: questionTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),

  // Порядок відображення
  order: integer('order').notNull(),

  // Обов'язковість
  required: boolean('required').default(true).notNull(),

  // Налаштування для конкретних типів
  settings: jsonb('settings'),
  // Приклад для likert: { min: 1, max: 5, minLabel: "Зовсім не згоден", maxLabel: "Повністю згоден" }
  // Приклад для slider: { min: 0, max: 100, step: 1 }
  // Приклад для matrix: { rows: ["Питання 1", "Питання 2"], columns: ["Ніколи", "Іноді", "Часто"] }

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================
// OPTIONS (Варіанти відповідей)
// ============================================

export const options = pgTable('options', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),
  text: text('text').notNull(),
  order: integer('order').notNull(),

  // ⭐ КЛЮЧОВА ОСОБЛИВІСТЬ: Вага відповіді для кожної шкали
  scoreWeights: jsonb('score_weights').notNull(),
  // Приклад: { "depression_scale_id": 3, "anxiety_scale_id": 1 }
  // Якщо користувач вибере цю відповідь, додається 3 бали до шкали депресії та 1 до тривожності

  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ============================================
// LOGIC JUMPS (Логічні переходи)
// ============================================

export const logicJumps = pgTable('logic_jumps', {
  id: uuid('id').defaultRandom().primaryKey(),
  questionId: uuid('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),

  // Умова: "Якщо відповідь = X"
  condition: jsonb('condition').notNull(),
  // Приклад: { type: "equals", optionId: "uuid", value: "Так" }

  // Дія: "Перейти до питання Y" або "Завершити тест"
  action: jsonb('action').notNull(),
  // Приклад: { type: "jump_to", targetQuestionId: "uuid" }
  // Приклад: { type: "end_form" }

  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ============================================
// SUBMISSIONS (Проходження тестів)
// ============================================

export const submissions = pgTable('submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  formId: uuid('form_id').references(() => forms.id, { onDelete: 'cascade' }).notNull(),
  patientId: uuid('patient_id').references(() => patients.id, { onDelete: 'set null' }),

  status: submissionStatusEnum('status').default('in_progress').notNull(),

  // Результати по шкалах
  scores: jsonb('scores'),
  // Приклад: { "depression_scale_id": 24, "anxiety_scale_id": 15 }

  // Інтерпретації
  interpretations: jsonb('interpretations'),
  // Приклад: { "depression_scale_id": { label: "Помірна депресія", color: "orange" } }

  // Час проходження
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),

  // IP та User Agent для аналітики (опціонально)
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================
// ANSWERS (Відповіді)
// ============================================

export const answers = pgTable('answers', {
  id: uuid('id').defaultRandom().primaryKey(),
  submissionId: uuid('submission_id').references(() => submissions.id, { onDelete: 'cascade' }).notNull(),
  questionId: uuid('question_id').references(() => questions.id, { onDelete: 'cascade' }).notNull(),

  // Відповідь (залежить від типу питання)
  value: jsonb('value').notNull(),
  // Приклад для single_choice: { optionId: "uuid" }
  // Приклад для multiple_choice: { optionIds: ["uuid1", "uuid2"] }
  // Приклад для text: { text: "Моя відповідь" }
  // Приклад для likert/slider: { value: 4 }

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  forms: many(forms),
  patients: many(patients),
}))

export const patientsRelations = relations(patients, ({ one, many }) => ({
  user: one(users, {
    fields: [patients.userId],
    references: [users.id],
  }),
  submissions: many(submissions),
}))

export const formsRelations = relations(forms, ({ one, many }) => ({
  user: one(users, {
    fields: [forms.userId],
    references: [users.id],
  }),
  questions: many(questions),
  scoringScales: many(scoringScales),
  submissions: many(submissions),
}))

export const questionsRelations = relations(questions, ({ one, many }) => ({
  form: one(forms, {
    fields: [questions.formId],
    references: [forms.id],
  }),
  options: many(options),
  logicJumps: many(logicJumps),
  answers: many(answers),
}))

export const optionsRelations = relations(options, ({ one }) => ({
  question: one(questions, {
    fields: [options.questionId],
    references: [questions.id],
  }),
}))

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  form: one(forms, {
    fields: [submissions.formId],
    references: [forms.id],
  }),
  patient: one(patients, {
    fields: [submissions.patientId],
    references: [patients.id],
  }),
  answers: many(answers),
}))

export const answersRelations = relations(answers, ({ one }) => ({
  submission: one(submissions, {
    fields: [answers.submissionId],
    references: [submissions.id],
  }),
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}))

export const scoringScalesRelations = relations(scoringScales, ({ one }) => ({
  form: one(forms, {
    fields: [scoringScales.formId],
    references: [forms.id],
  }),
}))

export const logicJumpsRelations = relations(logicJumps, ({ one }) => ({
  question: one(questions, {
    fields: [logicJumps.questionId],
    references: [questions.id],
  }),
}))
