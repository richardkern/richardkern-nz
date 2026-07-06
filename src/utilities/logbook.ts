import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cache } from 'react'

const pad2 = (n: number) => String(n).padStart(2, '0')

/** `N°07` — the logbook entry number */
export const formatEntryNo = (n: number): string => `N°${pad2(n)}`

/**
 * Dates in the logbook layer. `day` = 28.06 (home rails), `short` = 28.06.26
 * (index rails), `long` = 28.06.2026 (post meta line).
 */
export const formatLogDate = (
  timestamp: string,
  style: 'day' | 'short' | 'long' = 'long',
): string => {
  const date = new Date(timestamp)
  const dd = pad2(date.getDate())
  const mm = pad2(date.getMonth() + 1)
  const yyyy = date.getFullYear()
  if (style === 'day') return `${dd}.${mm}`
  if (style === 'short') return `${dd}.${mm}.${String(yyyy).slice(-2)}`
  return `${dd}.${mm}.${yyyy}`
}

/**
 * Entry N° is real: the post's chronological position among published posts
 * (first post = 1). A display device — it may shift if a post is unpublished.
 * Cached per request.
 */
export const getPostNumbers = cache(async (): Promise<Map<number, number>> => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'posts',
    draft: false,
    overrideAccess: false,
    pagination: false,
    limit: 1000,
    sort: 'publishedAt',
    select: { slug: true },
  })
  return new Map(result.docs.map((doc, i) => [doc.id, i + 1]))
})
