import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import React, { cache } from 'react'

import { JsonLd } from '@/components/JsonLd'
import { Media } from '@/components/Media'
import { ImageZoom } from '@/components/site/ImageZoom'
import RichText from '@/components/RichText'
import { generateMeta } from '@/utilities/generateMeta'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { projectJsonLd } from '@/utilities/jsonld'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { projectTechLabels } from '@/utilities/projectTech'

// ISR: prerendered project pages refresh at most every 10 minutes.
export const revalidate = 600

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

  const siteSettings = await getCachedGlobal('site-settings', 0)()

  const tech = projectTechLabels(project).join(' · ')
  const gallery = (project.images ?? []).filter(
    (item) => item.image && typeof item.image === 'object',
  )

  return (
    <article className="mx-auto w-full max-w-220 px-6 pt-12 pb-16 md:pt-17 md:pb-19">
      <JsonLd data={projectJsonLd(project, siteSettings)} />
      <PayloadRedirects disableNotFound url={url} />

      <p className="font-mono text-[12px] text-muted">
        {project.year}
        {tech && (
          <>
            <span aria-hidden="true"> &nbsp;·&nbsp; </span>
            {tech}
          </>
        )}
      </p>

      <h1 className="mt-3.5 font-display text-[34px] leading-[1.05] font-bold tracking-[-0.03em] break-words text-body md:text-[44px]">
        {project.title}
      </h1>

      {(project.url || project.repoUrl) && (
        <div className="mt-5 flex flex-wrap gap-6">
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="-my-2 inline-block py-2 font-sans text-[13.5px] font-medium text-accent hover:underline"
            >
              Live site <span aria-hidden="true">↗</span>
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="-my-2 inline-block py-2 font-sans text-[13.5px] font-medium text-accent hover:underline"
            >
              Repository <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      )}

      {project.longDescription && (
        <div className="mt-9 max-w-[68ch] md:mt-11">
          <RichText
            data={project.longDescription}
            enableGutter={false}
            className="prose-p:text-[18px]"
          />
        </div>
      )}

      {gallery.length > 0 && (
        <div className="mt-9 grid gap-6 md:mt-11 md:grid-cols-2">
          {gallery.map((item, i) => {
            const img = item.image
            if (!img || typeof img !== 'object') return null
            return (
              <ImageZoom
                key={i}
                src={getMediaUrl(img.url, img.updatedAt)}
                alt={img.alt || project.title}
                className="relative aspect-16/10 overflow-hidden border border-rule bg-hairline"
              >
                <Media
                  resource={img}
                  fill
                  imgClassName="object-cover"
                  size="(max-width: 768px) 100vw, 420px"
                />
              </ImageZoom>
            )
          })}
        </div>
      )}

      <p className="mt-10">
        <Link href="/work" className="font-sans text-[13px] font-medium text-accent hover:underline">
          ← All work
        </Link>
      </p>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const project = await queryProjectBySlug({ slug: decodedSlug })

  return generateMeta({ doc: project, collection: 'projects' })
}

const queryProjectBySlug = cache(async ({ slug }: { slug: string }) => {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'projects',
    // depth 1 covers coverImage, gallery uploads, tags, and meta.image — every
    // relationship the page reads is one hop from the project. Default depth 2
    // only adds an unused second hop.
    depth: 1,
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
