import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import { JsonLd } from '@/components/JsonLd'
import { Media } from '@/components/Media'
import { SocialGlyphs } from '@/components/site/socialLinks'
import { ThemeToggle } from '@/components/site/ThemeToggle'
import { Wordmark } from '@/components/site/Wordmark'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { homeJsonLd } from '@/utilities/jsonld'
import { formatEntryNo, formatLogDate } from '@/utilities/logbook'
import { navLinksFrom } from '@/utilities/navLinks'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  const [siteSettings, header, postsResult, projectsResult] = await Promise.all([
    payload.findGlobal({
      slug: 'site-settings',
      select: { bio: true, socialLinks: true },
    }),
    getCachedGlobal('header', 1)(),
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
      depth: 1,
      limit: 3,
      overrideAccess: false,
      sort: '-year',
      where: { featured: { equals: true } },
      select: { title: true, slug: true, description: true, year: true, coverImage: true },
    }),
  ])

  const bio = siteSettings?.bio
  const socialLinks = siteSettings?.socialLinks ?? []
  const navLinks = navLinksFrom(header)
  // Entry N° is the post's chronological position (oldest = 1). These three are
  // the newest posts sorted -publishedAt, so the newest is totalDocs and each
  // older one is one less — no separate full-scan needed on the homepage.
  const totalPosts = postsResult.totalDocs
  const posts = postsResult.docs
  const projects = projectsResult.docs

  return (
    <>
      <JsonLd data={homeJsonLd(siteSettings)} />
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
        {/* Content column: width-capped and centred so the two leaves read as
            a spread rather than flung to opposite edges on a wide display. On
            lg the identity leaf (name + statement) and the log leaf (writing
            over selected work) sit side by side, top-aligned; below lg they
            stack. */}
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col min-[2100px]:max-w-[100rem]">
          <nav className="flex gap-6.5 md:justify-end md:gap-8.5">
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="-my-2 py-2 font-sans text-[13.5px] font-medium text-body transition-colors hover:text-accent md:text-[13px]"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="home-reveal mt-10 flex flex-1 flex-col gap-12 lg:mt-14 lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-x-16 lg:gap-y-0 min-[2100px]:content-center min-[2100px]:gap-x-24">
            {/* Left leaf — the title page: name over statement */}
            <div>
              <h1 className="font-display text-[clamp(3.375rem,2.1875rem+5vw,6.75rem)] leading-[0.98] font-bold tracking-[-0.03em] text-body md:tracking-[-0.035em] min-[2100px]:text-[8rem]">
                richard
                <br />
                kern
                <span className="text-accent">.</span>
              </h1>

              {bio && (
                <p className="mt-5.5 max-w-140 font-serif text-[17px] leading-[1.6] text-body md:mt-8 md:text-[21px] min-[2100px]:text-[24px]">
                  {bio}
                </p>
              )}
            </div>

            {/* Right leaf — the log: writing over selected work, stacked */}
            <div className="flex flex-col gap-10 lg:gap-12 min-[2100px]:gap-16">
              <section>
                <SectionLabel>Writing</SectionLabel>
                {posts.length > 0 ? (
                  posts.map((post, index) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.slug}`}
                      className="group grid grid-cols-[64px_1fr] gap-3.5 border-b border-hairline py-3.5 md:grid-cols-[96px_1fr] md:gap-4.5"
                    >
                      <span className="font-mono text-[10.5px] leading-[1.9] text-muted md:text-[11px]">
                        {totalPosts > 0 && (
                          <>
                            {formatEntryNo(totalPosts - index)}
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
                  <div className="space-y-6">
                    {projects.map((project) => (
                      <Link
                        key={project.id}
                        href={`/work/${project.slug}`}
                        className="group block border-b border-hairline pb-5"
                      >
                        {/* Work is the visual pillar: a full-width cover over the
                            meta, the Work-index card shrunk for the home. Height is
                            bounded (not ratio-driven) so three featured items don't
                            tower; tech list is index-only, and Writing stays log text. */}
                        <div className="relative h-[168px] w-full overflow-hidden border border-rule bg-hairline md:h-[188px] min-[2100px]:h-[224px]">
                          {project.coverImage && typeof project.coverImage === 'object' && (
                            <Media
                              resource={project.coverImage}
                              fill
                              imgClassName="object-cover object-top"
                              size="(max-width: 1024px) 92vw, 760px"
                            />
                          )}
                        </div>
                        <div className="mt-3 flex items-baseline justify-between gap-4">
                          <h3 className="font-serif text-[15px] leading-[1.45] text-body transition-colors group-hover:text-accent md:text-[16px]">
                            {project.title}
                          </h3>
                          <span className="flex-none font-mono text-[10.5px] text-muted md:text-[11px]">
                            {project.year}
                          </span>
                        </div>
                        {project.description && (
                          <p className="mt-1.5 font-sans text-[12px] leading-normal text-muted md:text-[12.5px]">
                            {project.description}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
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
    </>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-1 border-b border-rule-strong pb-2.5 font-sans text-[10.5px] font-medium tracking-[0.16em] text-muted uppercase md:text-[11px]">
      {children}
    </h2>
  )
}
