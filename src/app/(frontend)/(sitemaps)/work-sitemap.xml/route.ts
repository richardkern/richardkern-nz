import { getServerSideSitemap } from 'next-sitemap'
import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

const getWorkSitemap = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://example.com'

    const results = await payload.find({
      collection: 'projects',
      overrideAccess: false,
      depth: 0,
      limit: 1000,
      pagination: false,
      where: {
        status: {
          equals: 'published',
        },
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    })

    const dateFallback = new Date().toISOString()

    const sitemap = results.docs
      ? results.docs
          .filter((project) => Boolean(project?.slug))
          .map((project) => ({
            loc: `${SITE_URL}/work/${project?.slug}`,
            lastmod: project.updatedAt || dateFallback,
          }))
      : []

    return sitemap
  },
  ['work-sitemap'],
  {
    tags: ['work-sitemap'],
  },
)

export async function GET() {
  const sitemap = await getWorkSitemap()

  return getServerSideSitemap(sitemap)
}
