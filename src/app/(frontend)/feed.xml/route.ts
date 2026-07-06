import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { getServerSideURL } from '@/utilities/getURL'

export const revalidate = 600

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export async function GET() {
  const payload = await getPayload({ config: configPromise })
  const siteUrl = getServerSideURL()

  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    overrideAccess: false,
    limit: 50,
    depth: 0,
    sort: '-publishedAt',
    select: {
      title: true,
      slug: true,
      publishedAt: true,
      meta: { description: true },
    },
  })

  const items = posts.docs
    .map((post) => {
      const url = `${siteUrl}/posts/${post.slug}`
      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        post.publishedAt
          ? `      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>`
          : null,
        post.meta?.description
          ? `      <description>${escapeXml(post.meta.description)}</description>`
          : null,
        '    </item>',
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>richardkern.nz</title>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Working notes on homelab, AI agents, web development, and running.</description>
    <language>en-NZ</language>
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
