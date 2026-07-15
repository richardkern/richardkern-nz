import configPromise from '@payload-config'
import fs from 'fs'
import { ImageResponse } from 'next/og'
import path from 'path'
import { getPayload } from 'payload'

import { formatEntryNo, formatLogDate, getPostNumbers } from '@/utilities/logbook'

/**
 * Generated Open Graph card (issue #47) — the "charcoal cover" of an entry.
 *
 * Renders a 1200×630 share image per post/project in the site's own language:
 * the mono logbook line (Entry N° · date · tag for posts; year · tech for
 * projects), the Schibsted Grotesk title, and the wordmark, on the bush-charcoal
 * cover surface. Referenced from generateMeta only when the editor hasn't uploaded
 * their own social image. `/og/post/<slug>` and `/og/work/<slug>`.
 *
 * Fonts are read from public/fonts once at module load — the Docker runner copies
 * `public/` (this is not a standalone build), so the files are present at runtime.
 */
const fontDir = path.join(process.cwd(), 'public', 'fonts')
const schibstedBold = fs.readFileSync(path.join(fontDir, 'SchibstedGrotesk-Bold.ttf'))
const geistMedium = fs.readFileSync(path.join(fontDir, 'GeistMono-Medium.ttf'))

const SEP = ' · ' // em-space · em-space

export async function GET(_req: Request, { params }: { params: Promise<{ type: string; slug: string }> }) {
  const { type, slug } = await params
  const collection = type === 'post' ? 'posts' : type === 'work' ? 'projects' : null
  if (!collection) return new Response('Not found', { status: 404 })

  const payload = await getPayload({ config: configPromise })
  const res = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    depth: 1,
    limit: 1,
    pagination: false,
    overrideAccess: false, // published only — drafts are never shared
  })
  const doc = res.docs?.[0]
  if (!doc) return new Response('Not found', { status: 404 })

  const title = (doc.title ?? '').slice(0, 120)

  let logbook = ''
  if (collection === 'posts' && 'publishedAt' in doc) {
    const parts: string[] = []
    const n = (await getPostNumbers()).get(doc.id)
    if (n) parts.push(formatEntryNo(n))
    if (typeof doc.publishedAt === 'string') parts.push(formatLogDate(doc.publishedAt, 'long'))
    const tag = Array.isArray(doc.tags) ? doc.tags.find((t) => t && typeof t === 'object') : undefined
    if (tag && typeof tag === 'object' && 'name' in tag && tag.name) parts.push(String(tag.name))
    logbook = parts.join(SEP)
  } else if (collection === 'projects' && 'year' in doc) {
    const parts: string[] = []
    if (doc.year) parts.push(String(doc.year))
    if (Array.isArray(doc.tech)) {
      for (const t of doc.tech.slice(0, 3)) if (t?.label) parts.push(t.label)
    }
    logbook = parts.join(SEP)
  }

  // Scale the title down as it gets longer so it always fits ~3 lines.
  const titleSize = title.length > 74 ? 50 : title.length > 46 ? 58 : 66

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#171b16',
          padding: '72px 80px',
          position: 'relative',
          fontFamily: 'Geist Mono',
        }}
      >
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 64, width: 1, background: 'rgba(247,245,239,0.16)' }} />
        <div style={{ fontFamily: 'Geist Mono', fontWeight: 500, fontSize: 23, color: '#8fb8a5', letterSpacing: '0.04em' }}>
          {logbook}
        </div>
        <div
          style={{
            fontFamily: 'Schibsted Grotesk',
            fontWeight: 700,
            fontSize: titleSize,
            lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: '#f7f5ef',
            maxWidth: 960,
          }}
        >
          {title}
        </div>
        <div style={{ display: 'flex', fontFamily: 'Geist Mono', fontWeight: 500, fontSize: 27, color: '#f7f5ef' }}>
          richardkern<span style={{ color: '#8fb8a5' }}>.nz</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Schibsted Grotesk', data: schibstedBold, weight: 700, style: 'normal' },
        { name: 'Geist Mono', data: geistMedium, weight: 500, style: 'normal' },
      ],
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  )
}
