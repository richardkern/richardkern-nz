import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React, { cache } from 'react'
import Link from 'next/link'

import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const projects = await payload.find({
    collection: 'projects',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  return projects.docs.map(({ slug }) => ({ slug }))
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function ProjectPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/work/' + decodedSlug
  const project = await queryProjectBySlug({ slug: decodedSlug })

  if (!project) return <PayloadRedirects url={url} />

  return (
    <article className="pt-16 pb-16">
      <PayloadRedirects disableNotFound url={url} />

      <div className="container mb-8">
        {project.coverImage && typeof project.coverImage !== 'number' && (
          <div className="relative w-full aspect-video mb-8 overflow-hidden rounded-lg">
            <Media resource={project.coverImage} imgClassName="object-cover w-full h-full" />
          </div>
        )}

        <div className="prose dark:prose-invert max-w-3xl">
          <h1>{project.title}</h1>
          {project.description && <p className="lead">{project.description}</p>}
        </div>

        <div className="flex gap-6 mt-4 text-sm flex-wrap items-center">
          {project.year && (
            <span className="text-muted-foreground">{project.year}</span>
          )}
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Live site ↗
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Repository ↗
            </a>
          )}
        </div>

        {project.tech && project.tech.length > 0 && (
          <div className="flex gap-2 mt-4 flex-wrap">
            {project.tech.map((t, i) => (
              <span key={i} className="text-xs border border-border rounded px-2 py-1">
                {t.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {project.longDescription && (
        <div className="container">
          <RichText
            className="max-w-3xl"
            data={project.longDescription}
            enableGutter={false}
          />
        </div>
      )}

      <div className="container mt-12">
        <Link href="/work" className="underline text-sm">
          ← All work
        </Link>
      </div>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const project = await queryProjectBySlug({ slug: decodedSlug })

  return {
    title: project?.title ?? 'Project',
    description: project?.description ?? undefined,
  }
}

const queryProjectBySlug = cache(async ({ slug }: { slug: string }) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'projects',
    limit: 1,
    overrideAccess: false,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
