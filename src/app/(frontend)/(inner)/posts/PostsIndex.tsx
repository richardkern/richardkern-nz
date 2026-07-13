import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { cn } from '@/utilities/ui'
import { formatEntryNo, formatLogDate, getPostNumbers } from '@/utilities/logbook'

export const POSTS_PER_PAGE = 10

type Props = {
  page?: number
  tag?: string
}

/**
 * Shared renderer for /posts and /posts/page/[n] — the logbook index.
 * The tag filter (?tag=) shows all matches unpaginated; entry N° stays the
 * post's real chronological position either way.
 */
export async function PostsIndex({ page = 1, tag }: Props) {
  const payload = await getPayload({ config: configPromise })

  const [tagsResult, postNumbers, posts] = await Promise.all([
    payload.find({
      collection: 'tags',
      limit: 100,
      pagination: false,
      sort: 'name',
      select: { name: true, slug: true },
    }),
    getPostNumbers(),
    payload.find({
      collection: 'posts',
      depth: 1,
      draft: false,
      overrideAccess: false,
      sort: '-publishedAt',
      ...(tag
        ? { pagination: false, limit: 1000, where: { 'tags.slug': { equals: tag } } }
        : { limit: POSTS_PER_PAGE, page }),
      select: {
        title: true,
        slug: true,
        publishedAt: true,
        tags: true,
        meta: { description: true },
      },
    }),
  ])

  if (!tag && page > 1 && posts.docs.length === 0) notFound()

  const tags = tagsResult.docs
  const activeTag = tag ? tags.find((t) => t.slug === tag) : undefined

  return (
    <div className="mx-auto w-full max-w-[880px] px-6 pt-12 pb-16 md:pt-[68px] md:pb-[76px]">
      <h1 className="font-display text-[34px] leading-[1.05] font-bold tracking-[-0.03em] text-body md:text-[44px]">
        Posts
      </h1>

      {tags.length > 0 && (
        <nav
          aria-label="Filter by tag"
          className="mt-5 flex flex-wrap gap-x-[22px] gap-y-2 border-b border-rule pb-3.5 md:mt-[26px]"
        >
          <Link
            href="/posts"
            className={cn(
              '-my-2 py-2 font-sans text-[13px]',
              !tag
                ? 'font-medium text-accent underline decoration-[1.5px] underline-offset-[5px]'
                : 'text-muted transition-colors hover:text-accent',
            )}
          >
            All
          </Link>
          {tags.map((t) => (
            <Link
              key={t.id}
              href={`/posts?tag=${t.slug}`}
              className={cn(
                '-my-2 py-2 font-sans text-[13px]',
                tag === t.slug
                  ? 'font-medium text-accent underline decoration-[1.5px] underline-offset-[5px]'
                  : 'text-muted transition-colors hover:text-accent',
              )}
            >
              {t.name}
            </Link>
          ))}
        </nav>
      )}

      {posts.docs.length === 0 ? (
        <p className="py-10 font-serif text-[17px] text-muted">
          {activeTag || tag
            ? `Nothing in the log under “${activeTag?.name ?? tag}” yet.`
            : 'Nothing logged yet.'}
        </p>
      ) : (
        posts.docs.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.slug}`}
            className="group grid grid-cols-[72px_1fr] gap-5 border-b border-hairline py-6 md:grid-cols-[110px_1fr] md:gap-8 md:py-7"
          >
            <span className="pt-1.5 font-mono text-[11px] leading-[1.9] text-muted md:text-[11.5px]">
              {postNumbers.has(post.id) && (
                <>
                  {formatEntryNo(postNumbers.get(post.id)!)}
                  <br />
                </>
              )}
              {post.publishedAt && formatLogDate(post.publishedAt, 'short')}
            </span>
            <span>
              <h2 className="font-display text-[19px] leading-[1.25] font-semibold tracking-[-0.02em] text-body transition-colors group-hover:text-accent md:text-[22px]">
                {post.title}
              </h2>
              {post.meta?.description && (
                <p className="mt-2 max-w-[62ch] font-serif text-[15px] leading-[1.6] text-muted md:text-[15.5px]">
                  {post.meta.description}
                </p>
              )}
              {post.tags && post.tags.length > 0 && (
                <p className="mt-2.5 flex flex-wrap gap-x-3 font-sans text-[12px] font-medium text-accent">
                  {post.tags.map(
                    (t) =>
                      typeof t === 'object' && (
                        <span key={t.id}>{t.name}</span>
                      ),
                  )}
                </p>
              )}
            </span>
          </Link>
        ))
      )}

      {!tag && posts.totalPages > 1 && (
        <div className="mt-8 flex items-baseline justify-between md:mt-[34px]">
          <span className="font-mono text-[12.5px] text-muted">
            p.{posts.page} / {posts.totalPages}
          </span>
          <span className="flex gap-6">
            {(posts.page ?? 1) > 1 && (
              <Link
                href={(posts.page ?? 1) === 2 ? '/posts' : `/posts/page/${(posts.page ?? 1) - 1}`}
                className="font-sans text-[13px] font-medium text-accent hover:underline"
              >
                ← Newer
              </Link>
            )}
            {(posts.page ?? 1) < posts.totalPages && (
              <Link
                href={`/posts/page/${(posts.page ?? 1) + 1}`}
                className="font-sans text-[13px] font-medium text-accent hover:underline"
              >
                Older →
              </Link>
            )}
          </span>
        </div>
      )}
    </div>
  )
}
