'use client'

import { useState } from 'react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { GlassCard } from './ui/GlassCard'
import type { Question, ScoringScale } from '@/lib/schemas'

interface BulkEditScoresModalProps {
  isOpen: boolean
  onClose: () => void
  question: Question
  scales: ScoringScale[]
  onApply: (updates: Record<string, Record<string, number>>) => void
}

export function BulkEditScoresModal({
  isOpen,
  onClose,
  question,
  scales,
  onApply,
}: BulkEditScoresModalProps) {
  const [mode, setMode] = useState<'sequential' | 'constant' | 'custom'>('sequential')
  const [selectedScale, setSelectedScale] = useState<string>(scales[0]?.id || '')
  const [sequentialStart, setSequentialStart] = useState(0)
  const [sequentialStep, setSequentialStep] = useState(1)
  const [constantValue, setConstantValue] = useState(0)

  if (!isOpen || !question.options) return null

  const handleApply = () => {
    const updates: Record<string, Record<string, number>> = {}

    question.options?.forEach((option, index) => {
      if (!updates[option.id]) {
        updates[option.id] = {}
      }

      if (mode === 'sequential') {
        updates[option.id][selectedScale] = sequentialStart + index * sequentialStep
      } else if (mode === 'constant') {
        updates[option.id][selectedScale] = constantValue
      }
    })

    onApply(updates)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Масове редагування балів</h2>
          <button
            onClick={onClose}
            className="text-mindflow-slate hover:text-mindflow-navy transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Вибір шкали */}
          <div>
            <label className="block text-sm font-medium mb-2">Шкала для редагування</label>
            <select
              value={selectedScale}
              onChange={(e) => setSelectedScale(e.target.value)}
              className="w-full p-3 rounded-2xl bg-white/40 backdrop-blur-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-mindflow-teal/50"
            >
              {scales.map((scale) => (
                <option key={scale.id} value={scale.id}>
                  {scale.name || 'Без назви'}
                </option>
              ))}
            </select>
          </div>

          {/* Режим редагування */}
          <div>
            <label className="block text-sm font-medium mb-3">Режим присвоєння балів</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-white/40 transition-colors">
                <input
                  type="radio"
                  name="mode"
                  value="sequential"
                  checked={mode === 'sequential'}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium">Послідовні бали</p>
                  <p className="text-xs text-mindflow-slate">
                    Варіант 1: {sequentialStart}, Варіант 2: {sequentialStart + sequentialStep},
                    Варіант 3: {sequentialStart + sequentialStep * 2}, ...
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-white/40 transition-colors">
                <input
                  type="radio"
                  name="mode"
                  value="constant"
                  checked={mode === 'constant'}
                  onChange={(e) => setMode(e.target.value as any)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <p className="font-medium">Однакові бали</p>
                  <p className="text-xs text-mindflow-slate">
                    Всім варіантам присвоїти однакове значення
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Налаштування режиму */}
          {mode === 'sequential' && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Початкове значення"
                type="number"
                value={sequentialStart}
                onChange={(e) => setSequentialStart(Number(e.target.value))}
                placeholder="0"
              />
              <Input
                label="Крок"
                type="number"
                value={sequentialStep}
                onChange={(e) => setSequentialStep(Number(e.target.value))}
                placeholder="1"
              />
            </div>
          )}

          {mode === 'constant' && (
            <Input
              label="Значення для всіх варіантів"
              type="number"
              value={constantValue}
              onChange={(e) => setConstantValue(Number(e.target.value))}
              placeholder="0"
            />
          )}

          {/* Попередній перегляд */}
          <div className="pt-4 border-t border-white/20">
            <h3 className="font-semibold mb-3">Попередній перегляд</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {question.options?.map((option, index) => {
                let score = 0
                if (mode === 'sequential') {
                  score = sequentialStart + index * sequentialStep
                } else if (mode === 'constant') {
                  score = constantValue
                }

                return (
                  <div
                    key={option.id}
                    className="flex items-center justify-between p-3 bg-white/40 rounded-xl"
                  >
                    <span className="text-sm">
                      {option.text || `Варіант ${index + 1}`}
                    </span>
                    <span className="font-semibold text-mindflow-teal">{score} балів</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Кнопки дій */}
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={onClose} fullWidth>
              Скасувати
            </Button>
            <Button onClick={handleApply} fullWidth>
              Застосувати
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
