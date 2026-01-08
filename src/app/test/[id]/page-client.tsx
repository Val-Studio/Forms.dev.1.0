'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { submitTestAnswers } from '@/app/actions/forms'

interface TestPageClientProps {
  form: any
}

export function TestPageClient({ form }: TestPageClientProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [direction, setDirection] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<any>(null)

  const currentQuestion = form.questions[currentQuestionIndex]
  const totalQuestions = form.questions.length
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  const handleAnswer = (value: any) => {
    setAnswers({ ...answers, [currentQuestion.id]: value })
  }

  const goNext = async () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setDirection(1)
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Submit test
      setSubmitting(true)
      try {
        const result = await submitTestAnswers(form.id, answers)
        setResult(result)
        setIsCompleted(true)
      } catch (error) {
        console.error('Error submitting test:', error)
        // Fallback: просто завершити без збереження
        setIsCompleted(true)
      } finally {
        setSubmitting(false)
      }
    }
  }

  const goBack = () => {
    if (currentQuestionIndex > 0) {
      setDirection(-1)
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -1000 : 1000,
      opacity: 0,
    }),
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-mindflow-cream to-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full"
        >
          <GlassCard className="p-12 text-center">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-4xl font-bold mb-4">Дякуємо за ваші відповіді!</h1>
            <p className="text-xl text-mindflow-slate mb-8">
              {result?.success
                ? 'Ваші результати збережено та відправлено психологу'
                : 'Тест завершено'}
            </p>

            {/* Результати по шкалах */}
            {result?.scores && Object.keys(result.scores).length > 0 && (
              <div className="space-y-4 mb-8">
                <h3 className="text-lg font-semibold">Ваші результати:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {form.scoringScales?.map((scale: any) => (
                    <div
                      key={scale.id}
                      className="p-6 bg-white/40 backdrop-blur-xl rounded-2xl"
                    >
                      <p className="text-sm text-mindflow-slate mb-2">{scale.name}</p>
                      <p className="text-4xl font-bold mb-2">{result.scores[scale.id] || 0}</p>
                      <p className="text-xs text-mindflow-slate">
                        з {scale.maxScore} можливих
                      </p>
                      {result.interpretations && result.interpretations[scale.id] && (
                        <div className="mt-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium inline-block bg-${
                              result.interpretations[scale.id].color
                            }-100 text-${result.interpretations[scale.id].color}-700`}
                          >
                            {result.interpretations[scale.id].label}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-sm text-mindflow-slate">
              Ваш психолог отримав результати та зв'яжеться з вами
            </p>
          </GlassCard>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-mindflow-cream to-white">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-white/40 backdrop-blur-xl z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-mindflow-teal to-mindflow-navy"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Header */}
      <div className="p-8 pb-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-sm font-medium text-mindflow-slate mb-1">
            Питання {currentQuestionIndex + 1} з {totalQuestions}
          </h2>
          <h1 className="text-2xl font-bold">{form.title}</h1>
        </div>
      </div>

      {/* Question Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-3xl w-full">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQuestionIndex}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
            >
              <GlassCard className="p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-balance">
                  {currentQuestion.title}
                </h2>

                {/* Likert Scale */}
                {currentQuestion.type === 'likert' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option: any, index: number) => (
                      <button
                        key={option.id}
                        onClick={() =>
                          handleAnswer({ optionId: option.id, value: index })
                        }
                        className={`w-full p-4 rounded-2xl text-left transition-all ${
                          answers[currentQuestion.id]?.optionId === option.id
                            ? 'bg-gradient-primary text-white shadow-soft'
                            : 'bg-white/40 hover:bg-white/60'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              answers[currentQuestion.id]?.optionId === option.id
                                ? 'border-white'
                                : 'border-mindflow-slate/30'
                            }`}
                          >
                            {answers[currentQuestion.id]?.optionId === option.id && (
                              <div className="w-3 h-3 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="font-medium">{option.text}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Single Choice */}
                {currentQuestion.type === 'single_choice' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option: any) => (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer({ optionId: option.id })}
                        className={`w-full p-4 rounded-2xl text-left transition-all ${
                          answers[currentQuestion.id]?.optionId === option.id
                            ? 'bg-gradient-primary text-white shadow-soft'
                            : 'bg-white/40 hover:bg-white/60'
                        }`}
                      >
                        <span className="font-medium">{option.text}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Yes/No */}
                {currentQuestion.type === 'yes_no' && (
                  <div className="grid grid-cols-2 gap-4">
                    {['Так', 'Ні'].map((answer, index) => (
                      <button
                        key={answer}
                        onClick={() => handleAnswer({ value: index === 0 })}
                        className={`p-6 rounded-2xl text-center font-semibold text-xl transition-all ${
                          answers[currentQuestion.id]?.value === (index === 0)
                            ? 'bg-gradient-primary text-white shadow-soft'
                            : 'bg-white/40 hover:bg-white/60'
                        }`}
                      >
                        {answer}
                      </button>
                    ))}
                  </div>
                )}

                {/* Text Input (short_text, long_text, text) */}
                {(currentQuestion.type === 'text' ||
                  currentQuestion.type === 'short_text' ||
                  currentQuestion.type === 'long_text') && (
                  <textarea
                    className={`w-full p-4 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-mindflow-teal/50 ${
                      currentQuestion.type === 'short_text' ? 'min-h-[60px]' : 'min-h-[120px]'
                    }`}
                    placeholder="Введіть вашу відповідь..."
                    value={answers[currentQuestion.id]?.text || ''}
                    onChange={(e) => handleAnswer({ text: e.target.value })}
                  />
                )}

                {/* Multiple Choice */}
                {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option: any) => {
                      const selected = answers[currentQuestion.id]?.optionIds || []
                      const isSelected = selected.includes(option.id)
                      return (
                        <button
                          key={option.id}
                          onClick={() => {
                            const current = answers[currentQuestion.id]?.optionIds || []
                            const newSelection = isSelected
                              ? current.filter((id: string) => id !== option.id)
                              : [...current, option.id]
                            handleAnswer({ optionIds: newSelection })
                          }}
                          className={`w-full p-4 rounded-2xl text-left transition-all ${
                            isSelected
                              ? 'bg-gradient-primary text-white shadow-soft'
                              : 'bg-white/40 hover:bg-white/60'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                                isSelected ? 'border-white bg-white/20' : 'border-mindflow-slate/30'
                              }`}
                            >
                              {isSelected && <span>✓</span>}
                            </div>
                            <span className="font-medium">{option.text}</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Dropdown */}
                {currentQuestion.type === 'dropdown' && currentQuestion.options && (
                  <select
                    className="w-full p-4 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-mindflow-teal/50"
                    value={answers[currentQuestion.id]?.optionId || ''}
                    onChange={(e) => handleAnswer({ optionId: e.target.value })}
                  >
                    <option value="">Виберіть варіант...</option>
                    {currentQuestion.options.map((option: any) => (
                      <option key={option.id} value={option.id}>
                        {option.text}
                      </option>
                    ))}
                  </select>
                )}

                {/* Date */}
                {currentQuestion.type === 'date' && (
                  <input
                    type="date"
                    className="w-full p-4 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-mindflow-teal/50"
                    value={answers[currentQuestion.id]?.date || ''}
                    onChange={(e) => handleAnswer({ date: e.target.value })}
                  />
                )}

                {/* Slider */}
                {currentQuestion.type === 'slider' && (
                  <div className="space-y-4">
                    <input
                      type="range"
                      min={currentQuestion.settings?.min || 0}
                      max={currentQuestion.settings?.max || 10}
                      step={currentQuestion.settings?.step || 1}
                      value={answers[currentQuestion.id]?.value || currentQuestion.settings?.min || 0}
                      onChange={(e) => handleAnswer({ value: Number(e.target.value) })}
                      className="w-full h-2 bg-white/40 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-center text-2xl font-bold">
                      {answers[currentQuestion.id]?.value || currentQuestion.settings?.min || 0}
                    </div>
                  </div>
                )}

                {/* Matrix */}
                {currentQuestion.type === 'matrix' &&
                  currentQuestion.settings?.rows &&
                  currentQuestion.settings?.columns && (
                    <>
                      {/* Desktop: Table view */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr>
                              <th className="p-2"></th>
                              {currentQuestion.settings.columns.map((col: string, i: number) => (
                                <th key={i} className="p-2 text-sm font-medium">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {currentQuestion.settings.rows.map((row: string, rowIndex: number) => (
                              <tr key={rowIndex}>
                                <td className="p-2 text-sm font-medium">{row}</td>
                                {currentQuestion.settings.columns.map((_: string, colIndex: number) => {
                                  const matrixAnswers = answers[currentQuestion.id]?.matrix || {}
                                  return (
                                    <td key={colIndex} className="p-2 text-center">
                                      <input
                                        type="radio"
                                        name={`matrix-${rowIndex}`}
                                        checked={matrixAnswers[rowIndex] === colIndex}
                                        onChange={() => {
                                          const newMatrix = { ...matrixAnswers, [rowIndex]: colIndex }
                                          handleAnswer({ matrix: newMatrix })
                                        }}
                                        className="w-5 h-5 cursor-pointer"
                                      />
                                    </td>
                                  )
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile: Card view */}
                      <div className="md:hidden space-y-4">
                        {currentQuestion.settings.rows.map((row: string, rowIndex: number) => {
                          const matrixAnswers = answers[currentQuestion.id]?.matrix || {}
                          return (
                            <div key={rowIndex} className="p-4 bg-white/60 rounded-2xl space-y-3">
                              <p className="font-medium text-sm">{row}</p>
                              <div className="space-y-2">
                                {currentQuestion.settings.columns.map((col: string, colIndex: number) => (
                                  <label
                                    key={colIndex}
                                    className="flex items-center gap-3 p-2 rounded-xl cursor-pointer hover:bg-white/40 transition-colors"
                                  >
                                    <input
                                      type="radio"
                                      name={`matrix-mobile-${rowIndex}`}
                                      checked={matrixAnswers[rowIndex] === colIndex}
                                      onChange={() => {
                                        const newMatrix = { ...matrixAnswers, [rowIndex]: colIndex }
                                        handleAnswer({ matrix: newMatrix })
                                      }}
                                      className="w-5 h-5 cursor-pointer"
                                    />
                                    <span className="text-sm">{col}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}

                {/* Semantic Differential */}
                {currentQuestion.type === 'semantic_differential' && (
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm font-medium mb-2">
                      <span>{currentQuestion.settings?.leftLabel || 'Негативно'}</span>
                      <span>{currentQuestion.settings?.rightLabel || 'Позитивно'}</span>
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      {Array.from({ length: currentQuestion.settings?.steps || 7 }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer({ value: i })}
                          className={`flex-1 h-12 rounded-xl transition-all ${
                            answers[currentQuestion.id]?.value === i
                              ? 'bg-gradient-primary text-white shadow-soft'
                              : 'bg-white/40 hover:bg-white/60'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ranking */}
                {currentQuestion.type === 'ranking' && currentQuestion.options && (
                  <div className="space-y-3">
                    <p className="text-sm text-mindflow-slate mb-3">
                      Перетягніть для сортування від найважливішого до найменш важливого
                    </p>
                    {(answers[currentQuestion.id]?.ranking || currentQuestion.options).map(
                      (option: any, index: number) => (
                        <div
                          key={option.id}
                          className="flex items-center gap-3 p-4 bg-white/40 rounded-2xl"
                        >
                          <span className="text-2xl font-bold text-mindflow-teal">
                            {index + 1}
                          </span>
                          <span className="flex-1">{option.text}</span>
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* File Upload */}
                {currentQuestion.type === 'file_upload' && (
                  <div>
                    <input
                      type="file"
                      accept={currentQuestion.settings?.allowedTypes?.join(',') || '*'}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleAnswer({ file: file.name, fileSize: file.size })
                        }
                      }}
                      className="w-full p-4 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/30"
                    />
                    {currentQuestion.settings?.maxSize && (
                      <p className="text-xs text-mindflow-slate mt-2">
                        Максимальний розмір: {currentQuestion.settings.maxSize} MB
                      </p>
                    )}
                  </div>
                )}

                {/* Image Selection */}
                {currentQuestion.type === 'image_selection' && currentQuestion.options && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {currentQuestion.options.map((option: any) => (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer({ optionId: option.id })}
                        className={`p-4 rounded-2xl transition-all ${
                          answers[currentQuestion.id]?.optionId === option.id
                            ? 'ring-4 ring-mindflow-teal'
                            : 'hover:ring-2 ring-white/40'
                        }`}
                      >
                        <div className="aspect-square bg-white/60 rounded-xl mb-2 flex items-center justify-center text-4xl">
                          {option.emoji || '🖼️'}
                        </div>
                        <p className="text-sm text-center">{option.text}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Info Block */}
                {currentQuestion.type === 'info_block' && (
                  <div className="p-6 bg-blue-50 rounded-2xl">
                    <p className="text-mindflow-navy whitespace-pre-wrap">
                      {currentQuestion.description || currentQuestion.title}
                    </p>
                  </div>
                )}

                {/* Consent Form */}
                {currentQuestion.type === 'consent_form' && (
                  <div className="space-y-4">
                    <div className="p-6 bg-white/60 rounded-2xl max-h-64 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap">
                        {currentQuestion.description || 'Текст згоди'}
                      </p>
                    </div>
                    <label className="flex items-center gap-3 p-4 bg-white/40 rounded-2xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={answers[currentQuestion.id]?.consent || false}
                        onChange={(e) => handleAnswer({ consent: e.target.checked })}
                        className="w-5 h-5"
                      />
                      <span className="font-medium">Я погоджуюсь з умовами</span>
                    </label>
                  </div>
                )}

                {/* Timed Question */}
                {currentQuestion.type === 'timed_question' && currentQuestion.options && (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <div className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-full font-semibold">
                        ⏱️ {currentQuestion.settings?.timeLimit || 30} секунд
                      </div>
                    </div>
                    <div className="space-y-3">
                      {currentQuestion.options.map((option: any) => (
                        <button
                          key={option.id}
                          onClick={() => handleAnswer({ optionId: option.id })}
                          className={`w-full p-4 rounded-2xl text-left transition-all ${
                            answers[currentQuestion.id]?.optionId === option.id
                              ? 'bg-gradient-primary text-white shadow-soft'
                              : 'bg-white/40 hover:bg-white/60'
                          }`}
                        >
                          {option.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-8 pt-4">
        <div className="max-w-3xl mx-auto flex gap-4">
          {currentQuestionIndex > 0 && (
            <Button variant="secondary" onClick={goBack}>
              ← Назад
            </Button>
          )}
          <Button
            variant="primary"
            onClick={goNext}
            disabled={answers[currentQuestion.id] === undefined || submitting}
            loading={submitting}
            fullWidth
            className="ml-auto"
          >
            {currentQuestionIndex === totalQuestions - 1 ? 'Завершити' : 'Далі →'}
          </Button>
        </div>
      </div>
    </div>
  )
}
