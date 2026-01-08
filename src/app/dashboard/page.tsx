import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function DashboardPage() {
  // Mock data
  const forms = [
    {
      id: '1',
      title: 'Шкала депресії Бека',
      description: 'Оцінка рівня депресії',
      status: 'published',
      submissions: 24,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      title: 'Тест на тривожність',
      description: 'Оцінка рівня тривожності',
      status: 'draft',
      submissions: 0,
      createdAt: new Date('2024-01-20'),
    },
  ]

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
        <Link href="/builder">
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
                {forms.reduce((acc, f) => acc + f.submissions, 0)}
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
                  <span>📊 {form.submissions} проходжень</span>
                  <span>📅 {form.createdAt.toLocaleDateString('uk-UA')}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/builder/${form.id}`}>
                  <Button variant="secondary">Редагувати</Button>
                </Link>
                <Link href={`/dashboard/forms/${form.id}/results`}>
                  <Button variant="ghost">Результати</Button>
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
          <p className="text-mindflow-slate mb-6">
            Створіть свій перший психологічний тест
          </p>
          <Link href="/builder">
            <Button variant="primary" size="lg">
              Створити тест
            </Button>
          </Link>
        </GlassCard>
      )}
    </div>
  )
}
