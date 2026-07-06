import { getCachedGlobal } from '@/utilities/getGlobals'
import { navLinksFrom } from '@/utilities/navLinks'
import Link from 'next/link'
import React from 'react'

import { displayName } from '@/components/site/socialLinks'
import { Wordmark } from '@/components/site/Wordmark'

export async function SiteFooter() {
  const [footer, siteSettings] = await Promise.all([
    getCachedGlobal('footer', 1)(),
    getCachedGlobal('site-settings', 0)(),
  ])

  const navLinks = navLinksFrom(footer)
  const socialLinks = siteSettings?.socialLinks ?? []

  return (
    <footer
      data-surface="charcoal"
      className="mt-auto flex flex-wrap items-center justify-between gap-x-10 gap-y-5 bg-charcoal px-6 py-[30px] sm:px-10 lg:px-24"
    >
      <Link href="/" className="inline-block">
        <Wordmark surface="charcoal" className="text-[12.5px]" />
      </Link>
      <nav className="flex flex-wrap gap-x-[26px] gap-y-3">
        {navLinks.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="-my-3 py-3 font-sans text-[12px] text-paper-muted transition-colors hover:text-paper"
          >
            {label}
          </Link>
        ))}
      </nav>
      {socialLinks.length > 0 && (
        <div className="flex flex-wrap gap-x-[26px] gap-y-3">
          {socialLinks.map((link, i) => {
            const email = /mail/i.test(link.platform)
            const href =
              email && !link.url.startsWith('mailto:') && !link.url.startsWith('http')
                ? `mailto:${link.url}`
                : link.url
            return (
              <a
                key={i}
                href={href}
                {...(email ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                className="-my-3 py-3 font-sans text-[12px] text-paper-muted transition-colors hover:text-paper"
              >
                {displayName(link.platform)}
              </a>
            )
          })}
        </div>
      )}
      <span className="font-sans text-[11px] text-paper-faint">
        © {new Date().getFullYear()} Richard Kern
      </span>
    </footer>
  )
}
