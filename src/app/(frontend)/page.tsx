import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import { SocialGlyphs } from '@/components/site/socialLinks'
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
        className="flex items-center justify-between bg-charcoal px-5 py-3 md:hidden"
      >
        <Link href="/" aria-label="richardkern.nz — home">
          <Wordmark surface="charcoal" className="text-[13px]" />
        </Link>
        <div className="flex gap-2">
          <SocialGlyphs links={socialLinks} className="size-7 text-[9px]" />
        </div>
      </div>

      {/* Desktop: the notebook spine — vertical wordmark, socials pinned at the foot */}
      <aside
        data-surface="charcoal"
        className="hidden w-21.5 flex-none flex-col items-center bg-charcoal pt-7.5 pb-6 md:flex"
      >
        <div className="flex flex-1 items-start justify-center">
          <span className="rotate-180 [writing-mode:vertical-rl]">
            <Wordmark surface="charcoal" className="text-[13px]" />
          </span>
        </div>
        <div className="flex flex-col gap-2.5">
          <SocialGlyphs links={socialLinks} />
        </div>
      </aside>

      <main className="flex flex-1 flex-col px-6 pt-6 pb-11 md:px-12 md:pt-11 md:pb-12 lg:pr-24 lg:pl-26">
        <nav className="flex gap-6.5 md:justify-end md:gap-8.5">
          {DEFAULT_NAV.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="-my-2 py-2 font-sans text-[13.5px] font-medium text-ink transition-colors hover:text-fern md:text-[13px]"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="home-reveal mt-10 flex flex-1 flex-col md:mt-19.5">
          <h1 className="font-display text-[clamp(3.375rem,2.1875rem+5vw,6.75rem)] leading-[0.98] font-bold tracking-[-0.03em] text-ink md:tracking-[-0.035em]">
            richard
            <br />
            kern
            <span className="text-fern">.</span>
          </h1>

          {bio && (
            <p className="mt-5.5 max-w-140 font-serif text-[17px] leading-[1.6] text-ink md:mt-8 md:text-[21px]">
              {bio}
            </p>
          )}

          <div className="mt-11.5 grid gap-9.5 md:mt-auto md:grid-cols-2 md:gap-16 md:pt-16 lg:gap-24">
            <section>
              <SectionLabel>Writing</SectionLabel>
              {posts.length > 0 ? (
                posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.slug}`}
                    className="group grid grid-cols-[64px_1fr] gap-3.5 border-b border-hairline py-3.5 md:grid-cols-[96px_1fr] md:gap-4.5"
                  >
                    <span className="font-mono text-[10.5px] leading-[1.9] text-haze md:text-[11px]">
                      {postNumbers.has(post.id) && (
                        <>
                          {formatEntryNo(postNumbers.get(post.id)!)}
                          <br />
                        </>
                      )}
                      {post.publishedAt && formatLogDate(post.publishedAt, 'day')}
                    </span>
                    <span className="self-center font-serif text-[15px] leading-[1.45] text-ink transition-colors group-hover:text-fern md:text-[16px]">
                      {post.title}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="py-3.5 font-serif text-[15px] text-haze">Nothing logged yet.</p>
              )}
              <p className="mt-4">
                <Link
                  href="/posts"
                  className="font-sans text-[13px] font-medium text-fern hover:underline"
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
                    <span className="font-mono text-[10.5px] leading-[1.9] text-haze md:text-[11px]">
                      {project.year}
                    </span>
                    <span>
                      <span className="font-serif text-[15px] leading-[1.45] text-ink transition-colors group-hover:text-fern md:text-[16px]">
                        {project.title}
                      </span>
                      {project.description && (
                        <span className="mt-0.75 block font-sans text-[12px] leading-normal text-haze md:text-[12.5px]">
                          {project.description}
                        </span>
                      )}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="py-3.5 font-serif text-[15px] text-haze">Nothing to show yet.</p>
              )}
              <p className="mt-4">
                <Link
                  href="/work"
                  className="font-sans text-[13px] font-medium text-fern hover:underline"
                >
                  All work →
                </Link>
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-1 border-b border-rule-strong pb-2.5 font-sans text-[10.5px] font-medium tracking-[0.16em] text-haze uppercase md:text-[11px]">
      {children}
    </h2>
  )
}
