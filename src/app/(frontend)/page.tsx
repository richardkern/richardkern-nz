import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import { Github, Linkedin, Mail } from 'lucide-react'

import { formatDateTime } from '@/utilities/formatDateTime'

export const dynamic = 'force-static'
export const revalidate = 600

const PLATFORM_ICONS: Record<
  string,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  github: Github,
  linkedin: Linkedin,
  email: Mail,
  mail: Mail,
}

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  const [siteSettings, postsResult, projectsResult] = await Promise.all([
    payload.findGlobal({
      slug: 'site-settings',
      select: { bio: true, socialLinks: true },
    }),
    payload.find({
      collection: 'posts',
      depth: 0,
      limit: 3,
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
  ])

  const bio = siteSettings?.bio
  const socialLinks = siteSettings?.socialLinks ?? []
  const recentPosts = postsResult.docs
  const featuredProjects = projectsResult.docs

  return (
    <div className="fixed inset-0 z-50 bg-[#111] text-[#e5e5e5] font-sans flex overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className="w-52 shrink-0 flex flex-col px-8 py-10 border-r border-white/[0.07] h-full">
        {/* Nav */}
        <nav className="flex flex-col gap-5">
          <Link
            href="/"
            className="text-[11px] uppercase tracking-[0.18em] underline underline-offset-4 decoration-white/40"
          >
            Home
          </Link>
          <Link
            href="/posts"
            className="text-[11px] uppercase tracking-[0.18em] text-[#e5e5e5]/50 hover:text-[#e5e5e5] transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/work"
            className="text-[11px] uppercase tracking-[0.18em] text-[#e5e5e5]/50 hover:text-[#e5e5e5] transition-colors"
          >
            Work
          </Link>
        </nav>

        {/* Social icons */}
        {socialLinks.length > 0 && (
          <div className="flex gap-4 mt-10">
            {socialLinks.map((link, i) => {
              const Icon = PLATFORM_ICONS[link.platform.toLowerCase()]
              if (!Icon) return null
              return (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#e5e5e5]/40 hover:text-[#e5e5e5] transition-colors"
                  aria-label={link.platform}
                >
                  <Icon className="w-3.75 h-3.75" strokeWidth={1.5} />
                </a>
              )
            })}
          </div>
        )}

        {/* Copyright */}
        <p className="mt-auto text-[10px] tracking-wide text-[#e5e5e5]/25">© Richard Kern</p>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto px-14 py-10 lg:px-20">
        {/* Name */}
        <h1 className="text-[clamp(3rem,7.5vw,8.5rem)] font-thin tracking-tight leading-[0.88] text-[#e5e5e5] mb-5">
          RICHARD
          <br />
          KERN
        </h1>

        {/* Subtitle */}
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#e5e5e5]/50 mb-3">
          Product Manager / Builder
        </p>

        {/* Contact */}
        <p className="text-[12px] text-[#e5e5e5]/35 mb-16">
          Get in touch at{' '}
          <a
            href="mailto:richard@richardkern.nz"
            className="underline underline-offset-2 decoration-white/20 hover:text-[#e5e5e5]/70 transition-colors"
          >
            richard@richardkern.nz
          </a>
        </p>

        {/* ── About ── */}
        {bio && (
          <section className="mb-14 max-w-lg">
            <SectionLabel>About Me</SectionLabel>
            <p className="text-[13px] leading-relaxed text-[#e5e5e5]/70">{bio}</p>
          </section>
        )}

        {/* ── Recent Posts ── */}
        <section className="mb-14 max-w-lg">
          <SectionLabel>Recent Posts</SectionLabel>
          {recentPosts.length > 0 ? (
            <ul>
              {recentPosts.map((post) => (
                <li key={post.id} className="border-b border-white/[0.07] last:border-0">
                  <Link
                    href={`/posts/${post.slug}`}
                    className="group flex items-baseline justify-between gap-6 py-3"
                  >
                    <span className="text-[13px] text-[#e5e5e5]/80 group-hover:text-[#e5e5e5] group-hover:underline underline-offset-2 transition-colors">
                      {post.title}
                    </span>
                    {post.publishedAt && (
                      <span className="text-[11px] text-[#e5e5e5]/30 shrink-0">
                        {formatDateTime(post.publishedAt)}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-[#e5e5e5]/30 py-3">No posts yet.</p>
          )}
          <Link
            href="/posts"
            className="mt-4 inline-block text-[11px] text-[#e5e5e5]/30 hover:text-[#e5e5e5]/70 tracking-wide transition-colors"
          >
            All posts →
          </Link>
        </section>

        {/* ── Featured Work ── */}
        <section className="max-w-lg">
          <SectionLabel>Featured Work</SectionLabel>
          {featuredProjects.length > 0 ? (
            <ul>
              {featuredProjects.map((project) => (
                <li key={project.id} className="border-b border-white/[0.07] last:border-0">
                  <Link href={`/work/${project.slug}`} className="group block py-3">
                    <div className="flex items-baseline justify-between gap-6">
                      <span className="text-[13px] text-[#e5e5e5]/80 group-hover:text-[#e5e5e5] group-hover:underline underline-offset-2 transition-colors">
                        {project.title}
                      </span>
                      {project.year && (
                        <span className="text-[11px] text-[#e5e5e5]/30 shrink-0">
                          {project.year}
                        </span>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-[12px] text-[#e5e5e5]/40 mt-0.5 leading-snug">
                        {project.description}
                      </p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-[#e5e5e5]/30 py-3">No featured projects yet.</p>
          )}
          <Link
            href="/work"
            className="mt-4 inline-block text-[11px] text-[#e5e5e5]/30 hover:text-[#e5e5e5]/70 tracking-wide transition-colors"
          >
            All work →
          </Link>
        </section>
      </main>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.2em] text-[#e5e5e5]/30 mb-4 border-b border-white/[0.07] pb-2">
      {children}
    </p>
  )
}
