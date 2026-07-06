import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Media } from '@/components/Media'
import { SocialTextLinks } from '@/components/site/socialLinks'
import { generateMeta } from '@/utilities/generateMeta'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { formatEntryNo, formatLogDate, getPostNumbers } from '@/utilities/logbook'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = posts.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function PostPage({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  const [postNumbers, siteSettings] = await Promise.all([
    getPostNumbers(),
    getCachedGlobal('site-settings', 0)(),
  ])

  const entryNo = postNumbers.get(post.id)
  const byline = siteSettings?.byline || siteSettings?.bio
  const socialLinks = siteSettings?.socialLinks ?? []
  const tags = (post.tags ?? []).filter((t) => typeof t === 'object')

  return (
    <article className="mx-auto w-full max-w-[720px] px-6 pt-12 pb-16 md:pt-[76px] md:pb-[72px]">
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <p className="font-mono text-[12px] tracking-[0.04em] text-haze">
        {entryNo && <span>{formatEntryNo(entryNo)}</span>}
        {entryNo && post.publishedAt && <span aria-hidden="true"> &nbsp;·&nbsp; </span>}
        {post.publishedAt && (
          <time dateTime={post.publishedAt}>{formatLogDate(post.publishedAt, 'long')}</time>
        )}
        {tags.length > 0 && (
          <>
            <span aria-hidden="true"> &nbsp;·&nbsp; </span>
            {tags.map((tag, i) => (
              <React.Fragment key={tag.id}>
                {i > 0 && ' '}
                <Link href={`/posts?tag=${tag.slug}`} className="text-fern hover:underline">
                  {tag.name}
                </Link>
              </React.Fragment>
            ))}
          </>
        )}
      </p>

      <h1 className="mt-[18px] font-display text-[32px] leading-[1.08] font-bold tracking-[-0.03em] text-ink md:text-[46px]">
        {post.title}
      </h1>

      {post.coverImage && typeof post.coverImage === 'object' && (
        <Media
          resource={post.coverImage}
          imgClassName="mt-10 w-full border border-rule"
        />
      )}

      <div className="mt-8 md:mt-10">
        <RichText data={post.content} enableGutter={false} />
      </div>

      <footer className="mt-12 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4 border-t border-rule-strong pt-[22px] md:mt-16">
        <p className="font-serif text-[14.5px] leading-[1.6] text-haze italic">
          {byline}{' '}
          <span className="inline-flex flex-wrap gap-x-3 not-italic">
            <SocialTextLinks links={socialLinks} className="text-[13px]" />
          </span>
        </p>
        <Link
          href="/posts"
          className="flex-none font-sans text-[13px] font-medium text-fern hover:underline"
        >
          ← Full log
        </Link>
      </footer>
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
