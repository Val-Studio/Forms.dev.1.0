'use client'

import { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'

// Mock data
const mockTest = {
  id: '1',
  title: 'Шкала депресії Бека',
  description: 'Цей тест допоможе оцінити ваш поточний емоційний стан',
  questions: [
    {
      id: 'q1',
      type: 'likert',
      title: 'Як часто ви відчуваєте сум або пригніченість?',
      options: [
        { id: '1', text: 'Ніколи', value: 0 },
        { id: '2', text: 'Рідко', value: 1 },
        { id: '3', text: 'Іноді', value: 2 },
        { id: '4', text: 'Часто', value: 3 },
        { id: '5', text: 'Завжди', value: 4 },
      ],
    },
    {
      id: 'q2',
      type: 'likert',
      title: 'Чи втратили ви інтерес до діяльності, яка раніше приносила задоволення?',
      options: [
        { id: '1', text: 'Зовсім ні', value: 0 },
        { id: '2', text: 'Трохи', value: 1 },
        { id: '3', text: 'Помірно', value: 2 },
        { id: '4', text: 'Значно', value: 3 },
        { id: '5', text: 'Повністю', value: 4 },
      ],
    },
    {
      id: 'q3',
      type: 'likert',
      title: 'Як би ви оцінили ваш рівень енергії?',
      options: [
        { id: '1', text: 'Дуже високий', value: 0 },
        { id: '2', text: 'Нормальний', value: 1 },
        { id: '3', text: 'Знижений', value: 2 },
        { id: '4', text: 'Дуже низький', value: 3 },
        { id: '5', text: 'Немає енергії', value: 4 },
      ],
    },
  ],
}

export default function TestPage({ params }: { params: { id: string } }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [direction, setDirection] = useState(1) // 1 for forward, -1 for backward

  const currentQuestion = mockTest.questions[currentQuestionIndex]
  const totalQuestions = mockTest.questions.length
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100

  const handleAnswer = (value: any) => {
    setAnswers({ ...answers, [currentQuestion.id]: value })
  }

  const goNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setDirection(1)
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Submit test
      setIsCompleted(true)
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
              Ваш психолог отримає результати та зв'яжеться з вами
            </p>
            <div className="p-6 bg-white/40 rounded-2xl">
              <p className="text-sm text-mindflow-slate mb-2">Ваш результат</p>
              <p className="text-5xl font-bold mb-2">
                {Object.values(answers).reduce((sum: number, val: any) => sum + (val || 0), 0)}
              </p>
              <p className="text-sm text-mindflow-slate">балів</p>
            </div>
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
          <h1 className="text-2xl font-bold">{mockTest.title}</h1>
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

                {currentQuestion.type === 'likert' && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option: any) => (
                      <button
                        key={option.id}
                        onClick={() => handleAnswer(option.value)}
                        className={`w-full p-4 rounded-2xl text-left transition-all ${
                          answers[currentQuestion.id] === option.value
                            ? 'bg-gradient-primary text-white shadow-soft'
                            : 'bg-white/40 hover:bg-white/60'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              answers[currentQuestion.id] === option.value
                                ? 'border-white'
                                : 'border-mindflow-slate/30'
                            }`}
                          >
                            {answers[currentQuestion.id] === option.value && (
                              <div className="w-3 h-3 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="font-medium">{option.text}</span>
                        </div>
                      </button>
                    ))}
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
            disabled={answers[currentQuestion.id] === undefined}
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
