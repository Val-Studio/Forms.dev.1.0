'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { getFormSubmissions, getFormById } from '@/app/actions/forms'

export default function FormResultsPage() {
  const params = useParams()
  const formId = params.id as string
  const [form, setForm] = useState<any>(null)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [formData, submissionsData] = await Promise.all([
          getFormById(formId),
          getFormSubmissions(formId),
        ])
        setForm(formData)
        setSubmissions(submissionsData)
      } catch (error) {
        console.error('Error loading results:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [formId])

  if (loading) {
    return (
      <div className="min-h-screen bg-mindflow-cream p-8">
        <GlassCard className="p-12 text-center max-w-2xl mx-auto">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-mindflow-slate">Завантаження результатів...</p>
        </GlassCard>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-mindflow-cream p-8">
        <GlassCard className="p-12 text-center max-w-2xl mx-auto">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-4">Тест не знайдено</h2>
          <Link href="/dashboard">
            <Button variant="primary">Повернутися до Dashboard</Button>
          </Link>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-mindflow-cream p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              ← Назад до Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">{form.title}</h1>
          <p className="text-mindflow-slate">Результати проходжень тесту</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <GlassCard className="p-6">
            <p className="text-mindflow-slate text-sm mb-1">Всього проходжень</p>
            <p className="text-3xl font-bold">{submissions.length}</p>
          </GlassCard>
          <GlassCard className="p-6">
            <p className="text-mindflow-slate text-sm mb-1">Завершено</p>
            <p className="text-3xl font-bold">
              {submissions.filter((s) => s.status === 'completed').length}
            </p>
          </GlassCard>
          <GlassCard className="p-6">
            <p className="text-mindflow-slate text-sm mb-1">В процесі</p>
            <p className="text-3xl font-bold">
              {submissions.filter((s) => s.status === 'in_progress').length}
            </p>
          </GlassCard>
          <GlassCard className="p-6">
            <p className="text-mindflow-slate text-sm mb-1">Питань</p>
            <p className="text-3xl font-bold">{form.questions?.length || 0}</p>
          </GlassCard>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Проходження</h2>

          {submissions.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-semibold mb-2">Поки немає результатів</h3>
              <p className="text-mindflow-slate mb-6">
                Поділіться посиланням на тест з клієнтами
              </p>
              <Link href="/dashboard">
                <Button variant="primary">Повернутися</Button>
              </Link>
            </GlassCard>
          ) : (
            submissions.map((submission) => (
              <GlassCard key={submission.id} hover className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          submission.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {submission.status === 'completed' ? 'Завершено' : 'В процесі'}
                      </span>
                      <span className="text-sm text-mindflow-slate">
                        {new Date(submission.createdAt).toLocaleString('uk-UA')}
                      </span>
                    </div>

                    {/* Scores */}
                    {submission.scores && Object.keys(submission.scores).length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {form.scoringScales?.map((scale: any) => (
                          <div
                            key={scale.id}
                            className="p-3 bg-white/40 rounded-xl"
                          >
                            <p className="text-xs text-mindflow-slate mb-1">{scale.name}</p>
                            <p className="text-2xl font-bold">
                              {submission.scores[scale.id] || 0}
                            </p>
                            {submission.interpretations &&
                              submission.interpretations[scale.id] && (
                                <p
                                  className={`text-xs mt-1 px-2 py-1 rounded-full inline-block bg-${
                                    submission.interpretations[scale.id].color
                                  }-100 text-${
                                    submission.interpretations[scale.id].color
                                  }-700`}
                                >
                                  {submission.interpretations[scale.id].label}
                                </p>
                              )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/dashboard/submissions/${submission.id}`}>
                      <Button variant="ghost">Детальніше</Button>
                    </Link>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
