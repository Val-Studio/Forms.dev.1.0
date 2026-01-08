import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-mindflow-navy mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-2xl min-h-[120px] resize-y',
            'bg-white/40 backdrop-blur-xl border border-white/30',
            'text-mindflow-navy placeholder:text-mindflow-slate/60',
            'transition-all duration-200 ease-out',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-mindflow-teal/50 focus:bg-white/60',
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

Textarea.displayName = 'Textarea'
