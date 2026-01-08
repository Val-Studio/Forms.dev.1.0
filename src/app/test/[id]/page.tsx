import { getPublicForm } from '@/app/actions/forms'
import { TestPageClient } from './page-client'
import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default async function TestPage({ params }: { params: { id: string } }) {
  const form = await getPublicForm(params.id)

  // Якщо форма не знайдена або не опублікована
  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-mindflow-cream to-white">
        <GlassCard className="p-12 text-center max-w-2xl">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-4xl font-bold mb-4">Тест не знайдено</h1>
          <p className="text-xl text-mindflow-slate mb-8">
            Цей тест не існує або був видалений
          </p>
          <Link href="/">
            <Button variant="primary">Повернутися на головну</Button>
          </Link>
        </GlassCard>
      </div>
    )
  }

  // Якщо немає питань
  if (!form.questions || form.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-mindflow-cream to-white">
        <GlassCard className="p-12 text-center max-w-2xl">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-4xl font-bold mb-4">Тест порожній</h1>
          <p className="text-xl text-mindflow-slate mb-8">
            У цьому тесті ще немає питань
          </p>
        </GlassCard>
      </div>
    )
  }

  return <TestPageClient form={form} />
}
