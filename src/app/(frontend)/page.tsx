import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import { SocialGlyphs } from '@/components/site/socialLinks'
import { ThemeToggle } from '@/components/site/ThemeToggle'
import { Wordmark } from '@/components/site/Wordmark'
import { formatEntryNo, formatLogDate, getPostNumbers } from '@/utilities/logbook'
import { DEFAULT_NAV } from '@/utilities/navLinks'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function HomePage() {
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
    <div className="flex flex-1 flex-col md:flex-row">
      {/* Mobile: the spine collapses to a charcoal top bar (mock 6a) */}
      <div
        data-surface="charcoal"
        className="flex items-center justify-between bg-structural px-5 py-3 md:hidden"
      >
        <Link href="/" aria-label="richardkern.nz — home">
          <Wordmark surface="charcoal" className="text-[13px]" />
        </Link>
        <div className="flex items-center gap-2">
          <SocialGlyphs links={socialLinks} className="size-7 text-[9px]" />
          <ThemeToggle surface="charcoal" className="size-7" />
        </div>
      </div>

      {/* Desktop: the notebook spine — vertical wordmark, socials pinned at the foot */}
      <aside
        data-surface="charcoal"
        className="hidden w-21.5 flex-none flex-col items-center bg-structural pt-7.5 pb-6 md:flex"
      >
        <div className="flex flex-1 items-start justify-center">
          <span className="rotate-180 [writing-mode:vertical-rl]">
            <Wordmark surface="charcoal" className="text-[13px]" />
          </span>
        </div>
        <div className="flex flex-col items-center gap-2.5">
          <ThemeToggle surface="charcoal" />
          <SocialGlyphs links={socialLinks} />
        </div>
      </aside>

      <main className="flex flex-1 flex-col px-6 pt-6 pb-11 md:px-12 md:pt-11 md:pb-12 lg:px-24">
        {/* Content column: capped and centred so it doesn't sprawl on wide
            displays, and no longer bottom-pinned so the log sits up under the
            bio on the first screen rather than leaving a mid-page void. */}
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col">
          <nav className="flex gap-6.5 md:justify-end md:gap-8.5">
            {DEFAULT_NAV.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="-my-2 py-2 font-sans text-[13.5px] font-medium text-body transition-colors hover:text-accent md:text-[13px]"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="home-reveal mt-10 flex flex-1 flex-col justify-center">
            <h1 className="font-display text-[clamp(3.375rem,2.1875rem+5vw,6.75rem)] leading-[0.98] font-bold tracking-[-0.03em] text-body md:tracking-[-0.035em]">
              richard
              <br />
              kern
              <span className="text-accent">.</span>
            </h1>

            {bio && (
              <p className="mt-5.5 max-w-140 font-serif text-[17px] leading-[1.6] text-body md:mt-8 md:text-[21px]">
                {bio}
              </p>
            )}

            <div className="mt-12 grid gap-9.5 md:mt-16 md:grid-cols-2 md:gap-16 lg:gap-24">
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
          </div>
        </div>
      </main>
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
