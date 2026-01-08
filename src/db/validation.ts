import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { forms, questions, options, scoringScales, submissions, answers, logicJumps } from './schema'

// ============================================
// Basic Validation Schemas
// ============================================

export const insertFormSchema = createInsertSchema(forms)
export const selectFormSchema = createSelectSchema(forms)

export const insertQuestionSchema = createInsertSchema(questions)
export const selectQuestionSchema = createSelectSchema(questions)

export const insertOptionSchema = createInsertSchema(options)
export const selectOptionSchema = createSelectSchema(options)

export const insertScoringScaleSchema = createInsertSchema(scoringScales)
export const selectScoringScaleSchema = createSelectSchema(scoringScales)

export const insertLogicJumpSchema = createInsertSchema(logicJumps)
export const selectLogicJumpSchema = createSelectSchema(logicJumps)

export const insertSubmissionSchema = createInsertSchema(submissions)
export const selectSubmissionSchema = createSelectSchema(submissions)

export const insertAnswerSchema = createInsertSchema(answers)
export const selectAnswerSchema = createSelectSchema(answers)

// ============================================
// Type Exports
// ============================================

export type InsertForm = typeof forms.$inferInsert
export type SelectForm = typeof forms.$inferSelect

export type InsertQuestion = typeof questions.$inferInsert
export type SelectQuestion = typeof questions.$inferSelect

export type InsertOption = typeof options.$inferInsert
export type SelectOption = typeof options.$inferSelect

export type InsertScoringScale = typeof scoringScales.$inferInsert
export type SelectScoringScale = typeof scoringScales.$inferSelect

export type InsertLogicJump = typeof logicJumps.$inferInsert
export type SelectLogicJump = typeof logicJumps.$inferSelect

export type InsertSubmission = typeof submissions.$inferInsert
export type SelectSubmission = typeof submissions.$inferSelect

export type InsertAnswer = typeof answers.$inferInsert
export type SelectAnswer = typeof answers.$inferSelect
