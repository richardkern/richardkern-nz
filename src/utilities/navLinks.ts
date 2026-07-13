import type { Footer, Header } from '@/payload-types'

export type NavLink = { label: string; href: string }

/** Default nav when the Header/Footer globals haven't been populated yet */
export const DEFAULT_NAV: NavLink[] = [
  { label: 'Posts', href: '/posts' },
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
]

/** Resolve a link field (reference or custom URL) to a plain href */
export const navLinksFrom = (global: Header | Footer | null | undefined): NavLink[] => {
  const items = global?.navItems ?? []

  const links = items.flatMap(({ link }): NavLink[] => {
    if (link.type === 'custom') {
      return link.url ? [{ label: link.label, href: link.url }] : []
    }
    const ref = link.reference
    if (ref && typeof ref.value === 'object' && ref.value.slug) {
      const prefix = ref.relationTo === 'posts' ? '/posts/' : '/'
      return [{ label: link.label, href: `${prefix}${ref.value.slug}` }]
    }
    return []
  })

  return links.length > 0 ? links : DEFAULT_NAV
}
