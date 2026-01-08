'use client'

import { useEffect, useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { CopyLinkButton } from '@/components/CopyLinkButton'
import Link from 'next/link'
import { getUserForms } from '../actions/forms'
import { getCurrentUserId } from '@/lib/mock-user'

export function DashboardPageClient() {
  const [forms, setForms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadForms() {
      try {
        const userForms = await getUserForms(getCurrentUserId())
        setForms(userForms)
      } catch (error) {
        // Fallback: спробувати завантажити з localStorage
        const savedForms = JSON.parse(localStorage.getItem('mindflow-forms') || '[]')
        setForms(savedForms)
      } finally {
        setLoading(false)
      }
    }
    loadForms()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <GlassCard className="p-12 text-center">
          <div className="animate-spin text-6xl mb-4">⏳</div>
          <p className="text-mindflow-slate">Завантаження...</p>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Мої тести</h1>
          <p className="text-mindflow-slate">
            Керуйте психологічними тестами та аналізуйте результати
          </p>
        </div>
        <Link href="/builder/new">
          <Button variant="primary" size="lg">
            ➕ Створити тест
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-mindflow-slate text-sm mb-1">Всього тестів</p>
              <p className="text-3xl font-bold">{forms.length}</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-mindflow-slate text-sm mb-1">Проходжень</p>
              <p className="text-3xl font-bold">
                {forms.reduce((acc, f) => acc + (f.submissions?.length || f.submissions || 0), 0)}
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-mindflow-slate text-sm mb-1">Активні тести</p>
              <p className="text-3xl font-bold">
                {forms.filter((f) => f.status === 'published').length}
              </p>
            </div>
            <div className="text-4xl">🟢</div>
          </div>
        </GlassCard>
      </div>

      {/* Forms List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Ваші тести</h2>
        {forms.map((form) => (
          <GlassCard key={form.id} hover className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold">{form.title}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      form.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {form.status === 'published' ? 'Опубліковано' : 'Чернетка'}
                  </span>
                </div>
                <p className="text-mindflow-slate mb-4">{form.description}</p>
                <div className="flex items-center gap-6 text-sm text-mindflow-slate">
                  <span>
                    📊 {form.submissions?.length || form.submissions || 0} проходжень
                  </span>
                  <span>
                    📅 {new Date(form.createdAt).toLocaleDateString('uk-UA')}
                  </span>
                  <span>
                    ❓ {form.questions?.length || 0} питань
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {form.status === 'published' && <CopyLinkButton formId={form.id} />}
                <Link href={`/dashboard/forms/${form.id}/results`}>
                  <Button variant="ghost">📊 Результати</Button>
                </Link>
                <Link href={`/test/${form.id}`}>
                  <Button variant="ghost">👁️ Переглянути</Button>
                </Link>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Empty State */}
      {forms.length === 0 && (
        <GlassCard className="p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-2xl font-semibold mb-2">Немає тестів</h3>
          <p className="text-mindflow-slate mb-6">Створіть свій перший психологічний тест</p>
          <Link href="/builder/new">
            <Button variant="primary" size="lg">
              Створити тест
            </Button>
          </Link>
        </GlassCard>
      )}
    </div>
  )
}
