'use client'

import { useState } from 'react'
import { GlassCard } from './ui/GlassCard'
import { Button } from './ui/Button'
import { Textarea } from './ui/Textarea'
import { useFormBuilder } from '@/store/formBuilder'
import { AIImportSchema } from '@/lib/schemas'

interface AIImportModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AIImportModal({ isOpen, onClose }: AIImportModalProps) {
  const [jsonInput, setJsonInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<any>(null)
  const importFromJSON = useFormBuilder((state) => state.importFromJSON)

  if (!isOpen) return null

  const handleValidate = () => {
    setError(null)

    if (!jsonInput.trim()) {
      setError('Будь ласка, вставте JSON у поле вводу')
      return
    }

    try {
      const parsed = JSON.parse(jsonInput)

      // Перевірка базових полів
      if (!parsed.title) {
        setError('❌ JSON не містить поле "title" (назва тесту)')
        setPreview(null)
        return
      }

      if (!parsed.scales || !Array.isArray(parsed.scales)) {
        setError('❌ JSON не містить поле "scales" або воно не є масивом')
        setPreview(null)
        return
      }

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        setError('❌ JSON не містить поле "questions" або воно не є масивом')
        setPreview(null)
        return
      }

      // Валідація через Zod schema
      const validated = AIImportSchema.parse(parsed)

      // Додаткові перевірки
      const warnings: string[] = []

      if (validated.scales.length === 0) {
        warnings.push('⚠️ Тест не має шкал підрахунку')
      }

      if (validated.questions.length === 0) {
        warnings.push('⚠️ Тест не має питань')
      }

      // Перевірка чи всі питання мають options якщо це choice типи
      validated.questions.forEach((q, index) => {
        if (['single_choice', 'multiple_choice', 'dropdown'].includes(q.type)) {
          if (!q.options || q.options.length === 0) {
            warnings.push(`⚠️ Питання ${index + 1} типу "${q.type}" не має варіантів відповідей`)
          }
        }
      })

      setPreview({
        scalesCount: validated.scales.length,
        questionsCount: validated.questions.length,
        title: validated.title,
        warnings,
      })
      setError(null)
    } catch (err: any) {
      // Розбір помилок JSON.parse
      if (err instanceof SyntaxError) {
        const match = err.message.match(/position (\d+)/)
        if (match) {
          const position = parseInt(match[1])
          const lines = jsonInput.substring(0, position).split('\n')
          setError(
            `❌ Синтаксична помилка JSON на рядку ${lines.length}:\n${err.message}\n\nПеревірте коми, лапки та дужки.`
          )
        } else {
          setError(`❌ Невалідний JSON: ${err.message}\n\nПеревірте формат JSON`)
        }
        setPreview(null)
        return
      }

      // Розбір помилок Zod валідації
      if (err.errors && Array.isArray(err.errors)) {
        const errorMessages = err.errors.map((e: any) => {
          const path = e.path.join(' → ')
          return `• ${path}: ${e.message}`
        })
        setError(`❌ Помилки валідації:\n\n${errorMessages.join('\n')}\n\nВиправте помилки та спробуйте знову.`)
      } else {
        setError(`❌ Помилка: ${err.message || 'Невалідний JSON. Перевірте формат.'}`)
      }
      setPreview(null)
    }
  }

  const handleImport = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      const validated = AIImportSchema.parse(parsed)
      importFromJSON(validated)
      onClose()
      setJsonInput('')
      setPreview(null)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const exampleJSON = `{
  "title": "Діагностика емоційного вигорання",
  "description": "Методика Бойко",
  "scales": [
    {
      "id": "s1",
      "name": "Напруга",
      "norm_min": 0,
      "norm_max": 30
    }
  ],
  "questions": [
    {
      "type": "single_choice",
      "text": "Чи відчуваєте ви емоційну спустошеність?",
      "options": [
        { "text": "Ніколи", "weight": 0, "scale_id": "s1" },
        { "text": "Рідко", "weight": 1, "scale_id": "s1" },
        { "text": "Часто", "weight": 3, "scale_id": "s1" }
      ]
    }
  ]
}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">✨ AI Import - Імпорт тесту з JSON</h2>
            <p className="text-mindflow-slate">
              Отримайте готовий тест від ChatGPT та вставте JSON тут
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl hover:text-red-500 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Instructions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <h3 className="font-semibold mb-2">📖 Як використовувати:</h3>
          <ol className="text-sm space-y-1 list-decimal list-inside text-mindflow-slate">
            <li>Попросіть ChatGPT: "Створи тест на депресію у форматі JSON з ключем"</li>
            <li>Скопіюйте отриманий JSON</li>
            <li>Вставте у поле нижче</li>
            <li>Натисніть "Перевірити" для валідації</li>
            <li>Натисніть "Імпортувати" для створення тесту</li>
          </ol>
        </div>

        {/* JSON Input */}
        <Textarea
          label="JSON тесту"
          placeholder={exampleJSON}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="font-mono text-sm"
          rows={15}
        />

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-700 text-sm">❌ {error}</p>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="mt-4 space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-2xl">
              <h3 className="font-semibold text-green-900 mb-3">✅ JSON валідний!</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-green-700">Назва:</p>
                  <p className="font-medium">{preview.title}</p>
                </div>
                <div>
                  <p className="text-green-700">Шкал:</p>
                  <p className="font-medium">{preview.scalesCount}</p>
                </div>
                <div>
                  <p className="text-green-700">Питань:</p>
                  <p className="font-medium">{preview.questionsCount}</p>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {preview.warnings && preview.warnings.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Попередження:</h4>
                <ul className="space-y-1 text-sm text-yellow-800">
                  {preview.warnings.map((warning: string, index: number) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Скасувати
          </Button>
          {!preview ? (
            <Button variant="primary" onClick={handleValidate} fullWidth>
              🔍 Перевірити JSON
            </Button>
          ) : (
            <Button variant="primary" onClick={handleImport} fullWidth>
              ✨ Імпортувати тест
            </Button>
          )}
        </div>

        {/* Example */}
        <details className="mt-6">
          <summary className="cursor-pointer font-semibold text-mindflow-teal">
            📄 Показати приклад JSON
          </summary>
          <pre className="mt-4 p-4 bg-gray-50 rounded-xl text-xs overflow-x-auto">
            {exampleJSON}
          </pre>
        </details>
      </GlassCard>
    </div>
  )
}
