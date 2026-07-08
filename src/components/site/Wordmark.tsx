import { cn } from '@/utilities/ui'
import React from 'react'

type Props = {
  /** Which surface the wordmark sits on — the `.nz` is fern on paper, moss on charcoal */
  surface?: 'paper' | 'charcoal'
  className?: string
}

export const Wordmark: React.FC<Props> = ({ surface = 'paper', className }) => {
  return (
    <span
      className={cn(
        'font-mono font-medium lowercase tracking-[0.02em]',
        surface === 'paper' ? 'text-body' : 'text-paper',
        className,
      )}
    >
      richardkern
      <span className={surface === 'paper' ? 'text-accent' : 'text-moss'}>.nz</span>
    </span>
  )
}
