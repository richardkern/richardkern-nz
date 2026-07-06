'use client'

import { cn } from '@/utilities/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import type { NavLink } from '@/utilities/navLinks'

export const HeaderNav: React.FC<{ links: NavLink[] }> = ({ links }) => {
  const pathname = usePathname()

  return (
    <nav className="flex gap-6 md:gap-[34px]">
      {links.map(({ label, href }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            {...(active ? { 'aria-current': 'page' } : {})}
            className={cn(
              // negative margin + padding keeps the 44px tap target without moving the text
              '-my-3 py-3 font-sans text-[13px] font-medium transition-colors',
              active
                ? 'text-fern underline decoration-[1.5px] underline-offset-[6px]'
                : 'text-ink hover:text-fern',
            )}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
