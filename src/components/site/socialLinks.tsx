import { cn } from '@/utilities/ui'
import React from 'react'

import type { SiteSetting } from '@/payload-types'

export type SocialLink = NonNullable<SiteSetting['socialLinks']>[number]

const DISPLAY_NAMES: Record<string, string> = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  email: 'Email',
  mail: 'Email',
  mastodon: 'Mastodon',
  bluesky: 'Bluesky',
  youtube: 'YouTube',
}

const GLYPHS: Record<string, string> = {
  github: 'gh',
  linkedin: 'in',
  email: '@',
  mail: '@',
}

export const displayName = (platform: string): string =>
  DISPLAY_NAMES[platform.toLowerCase()] ??
  platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase()

const glyph = (platform: string): string =>
  GLYPHS[platform.toLowerCase()] ?? platform.slice(0, 2).toLowerCase()

const isEmail = (platform: string) => /mail/i.test(platform)

const hrefFor = (link: SocialLink): string => {
  if (isEmail(link.platform) && !link.url.startsWith('mailto:') && !link.url.startsWith('http')) {
    return `mailto:${link.url}`
  }
  return link.url
}

/**
 * Circled mono glyphs (gh / in / @) — the spine rail and the mobile top bar.
 * The visible circle is 28–30px; an invisible inset extends the tap target to ≥44px.
 */
export const SocialGlyphs: React.FC<{ links: SocialLink[]; className?: string }> = ({
  links,
  className,
}) => {
  if (links.length === 0) return null
  return (
    <>
      {links.map((link, i) => (
        <a
          key={i}
          href={hrefFor(link)}
          {...(isEmail(link.platform) ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
          data-umami-event="social-link"
          data-umami-event-platform={link.platform.toLowerCase()}
          aria-label={displayName(link.platform)}
          className={cn(
            'relative flex size-[30px] items-center justify-center rounded-full border border-paper-border font-mono text-[9.5px] font-medium text-paper-dim transition-colors hover:border-moss hover:text-paper',
            'before:absolute before:-inset-2 before:content-[""]',
            className,
          )}
        >
          {glyph(link.platform)}
        </a>
      ))}
    </>
  )
}

/**
 * Fern text links (GitHub ↗  LinkedIn ↗  Email) — bylines, about, project pages.
 * `emailAs="address"` prints the address itself (the about page's quiet contact).
 */
export const SocialTextLinks: React.FC<{
  links: SocialLink[]
  emailAs?: 'label' | 'address'
  className?: string
}> = ({ links, emailAs = 'label', className }) => {
  if (links.length === 0) return null
  return (
    <>
      {links.map((link, i) => {
        const email = isEmail(link.platform)
        const label =
          email && emailAs === 'address'
            ? link.url.replace(/^mailto:/, '')
            : displayName(link.platform)
        return (
          <a
            key={i}
            href={hrefFor(link)}
            {...(email ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            data-umami-event="social-link"
            data-umami-event-platform={link.platform.toLowerCase()}
            className={cn(
              'font-sans text-[13.5px] font-medium text-accent hover:underline hover:underline-offset-3',
              className,
            )}
          >
            {label}
            {!email && <span aria-hidden="true"> ↗</span>}
          </a>
        )
      })}
    </>
  )
}
