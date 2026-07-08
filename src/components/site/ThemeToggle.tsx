'use client'

import { cn } from '@/utilities/ui'
import React from 'react'

import { type Theme, useTheme } from '@/providers/Theme'

// light → dark → system → light. The icon shows the current choice; the label
// announces both the state and the next step for screen-reader users.
const ORDER: Theme[] = ['light', 'dark', 'auto']
const LABEL: Record<Theme, string> = { light: 'Light', dark: 'Dark', auto: 'System' }

const Icon: React.FC<{ theme: Theme }> = ({ theme }) => {
  const common = {
    width: 15,
    height: 15,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }
  if (theme === 'light') {
    // sun
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
      </svg>
    )
  }
  if (theme === 'dark') {
    // crescent moon
    return (
      <svg {...common}>
        <path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5z" />
      </svg>
    )
  }
  // system: a circle split light/dark
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5a8.5 8.5 0 0 1 0 17z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export const ThemeToggle: React.FC<{
  surface?: 'paper' | 'charcoal'
  className?: string
}> = ({ surface = 'paper', className }) => {
  const { theme, setTheme } = useTheme()
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${LABEL[theme]}. Switch to ${LABEL[next]}.`}
      title={`Theme: ${LABEL[theme]} — switch to ${LABEL[next]}`}
      className={cn(
        'relative flex size-[30px] items-center justify-center rounded-full border transition-colors',
        'before:absolute before:-inset-2 before:content-[""]', // extends tap target to ≥44px
        surface === 'charcoal'
          ? 'border-paper-border text-paper-dim hover:border-moss hover:text-paper'
          : 'border-rule-strong text-muted hover:border-accent hover:text-accent',
        className,
      )}
    >
      <span suppressHydrationWarning>
        <Icon theme={theme} />
      </span>
    </button>
  )
}
