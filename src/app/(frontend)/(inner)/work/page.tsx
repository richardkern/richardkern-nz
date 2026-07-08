import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import { Media } from '@/components/Media'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const projects = await payload.find({
    collection: 'projects',
    depth: 1,
    limit: 100,
    overrideAccess: false,
    sort: ['-featured', '-year'],
    select: {
      title: true,
      slug: true,
      description: true,
      year: true,
      tech: true,
      featured: true,
      coverImage: true,
    },
  })

  return (
    <div className="mx-auto w-full max-w-[1080px] px-6 pt-12 pb-16 md:pt-[68px] md:pb-[76px]">
      <h1 className="font-display text-[34px] leading-[1.05] font-bold tracking-[-0.03em] text-body md:text-[44px]">
        Work
      </h1>

      {projects.totalDocs === 0 ? (
        <p className="py-10 font-serif text-[17px] text-muted">Nothing to show yet.</p>
      ) : (
        <div className="mt-9 grid gap-12 md:mt-11 md:grid-cols-2 md:gap-x-14 md:gap-y-16">
          {projects.docs.map((project) => (
            <Link key={project.id} href={`/work/${project.slug}`} className="group block">
              <div className="relative aspect-[16/10] overflow-hidden border border-rule bg-hairline">
                {project.coverImage && typeof project.coverImage === 'object' && (
                  <Media
                    resource={project.coverImage}
                    fill
                    imgClassName="object-cover"
                    size="(max-width: 768px) 100vw, 512px"
                  />
                )}
              </div>
              <div className="mt-4 flex items-baseline justify-between gap-6">
                <h2 className="font-display text-[19px] leading-[1.2] font-semibold tracking-[-0.02em] text-body transition-colors group-hover:text-accent md:text-[22px]">
                  {project.title}
                </h2>
                <span className="flex-none font-mono text-[11.5px] text-muted">
                  {project.year}
                  {project.featured && ' · featured'}
                </span>
              </div>
              {project.description && (
                <p className="mt-2 font-sans text-[14px] leading-[1.55] text-muted">
                  {project.description}
                </p>
              )}
              {project.tech && project.tech.length > 0 && (
                <p className="mt-2.5 font-mono text-[11.5px] text-accent">
                  {project.tech.map((t) => t.label).join(' · ')}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Work',
    description:
      'A look at what Richard Kern has built: the tech behind each project, the decisions that shaped it, and where to find it running.',
  }
}
