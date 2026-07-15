import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import React, { cache } from 'react'
import RichText from '@/components/RichText'

import { JsonLd } from '@/components/JsonLd'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { Media } from '@/components/Media'
import { ImageZoom } from '@/components/site/ImageZoom'
import { SocialTextLinks } from '@/components/site/socialLinks'
import { generateMeta } from '@/utilities/generateMeta'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { postJsonLd } from '@/utilities/jsonld'
import { formatEntryNo, formatLogDate, getPostNumbers } from '@/utilities/logbook'

// ISR: statically prerendered pages refresh at most every 10 minutes, so
// edited/published posts appear without a full rebuild.
export const revalidate = 600

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

  const cover = typeof post.coverImage === 'object' ? post.coverImage : null
  const hasCover = Boolean(cover)
  // Full-res original for the click-to-enlarge lightbox (relativised so it never
  // hits the auth-gated optimizer path).
  const coverAlt = cover?.alt || post.title
  const coverFullSrc = cover ? getMediaUrl(cover.url, cover.updatedAt) : ''

  // Only widen into the two-column grid when there's a cover to fill the right
  // column. A coverless post keeps the normal single centred reading column
  // rather than reserving an empty 360px track and pushing the text left.
  const articleClass = hasCover
    ? 'mx-auto w-full max-w-[720px] px-6 pt-12 pb-16 md:pt-[76px] md:pb-[72px] lg:grid lg:max-w-[1040px] lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-x-12'
    : 'mx-auto w-full max-w-[720px] px-6 pt-12 pb-16 md:pt-[76px] md:pb-[72px]'

  return (
    // On wide (lg+) viewports a post with a cover becomes a two-column grid: the
    // text keeps its reading measure on the left, the cover sits beside it on the
    // right. Below lg (and for coverless posts) it's a single centred column.
    <article className={articleClass}>
      <JsonLd data={postJsonLd(post, siteSettings)} />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      {/* Text column. Wrapped so it occupies a single grid row, keeping the cover
          (a separate grid child) top-aligned beside it without inflating a row. */}
      <div className="lg:col-start-1">
        <p className="font-mono text-[12px] tracking-[0.04em] text-muted">
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
                  <Link href={`/posts?tag=${tag.slug}`} className="text-accent hover:underline">
                    {tag.name}
                  </Link>
                </React.Fragment>
              ))}
            </>
          )}
        </p>

        <h1 className="mt-[18px] font-display text-[32px] leading-[1.08] font-bold tracking-[-0.03em] break-words text-body md:text-[46px]">
          {post.title}
        </h1>

        {/* Cover stacked inline on narrow screens; the wide-screen copy lives in the
            right column below. Only the visible one loads (a hidden lazy image never
            fetches), so rendering both is cheap and avoids a grid row-span hack. */}
        {cover && (
          <ImageZoom src={coverFullSrc} alt={coverAlt} className="mt-10 block lg:hidden">
            <Media
              resource={cover}
              alt={coverAlt}
              htmlElement={null}
              imgClassName="w-full border border-rule"
              size="(max-width: 1024px) 92vw, 720px"
            />
          </ImageZoom>
        )}

        <div className="mt-8 md:mt-10">
          <RichText data={post.content} enableGutter={false} />
        </div>

        <footer className="mt-12 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4 border-t border-rule-strong pt-[22px] md:mt-16">
          <p className="font-serif text-[14.5px] leading-[1.6] text-muted italic">
            {byline}{' '}
            <span className="inline-flex flex-wrap gap-x-3 not-italic">
              <SocialTextLinks links={socialLinks} className="text-[13px]" />
            </span>
          </p>
          <Link
            href="/posts"
            className="-my-2 inline-block flex-none py-2 font-sans text-[13px] font-medium text-accent hover:underline"
          >
            <span aria-hidden="true">←</span> Full log
          </Link>
        </footer>
      </div>

      {cover && (
        <ImageZoom
          src={coverFullSrc}
          alt={coverAlt}
          className="hidden lg:col-start-2 lg:row-start-1 lg:block lg:sticky lg:top-[88px] lg:self-start"
        >
          <Media
            resource={cover}
            alt={coverAlt}
            htmlElement={null}
            imgClassName="w-full border border-rule"
            size="360px"
          />
        </ImageZoom>
      )}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  return generateMeta({ doc: post, collection: 'posts' })
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
