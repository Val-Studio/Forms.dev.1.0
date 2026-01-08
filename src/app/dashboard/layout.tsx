'use client'

import { ReactNode, useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import Link from 'next/link'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { label: 'Тести', href: '/dashboard', icon: '📋' },
    { label: 'Створити тест', href: '/builder', icon: '➕' },
    { label: 'Клієнти', href: '/dashboard/clients', icon: '👥' },
    { label: 'Аналітика', href: '/dashboard/analytics', icon: '📊' },
    { label: 'Налаштування', href: '/dashboard/settings', icon: '⚙️' },
  ]

  return (
    <div className="min-h-screen flex bg-mindflow-cream">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="h-full p-4">
          <GlassCard className="h-full flex flex-col">
            {/* Logo */}
            <div className="flex items-center justify-between mb-8">
              {sidebarOpen && (
                <h2 className="text-2xl font-bold bg-gradient-to-r from-mindflow-teal to-mindflow-navy bg-clip-text text-transparent">
                  MindFlow
                </h2>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-white/40 rounded-xl transition-colors"
              >
                {sidebarOpen ? '◀' : '▶'}
              </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/40 transition-all group"
                >
                  <span className="text-2xl">{item.icon}</span>
                  {sidebarOpen && (
                    <span className="font-medium text-mindflow-navy group-hover:text-mindflow-teal transition-colors">
                      {item.label}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            {/* User Profile */}
            <div className="mt-auto pt-4 border-t border-white/20">
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-white/40 transition-all cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mindflow-teal to-mindflow-navy" />
                {sidebarOpen && (
                  <div>
                    <p className="font-medium text-sm">Психолог</p>
                    <p className="text-xs text-mindflow-slate">psycholog@mail.com</p>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
