import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import { SocialGlyphs } from '@/components/site/socialLinks'
import { ThemeToggle } from '@/components/site/ThemeToggle'
import { Wordmark } from '@/components/site/Wordmark'
import { formatEntryNo, formatLogDate, getPostNumbers } from '@/utilities/logbook'
import { DEFAULT_NAV } from '@/utilities/navLinks'

// Homepage variant for staging review: "cover & pages".
//
// Fold one is a full-bleed charcoal cover — the notebook cover carrying the
// name, one-line bio, follow, a blind-debossed mark and a whisper of grain.
// Scrolling opens onto the paper pages with the writing and work log.
//
// This deliberately reverses Design Spec §5 (paper home with a spine rail and
// no header/footer). It lives at /cover so it runs alongside the current home
// on staging without replacing it. Promote or delete after the review.
//
// Theme note: the cover is bg-structural (charcoal in both themes) and the
// pages are bg-surface (paper in light, charcoal in dark). The "open the cover
// onto paper" effect is therefore light-mode only; in dark the two panels
// differ by elevation, not paper-vs-cover, consistent with the rest of the
// site's dark treatment. Colours on the cover use the raw paper/moss tokens,
// not the theme-flipping body/accent tokens, because data-surface does not
// rescope those (only the theme does), so text-body on charcoal would go dark
// on dark in light mode.

export const dynamic = 'force-static'
export const revalidate = 600

export default async function CoverHome() {
  const payload = await getPayload({ config: configPromise })

  const [siteSettings, postsResult, projectsResult, postNumbers] = await Promise.all([
    payload.findGlobal({
      slug: 'site-settings',
      select: { bio: true, socialLinks: true },
    }),
    payload.find({
      collection: 'posts',
      depth: 0,
      limit: 3,
      draft: false,
      overrideAccess: false,
      sort: '-publishedAt',
      select: { title: true, slug: true, publishedAt: true },
    }),
    payload.find({
      collection: 'projects',
      depth: 0,
      limit: 3,
      overrideAccess: false,
      sort: '-year',
      where: { featured: { equals: true } },
      select: { title: true, slug: true, description: true, year: true },
    }),
    getPostNumbers(),
  ])

  const bio = siteSettings?.bio
  const socialLinks = siteSettings?.socialLinks ?? []
  const posts = postsResult.docs
  const projects = projectsResult.docs

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      {/* ── Cover ─────────────────────────────────────────────────────── */}
      <section
        data-surface="charcoal"
        className="relative flex min-h-dvh flex-col overflow-hidden bg-structural px-6 py-6 sm:px-10 md:px-12 md:py-10 lg:px-24"
      >
        {/* Material 1: a whisper of grain, so the charcoal reads as a surface
            rather than a flat fill (and dithers away banding on cheap panels).
            Tuning knob: the opacity below. */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06] mix-blend-soft-light"
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="cover-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#cover-grain)" />
        </svg>

        {/* Material 2: the cover stamp — a blind-debossed rk. bleeding off the
            corner. Tuning knobs are the two rgba values: keep it felt, not
            seen. Darker glyph fill = recessed; the faint paper highlight is the
            light catching the pressed edge. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-[3vw] -bottom-[6vw] font-mono leading-none lowercase select-none text-[42vw] md:text-[34vw] lg:text-[26vw]"
          style={{
            color: 'rgba(0, 0, 0, 0.16)',
            textShadow: '0 1px 0 rgba(247, 245, 239, 0.045)',
          }}
        >
          rk.
        </span>

        {/* Top: wordmark + nav */}
        <div className="relative flex items-center justify-between">
          <Link href="/" aria-label="richardkern.nz — home">
            <Wordmark surface="charcoal" className="text-[14px]" />
          </Link>
          <nav className="flex gap-6.5 md:gap-8.5">
            {DEFAULT_NAV.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="-my-2 py-2 font-sans text-[13px] font-medium text-paper-muted transition-colors hover:text-paper"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Centre: name + bio */}
        <div className="home-reveal relative flex flex-1 flex-col justify-center">
          <h1 className="font-display text-[clamp(3.375rem,2.1875rem+5vw,6.75rem)] leading-[0.98] font-bold tracking-[-0.03em] text-paper md:tracking-[-0.035em]">
            richard
            <br />
            kern
            <span className="text-moss">.</span>
          </h1>

          {bio && (
            <p className="mt-6 max-w-140 font-serif text-[17px] leading-[1.6] text-paper-dim md:mt-8 md:text-[21px]">
              {bio}
            </p>
          )}
        </div>

        {/* Foot: follow + theme, and a quiet scroll cue */}
        <div className="relative flex items-end justify-between">
          <div className="flex items-center gap-2.5">
            <SocialGlyphs links={socialLinks} />
            <ThemeToggle surface="charcoal" />
          </div>
          <span className="font-mono text-[10.5px] tracking-[0.16em] text-paper-faint uppercase">
            Scroll ↓
          </span>
        </div>
      </section>

      {/* ── Pages ─────────────────────────────────────────────────────── */}
      <section className="px-6 pt-8 pb-14 sm:px-10 md:px-12 md:pt-12 lg:px-24">
        {/* Slim chrome so the pages stay navigable once the cover scrolls off */}
        <div className="mb-10 flex items-center justify-between border-b border-rule pb-4 md:mb-14">
          <Link href="/" className="inline-block">
            <Wordmark className="text-[14px]" />
          </Link>
          <nav className="flex gap-6.5 md:gap-8.5">
            {DEFAULT_NAV.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="-my-2 py-2 font-sans text-[13px] font-medium text-body transition-colors hover:text-accent"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="grid gap-9.5 md:grid-cols-2 md:gap-16 lg:gap-24">
          <section>
            <SectionLabel>Writing</SectionLabel>
            {posts.length > 0 ? (
              posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="group grid grid-cols-[64px_1fr] gap-3.5 border-b border-hairline py-3.5 md:grid-cols-[96px_1fr] md:gap-4.5"
                >
                  <span className="font-mono text-[10.5px] leading-[1.9] text-muted md:text-[11px]">
                    {postNumbers.has(post.id) && (
                      <>
                        {formatEntryNo(postNumbers.get(post.id)!)}
                        <br />
                      </>
                    )}
                    {post.publishedAt && formatLogDate(post.publishedAt, 'day')}
                  </span>
                  <span className="self-center font-serif text-[15px] leading-[1.45] text-body transition-colors group-hover:text-accent md:text-[16px]">
                    {post.title}
                  </span>
                </Link>
              ))
            ) : (
              <p className="py-3.5 font-serif text-[15px] text-muted">Nothing logged yet.</p>
            )}
            <p className="mt-4">
              <Link
                href="/posts"
                className="font-sans text-[13px] font-medium text-accent hover:underline"
              >
                Full log →
              </Link>
            </p>
          </section>

          <section>
            <SectionLabel>Selected work</SectionLabel>
            {projects.length > 0 ? (
              projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/work/${project.slug}`}
                  className="group grid grid-cols-[64px_1fr] gap-3.5 border-b border-hairline py-3.5 md:grid-cols-[96px_1fr] md:gap-4.5"
                >
                  <span className="font-mono text-[10.5px] leading-[1.9] text-muted md:text-[11px]">
                    {project.year}
                  </span>
                  <span>
                    <span className="font-serif text-[15px] leading-[1.45] text-body transition-colors group-hover:text-accent md:text-[16px]">
                      {project.title}
                    </span>
                    {project.description && (
                      <span className="mt-0.75 block font-sans text-[12px] leading-normal text-muted md:text-[12.5px]">
                        {project.description}
                      </span>
                    )}
                  </span>
                </Link>
              ))
            ) : (
              <p className="py-3.5 font-serif text-[15px] text-muted">Nothing to show yet.</p>
            )}
            <p className="mt-4">
              <Link
                href="/work"
                className="font-sans text-[13px] font-medium text-accent hover:underline"
              >
                All work →
              </Link>
            </p>
          </section>
        </div>
      </section>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-1 border-b border-rule-strong pb-2.5 font-sans text-[10.5px] font-medium tracking-[0.16em] text-muted uppercase md:text-[11px]">
      {children}
    </h2>
  )
}
