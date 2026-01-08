'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFormBuilder } from '@/store/formBuilder'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { AIImportModal } from '@/components/AIImportModal'
import { BulkEditScoresModal } from '@/components/BulkEditScoresModal'
import { QUESTION_CATEGORIES, type QuestionType } from '@/lib/schemas'
import { createForm } from '@/app/actions/forms'
import { getCurrentUserId } from '@/lib/mock-user'
import { validateLogicJumps } from '@/lib/logicValidator'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function SortableQuestion({ question, isSelected, onSelect, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: question.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const questionType = Object.values(QUESTION_CATEGORIES)
    .flatMap((cat) => cat.types)
    .find((t) => t.type === question.type)

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <GlassCard
        className={`p-4 mb-3 cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-mindflow-teal shadow-lg' : ''
        }`}
        onClick={() => onSelect(question.id)}
      >
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <button {...listeners} className="cursor-grab active:cursor-grabbing text-xl">
            ⋮⋮
          </button>

          {/* Icon */}
          <span className="text-2xl">{questionType?.icon}</span>

          {/* Content */}
          <div className="flex-1">
            <p className="font-medium text-sm text-mindflow-slate">
              {questionType?.label}
            </p>
            <p className="text-mindflow-navy">
              {question.title || 'Без назви'}
            </p>
          </div>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(question.id)
            }}
            className="text-red-500 hover:text-red-700 text-xl"
          >
            🗑️
          </button>
        </div>
      </GlassCard>
    </div>
  )
}

export default function ProfessionalBuilderPage() {
  const router = useRouter()
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const {
    title,
    description,
    questions,
    scoringScales,
    logicJumps,
    selectedQuestionId,
    selectedScaleId,
    activePanel,
    setTitle,
    setDescription,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    selectQuestion,
    reorderQuestions,
    addScoringScale,
    updateScoringScale,
    deleteScoringScale,
    selectScale,
    addLogicJump,
    updateLogicJump,
    deleteLogicJump,
    setActivePanel,
    getFormData,
  } = useFormBuilder()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId)
  const selectedScale = scoringScales.find((s) => s.id === selectedScaleId)

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id)
      const newIndex = questions.findIndex((q) => q.id === over.id)
      reorderQuestions(oldIndex, newIndex)
    }
  }

  const handleSave = async (publish: boolean = false) => {
    if (!title.trim()) {
      alert('Введіть назву тесту')
      return
    }

    if (questions.length === 0) {
      alert('Додайте хоча б одне питання')
      return
    }

    // Валідація Logic Jumps
    if (logicJumps.length > 0) {
      const validation = validateLogicJumps(questions, logicJumps)

      if (!validation.isValid) {
        const errorMsg = validation.errors.map((e) => `❌ ${e.message}`).join('\n')
        alert(`Помилки в умовних переходах:\n\n${errorMsg}\n\nВиправте їх перед збереженням.`)
        return
      }

      if (validation.warnings.length > 0) {
        const warningMsg = validation.warnings.map((w) => `⚠️ ${w.message}`).join('\n')
        const confirmed = confirm(
          `Виявлено попередження:\n\n${warningMsg}\n\nПродовжити збереження?`
        )
        if (!confirmed) return
      }
    }

    setSaving(true)

    try {
      const formData = {
        title,
        description,
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
        logicJumps: logicJumps.map((jump) => ({
          questionId: jump.questionId,
          condition: jump.condition,
          action: jump.action,
        })),
      }

      const result = await createForm(getCurrentUserId(), formData)

      if (result.success) {
        alert('✅ Тест успішно збережено!')
        router.push('/dashboard')
      } else {
        // Fallback localStorage
        const savedForms = JSON.parse(localStorage.getItem('mindflow-forms') || '[]')
        savedForms.push({
          id: `form-${Date.now()}`,
          ...formData,
          status: publish ? 'published' : 'draft',
          createdAt: new Date().toISOString(),
          submissions: 0,
        })
        localStorage.setItem('mindflow-forms', JSON.stringify(savedForms))
        alert('Тест збережено локально')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error(error)
      alert('Помилка збереження')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-mindflow-cream">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-2xl border-b border-white/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="text-2xl">
              ←
            </button>
            <div>
              <h1 className="text-2xl font-bold">Конструктор тестів</h1>
              <p className="text-sm text-mindflow-slate">
                {questions.length} питань • {scoringScales.length} шкал
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => setIsAIModalOpen(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
            >
              ✨ AI Import
            </Button>
            <Button variant="secondary" onClick={() => handleSave(false)} disabled={saving}>
              Зберегти
            </Button>
            <Button variant="primary" onClick={() => handleSave(true)} disabled={saving} loading={saving}>
              Опублікувати
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Form Info */}
        <GlassCard className="p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Назва тесту"
              placeholder="напр. Шкала депресії Бека"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              label="Опис"
              placeholder="Коротко опишіть призначення..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </GlassCard>

        <div className="grid lg:grid-cols-12 gap-6">
          {/* LEFT: Toolbox */}
          <div className="lg:col-span-3">
            <GlassCard className="p-4 sticky top-24">
              <h3 className="font-semibold mb-4">🛠️ Інструменти</h3>

              {Object.entries(QUESTION_CATEGORIES).map(([key, category]) => (
                <details key={key} className="mb-3" open={key === 'basic'}>
                  <summary className="cursor-pointer font-medium mb-2 flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </summary>
                  <div className="space-y-1 pl-4">
                    {category.types.map((type) => (
                      <button
                        key={type.type}
                        onClick={() => addQuestion(type.type as QuestionType)}
                        className="w-full flex items-center gap-2 p-2 rounded-xl hover:bg-white/40 transition-all text-left text-sm"
                      >
                        <span>{type.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium">{type.label}</p>
                          <p className="text-xs text-mindflow-slate">{type.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </details>
              ))}

              <div className="mt-6 pt-4 border-t border-white/20">
                <h3 className="font-semibold mb-3">📊 Шкали підрахунку</h3>
                {scoringScales.length === 0 ? (
                  <p className="text-xs text-mindflow-slate mb-3">Немає шкал</p>
                ) : (
                  <div className="space-y-2 mb-3">
                    {scoringScales.map((scale) => (
                      <div
                        key={scale.id}
                        onClick={() => {
                          selectScale(scale.id)
                          selectQuestion(null)
                        }}
                        className={`p-2 bg-white/40 rounded-xl flex items-center justify-between cursor-pointer transition-all hover:bg-white/60 ${
                          selectedScaleId === scale.id ? 'ring-2 ring-mindflow-teal' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{scale.name || 'Без назви'}</p>
                          <p className="text-xs text-mindflow-slate">
                            {scale.minScore}-{scale.maxScore} балів
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteScoringScale(scale.id)
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="secondary" fullWidth onClick={addScoringScale}>
                  ➕ Додати шкалу
                </Button>
              </div>
            </GlassCard>
          </div>

          {/* CENTER: Canvas */}
          <div className="lg:col-span-6">
            {questions.length === 0 ? (
              <GlassCard className="p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-2xl font-semibold mb-2">Додайте питання</h3>
                <p className="text-mindflow-slate mb-6">
                  Виберіть тип питання зліва або імпортуйте готовий тест
                </p>
                <Button variant="primary" onClick={() => setIsAIModalOpen(true)}>
                  ✨ Імпортувати з AI
                </Button>
              </GlassCard>
            ) : (
              <div>
                <h3 className="font-semibold mb-4">📋 Питання ({questions.length})</h3>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={questions.map((q) => q.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {questions.map((question) => (
                      <SortableQuestion
                        key={question.id}
                        question={question}
                        isSelected={question.id === selectedQuestionId}
                        onSelect={selectQuestion}
                        onDelete={deleteQuestion}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>

          {/* RIGHT: Properties Panel */}
          <div className="lg:col-span-3">
            <GlassCard className="p-4 sticky top-24">
              {selectedQuestion ? (
                <div>
                  <h3 className="font-semibold mb-4">⚙️ Налаштування</h3>
                  <div className="space-y-4">
                    <Input
                      label="Текст питання"
                      value={selectedQuestion.title}
                      onChange={(e) =>
                        updateQuestion(selectedQuestion.id, { title: e.target.value })
                      }
                      placeholder="Введіть питання..."
                    />

                    <Textarea
                      label="Опис (опціонально)"
                      value={selectedQuestion.description || ''}
                      onChange={(e) =>
                        updateQuestion(selectedQuestion.id, { description: e.target.value })
                      }
                      placeholder="Додаткові інструкції..."
                      rows={2}
                    />

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="required"
                        checked={selectedQuestion.required}
                        onChange={(e) =>
                          updateQuestion(selectedQuestion.id, { required: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <label htmlFor="required" className="text-sm font-medium">
                        Обов'язкове питання
                      </label>
                    </div>

                    {/* Options for choice types */}
                    {(selectedQuestion.type === 'single_choice' ||
                      selectedQuestion.type === 'multiple_choice' ||
                      selectedQuestion.type === 'likert') && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Варіанти відповідей
                        </label>
                        {selectedQuestion.options?.map((option, index) => (
                          <div key={option.id} className="mb-2">
                            <Input
                              placeholder={`Варіант ${index + 1}`}
                              value={option.text}
                              onChange={(e) => {
                                const newOptions = [...(selectedQuestion.options || [])]
                                newOptions[index].text = e.target.value
                                updateQuestion(selectedQuestion.id, { options: newOptions })
                              }}
                            />
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newOption = {
                              id: `opt-${Date.now()}`,
                              text: '',
                              order: selectedQuestion.options?.length || 0,
                              scoreWeights: {},
                            }
                            updateQuestion(selectedQuestion.id, {
                              options: [...(selectedQuestion.options || []), newOption],
                            })
                          }}
                        >
                          ➕ Додати варіант
                        </Button>
                      </div>
                    )}

                    {/* Question-specific settings */}
                    {selectedQuestion.type === 'slider' && (
                      <div className="space-y-3">
                        <Input
                          label="Мінімальне значення"
                          type="number"
                          value={selectedQuestion.settings?.min || 0}
                          onChange={(e) =>
                            updateQuestion(selectedQuestion.id, {
                              settings: { ...selectedQuestion.settings, min: Number(e.target.value) },
                            })
                          }
                        />
                        <Input
                          label="Максимальне значення"
                          type="number"
                          value={selectedQuestion.settings?.max || 10}
                          onChange={(e) =>
                            updateQuestion(selectedQuestion.id, {
                              settings: { ...selectedQuestion.settings, max: Number(e.target.value) },
                            })
                          }
                        />
                        <Input
                          label="Крок"
                          type="number"
                          value={selectedQuestion.settings?.step || 1}
                          onChange={(e) =>
                            updateQuestion(selectedQuestion.id, {
                              settings: { ...selectedQuestion.settings, step: Number(e.target.value) },
                            })
                          }
                        />
                      </div>
                    )}

                    {selectedQuestion.type === 'matrix' && (
                      <div className="space-y-3">
                        <Textarea
                          label="Рядки (по одному на рядок)"
                          value={selectedQuestion.settings?.rows?.join('\n') || ''}
                          onChange={(e) =>
                            updateQuestion(selectedQuestion.id, {
                              settings: {
                                ...selectedQuestion.settings,
                                rows: e.target.value.split('\n').filter((r) => r.trim()),
                              },
                            })
                          }
                          placeholder="Рядок 1&#10;Рядок 2&#10;Рядок 3"
                          rows={4}
                        />
                        <Textarea
                          label="Колонки (по одній на рядок)"
                          value={selectedQuestion.settings?.columns?.join('\n') || ''}
                          onChange={(e) =>
                            updateQuestion(selectedQuestion.id, {
                              settings: {
                                ...selectedQuestion.settings,
                                columns: e.target.value.split('\n').filter((c) => c.trim()),
                              },
                            })
                          }
                          placeholder="Колонка 1&#10;Колонка 2&#10;Колонка 3"
                          rows={4}
                        />
                      </div>
                    )}

                    {selectedQuestion.type === 'timed_question' && (
                      <div className="space-y-3">
                        <Input
                          label="Час на відповідь (секунди)"
                          type="number"
                          value={selectedQuestion.settings?.timeLimit || 30}
                          onChange={(e) =>
                            updateQuestion(selectedQuestion.id, {
                              settings: {
                                ...selectedQuestion.settings,
                                timeLimit: Number(e.target.value),
                              },
                            })
                          }
                        />
                      </div>
                    )}

                    {selectedQuestion.type === 'file_upload' && (
                      <div className="space-y-3">
                        <Input
                          label="Дозволені типи файлів"
                          value={selectedQuestion.settings?.allowedTypes?.join(', ') || ''}
                          onChange={(e) =>
                            updateQuestion(selectedQuestion.id, {
                              settings: {
                                ...selectedQuestion.settings,
                                allowedTypes: e.target.value.split(',').map((t) => t.trim()),
                              },
                            })
                          }
                          placeholder="image/*, .pdf, .doc"
                        />
                        <Input
                          label="Максимальний розмір (MB)"
                          type="number"
                          value={selectedQuestion.settings?.maxSize || 10}
                          onChange={(e) =>
                            updateQuestion(selectedQuestion.id, {
                              settings: {
                                ...selectedQuestion.settings,
                                maxSize: Number(e.target.value),
                              },
                            })
                          }
                        />
                      </div>
                    )}

                    {selectedQuestion.type === 'semantic_differential' && (
                      <div className="space-y-3">
                        <Input
                          label="Лівий полюс"
                          value={selectedQuestion.settings?.leftLabel || ''}
                          onChange={(e) =>
                            updateQuestion(selectedQuestion.id, {
                              settings: { ...selectedQuestion.settings, leftLabel: e.target.value },
                            })
                          }
                          placeholder="напр. Погано"
                        />
                        <Input
                          label="Правий полюс"
                          value={selectedQuestion.settings?.rightLabel || ''}
                          onChange={(e) =>
                            updateQuestion(selectedQuestion.id, {
                              settings: { ...selectedQuestion.settings, rightLabel: e.target.value },
                            })
                          }
                          placeholder="напр. Добре"
                        />
                        <Input
                          label="Кількість ступенів"
                          type="number"
                          value={selectedQuestion.settings?.steps || 7}
                          onChange={(e) =>
                            updateQuestion(selectedQuestion.id, {
                              settings: {
                                ...selectedQuestion.settings,
                                steps: Number(e.target.value),
                              },
                            })
                          }
                        />
                      </div>
                    )}

                    {/* Scoring */}
                    {scoringScales.length > 0 &&
                      selectedQuestion.options &&
                      selectedQuestion.options.length > 0 && (
                        <div className="pt-4 border-t border-white/20">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-sm">📊 Підрахунок балів</h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsBulkEditOpen(true)}
                            >
                              ⚡ Масове
                            </Button>
                          </div>
                          <p className="text-xs text-mindflow-slate mb-3">
                            Призначте бали для кожної шкали до кожного варіанту
                          </p>
                          {selectedQuestion.options.map((option, optIndex) => (
                            <details key={option.id} className="mb-3" open={optIndex === 0}>
                              <summary className="cursor-pointer text-sm font-medium mb-2">
                                {option.text || `Варіант ${optIndex + 1}`}
                              </summary>
                              <div className="space-y-2 pl-3">
                                {scoringScales.map((scale) => (
                                  <div key={scale.id} className="flex items-center gap-2">
                                    <label className="text-xs flex-1 text-mindflow-slate">
                                      {scale.name}:
                                    </label>
                                    <Input
                                      type="number"
                                      value={option.scoreWeights?.[scale.id] || 0}
                                      onChange={(e) => {
                                        const newOptions = [...(selectedQuestion.options || [])]
                                        newOptions[optIndex].scoreWeights = {
                                          ...(newOptions[optIndex].scoreWeights || {}),
                                          [scale.id]: Number(e.target.value),
                                        }
                                        updateQuestion(selectedQuestion.id, { options: newOptions })
                                      }}
                                      className="w-20 text-sm"
                                    />
                                  </div>
                                ))}
                              </div>
                            </details>
                          ))}
                        </div>
                      )}

                    {/* Logic Jumps */}
                    {selectedQuestion && (
                      <div className="pt-4 border-t border-white/20">
                        <h4 className="font-semibold mb-2 text-sm flex items-center justify-between">
                          <span>🔀 Умовні переходи</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addLogicJump(selectedQuestion.id)}
                          >
                            ➕
                          </Button>
                        </h4>
                        <p className="text-xs text-mindflow-slate mb-3">
                          Налаштуйте переходи залежно від відповіді
                        </p>
                        {logicJumps
                          .filter((jump) => jump.questionId === selectedQuestion.id)
                          .map((jump) => (
                            <div
                              key={jump.id}
                              className="p-3 bg-white/40 rounded-xl mb-2 space-y-2"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium">Умова:</span>
                                <button
                                  onClick={() => deleteLogicJump(jump.id)}
                                  className="text-red-500 hover:text-red-700 text-sm"
                                >
                                  🗑️
                                </button>
                              </div>
                              <select
                                className="w-full text-xs p-2 rounded-lg bg-white/60 border border-white/30"
                                value={jump.condition.type}
                                onChange={(e) =>
                                  updateLogicJump(jump.id, {
                                    condition: { ...jump.condition, type: e.target.value as any },
                                  })
                                }
                              >
                                <option value="equals">Дорівнює</option>
                                <option value="not_equals">Не дорівнює</option>
                                <option value="greater_than">Більше ніж</option>
                                <option value="less_than">Менше ніж</option>
                                <option value="contains">Містить</option>
                              </select>
                              {selectedQuestion.options && (
                                <select
                                  className="w-full text-xs p-2 rounded-lg bg-white/60 border border-white/30"
                                  value={jump.condition.value || ''}
                                  onChange={(e) =>
                                    updateLogicJump(jump.id, {
                                      condition: { ...jump.condition, value: e.target.value },
                                    })
                                  }
                                >
                                  <option value="">Виберіть варіант...</option>
                                  {selectedQuestion.options.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                      {opt.text}
                                    </option>
                                  ))}
                                </select>
                              )}
                              <div>
                                <label className="text-xs text-mindflow-slate block mb-1">
                                  Перейти до:
                                </label>
                                <select
                                  className="w-full text-xs p-2 rounded-lg bg-white/60 border border-white/30"
                                  value={jump.action.targetQuestionId || ''}
                                  onChange={(e) =>
                                    updateLogicJump(jump.id, {
                                      action: {
                                        ...jump.action,
                                        targetQuestionId: e.target.value || undefined,
                                      },
                                    })
                                  }
                                >
                                  <option value="">Наступне питання</option>
                                  {questions
                                    .filter((q) => q.id !== selectedQuestion.id)
                                    .map((q) => (
                                      <option key={q.id} value={q.id}>
                                        {q.title || 'Без назви'}
                                      </option>
                                    ))}
                                  <option value="END">Завершити тест</option>
                                </select>
                              </div>
                            </div>
                          ))}
                        {logicJumps.filter((jump) => jump.questionId === selectedQuestion.id)
                          .length === 0 && (
                          <p className="text-xs text-mindflow-slate text-center py-3">
                            Немає умовних переходів
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : selectedScale ? (
                <div>
                  <h3 className="font-semibold mb-4">📊 Налаштування шкали</h3>
                  <div className="space-y-4">
                    <Input
                      label="Назва шкали"
                      value={selectedScale.name}
                      onChange={(e) => updateScoringScale(selectedScale.id, { name: e.target.value })}
                      placeholder="напр. Депресія"
                    />
                    <Textarea
                      label="Опис"
                      value={selectedScale.description || ''}
                      onChange={(e) =>
                        updateScoringScale(selectedScale.id, { description: e.target.value })
                      }
                      placeholder="Опис шкали..."
                      rows={2}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Мін. бал"
                        type="number"
                        value={selectedScale.minScore}
                        onChange={(e) =>
                          updateScoringScale(selectedScale.id, { minScore: Number(e.target.value) })
                        }
                      />
                      <Input
                        label="Макс. бал"
                        type="number"
                        value={selectedScale.maxScore}
                        onChange={(e) =>
                          updateScoringScale(selectedScale.id, { maxScore: Number(e.target.value) })
                        }
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="reverseScoring"
                        checked={selectedScale.reverseScoring || false}
                        onChange={(e) =>
                          updateScoringScale(selectedScale.id, { reverseScoring: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <label htmlFor="reverseScoring" className="text-sm font-medium">
                        Зворотній підрахунок (більше = краще)
                      </label>
                    </div>

                    <div className="pt-4 border-t border-white/20">
                      <h4 className="font-semibold mb-3 text-sm">🎯 Інтерпретації</h4>
                      {selectedScale.interpretations?.map((interp, index) => (
                        <div key={index} className="mb-3 p-3 bg-white/40 rounded-xl space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              label="Від"
                              type="number"
                              value={interp.min}
                              onChange={(e) => {
                                const newInterps = [...(selectedScale.interpretations || [])]
                                newInterps[index].min = Number(e.target.value)
                                updateScoringScale(selectedScale.id, { interpretations: newInterps })
                              }}
                              className="text-sm"
                            />
                            <Input
                              label="До"
                              type="number"
                              value={interp.max}
                              onChange={(e) => {
                                const newInterps = [...(selectedScale.interpretations || [])]
                                newInterps[index].max = Number(e.target.value)
                                updateScoringScale(selectedScale.id, { interpretations: newInterps })
                              }}
                              className="text-sm"
                            />
                          </div>
                          <Input
                            label="Мітка"
                            value={interp.label}
                            onChange={(e) => {
                              const newInterps = [...(selectedScale.interpretations || [])]
                              newInterps[index].label = e.target.value
                              updateScoringScale(selectedScale.id, { interpretations: newInterps })
                            }}
                            placeholder="напр. Норма"
                            className="text-sm"
                          />
                          <div>
                            <label className="block text-xs font-medium mb-1">Колір</label>
                            <select
                              value={interp.color}
                              onChange={(e) => {
                                const newInterps = [...(selectedScale.interpretations || [])]
                                newInterps[index].color = e.target.value
                                updateScoringScale(selectedScale.id, { interpretations: newInterps })
                              }}
                              className="w-full text-sm p-2 rounded-lg bg-white/60 border border-white/30"
                            >
                              <option value="green">🟢 Зелений</option>
                              <option value="yellow">🟡 Жовтий</option>
                              <option value="orange">🟠 Помаранчевий</option>
                              <option value="red">🔴 Червоний</option>
                              <option value="blue">🔵 Синій</option>
                            </select>
                          </div>
                          <button
                            onClick={() => {
                              const newInterps = selectedScale.interpretations?.filter(
                                (_, i) => i !== index
                              )
                              updateScoringScale(selectedScale.id, { interpretations: newInterps })
                            }}
                            className="text-red-500 text-xs hover:text-red-700"
                          >
                            🗑️ Видалити
                          </button>
                        </div>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newInterp = {
                            min: 0,
                            max: 100,
                            label: '',
                            color: 'green',
                          }
                          updateScoringScale(selectedScale.id, {
                            interpretations: [...(selectedScale.interpretations || []), newInterp],
                          })
                        }}
                      >
                        ➕ Додати інтерпретацію
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-mindflow-slate">
                    Виберіть питання або шкалу для редагування
                  </p>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>

      {/* AI Import Modal */}
      <AIImportModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />

      {/* Bulk Edit Scores Modal */}
      {selectedQuestion && (
        <BulkEditScoresModal
          isOpen={isBulkEditOpen}
          onClose={() => setIsBulkEditOpen(false)}
          question={selectedQuestion}
          scales={scoringScales}
          onApply={(updates) => {
            const newOptions = [...(selectedQuestion.options || [])]
            Object.entries(updates).forEach(([optionId, scaleScores]) => {
              const optIndex = newOptions.findIndex((opt) => opt.id === optionId)
              if (optIndex !== -1) {
                newOptions[optIndex].scoreWeights = {
                  ...(newOptions[optIndex].scoreWeights || {}),
                  ...scaleScores,
                }
              }
            })
            updateQuestion(selectedQuestion.id, { options: newOptions })
          }}
        />
      )}
    </div>
  )
}
