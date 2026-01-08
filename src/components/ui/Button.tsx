import { ReactNode, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'rounded-full font-medium transition-all duration-200 ease-out active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-mindflow-teal focus-visible:ring-offset-2'

  const variants = {
    primary: 'px-6 py-3 bg-gradient-primary text-white hover:shadow-soft min-h-[44px]',
    secondary: 'px-6 py-3 bg-white/40 backdrop-blur-xl border border-white/30 text-mindflow-navy hover:bg-white/60 min-h-[44px]',
    ghost: 'px-6 py-3 text-mindflow-navy hover:bg-white/20 min-h-[44px]',
    danger: 'px-6 py-3 bg-red-500/90 text-white hover:bg-red-600 shadow-soft min-h-[44px]',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[48px]',
  }

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </button>
  )
}
