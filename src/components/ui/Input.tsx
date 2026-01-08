import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-mindflow-navy mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'input-glass',
            error && 'ring-2 ring-red-500/50 border-red-500/30',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-mindflow-slate/70">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
