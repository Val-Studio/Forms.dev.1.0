import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
}

export function GlassCard({ children, className, hover = false, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white/60 backdrop-blur-2xl border border-white/20 shadow-glass rounded-3xl p-6 transition-all duration-300',
        hover && 'hover:shadow-glass-hover hover:-translate-y-0.5 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  )
}
