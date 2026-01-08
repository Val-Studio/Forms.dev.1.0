'use client'

import { useState } from 'react'
import { Button } from './ui/Button'

interface CopyLinkButtonProps {
  formId: string
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function CopyLinkButton({ formId, variant = 'secondary' }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  const copyLink = async () => {
    const link = `${window.location.origin}/test/${formId}`
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
      alert(`Посилання: ${link}`)
    }
  }

  return (
    <Button variant={variant} onClick={copyLink}>
      {copied ? '✅ Скопійовано!' : '🔗 Копіювати посилання'}
    </Button>
  )
}
