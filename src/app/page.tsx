import { GlassCard } from '@/components/ui/GlassCard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-6xl w-full space-y-12">
        {/* Hero Section */}
        <GlassCard className="p-12 text-center animate-fade-in">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-mindflow-teal to-mindflow-navy bg-clip-text text-transparent">
            MindFlow
          </h1>
          <p className="text-xl text-mindflow-slate mb-8 max-w-2xl mx-auto">
            Професійна платформа для психологічного тестування з автоматичним аналізом результатів
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/dashboard">
              <Button variant="primary" size="lg">
                Dashboard психолога
              </Button>
            </Link>
            <Link href="/builder">
              <Button variant="secondary" size="lg">
                Конструктор тестів
              </Button>
            </Link>
            <Link href="/test/demo">
              <Button variant="ghost" size="lg">
                Демо тесту
              </Button>
            </Link>
          </div>
        </GlassCard>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <GlassCard hover className="text-center">
            <div className="text-4xl mb-4">🧠</div>
            <h3 className="text-xl font-semibold mb-2">Психологічні шкали</h3>
            <p className="text-mindflow-slate text-sm">
              Автоматичний підрахунок балів по шкалах депресії, тривожності та інших
            </p>
          </GlassCard>

          <GlassCard hover className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Аналітика</h3>
            <p className="text-mindflow-slate text-sm">
              Відстеження динаміки стану клієнта з часом
            </p>
          </GlassCard>

          <GlassCard hover className="text-center">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">Дизайн Apple</h3>
            <p className="text-mindflow-slate text-sm">
              Мінімалістичний, спокійний інтерфейс для клієнтів
            </p>
          </GlassCard>
        </div>

        {/* Demo Form */}
        <GlassCard className="p-8">
          <h2 className="text-2xl font-semibold mb-6">Спробуйте UI компоненти</h2>
          <div className="space-y-4 max-w-md">
            <Input label="Ваше ім'я" placeholder="Введіть ім'я" />
            <Input label="Email" type="email" placeholder="email@example.com" />
            <div className="flex gap-3">
              <Button variant="primary" fullWidth>Відправити</Button>
              <Button variant="secondary">Скасувати</Button>
            </div>
          </div>
        </GlassCard>
      </div>
    </main>
  )
}
