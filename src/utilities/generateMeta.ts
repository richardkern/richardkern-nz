import type { Metadata } from 'next'

import type { Media, Page, Post, Project, Config } from '../payload-types'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  if (image && typeof image === 'object' && 'url' in image) {
    // Media URLs are already absolute here (serverURL is set in the Payload
    // config), so only prepend the origin when the url is relative — otherwise
    // it doubles into https://hosthttps://host/api/media/...
    const raw = image.sizes?.og?.url || image.url
    if (!raw) return undefined
    return raw.startsWith('http') ? raw : `${getServerSideURL()}${raw}`
  }
  return undefined
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | Partial<Project> | null
  collection?: 'posts' | 'projects' | 'pages'
}): Promise<Metadata> => {
  const { doc, collection } = args

  const uploadedImage = getImageURL(doc?.meta?.image)

  const slug = typeof doc?.slug === 'string' ? doc.slug : ''
  const path =
    collection === 'posts'
      ? `/posts/${slug}`
      : collection === 'projects'
        ? `/work/${slug}`
        : `/${slug}`

  // Posts and projects without an uploaded social image get a generated OG card
  // (issue #47, /og/<type>/<slug>). An uploaded meta.image still wins; pages fall
  // back to the generic og-default.png via mergeOpenGraph.
  const ogType = collection === 'posts' ? 'post' : collection === 'projects' ? 'work' : null
  const generatedImage =
    !uploadedImage && ogType && slug ? `${getServerSideURL()}/og/${ogType}/${slug}` : undefined
  const ogImage = uploadedImage || generatedImage

  const title = doc?.meta?.title
    ? `${doc.meta.title} · Richard Kern`
    : 'Richard Kern · Projects, notes and writing'

  // Posts are articles, not generic pages: the article og:type (plus
  // published_time) is the correct signal for shares and crawlers.
  const isPost = collection === 'posts'
  const publishedTime =
    isPost && doc && 'publishedAt' in doc && typeof doc.publishedAt === 'string'
      ? doc.publishedAt
      : undefined

  return {
    description: doc?.meta?.description,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
            },
          ]
        : undefined,
      title,
      url: `${getServerSideURL()}${path}`,
      ...(isPost ? { type: 'article' as const, publishedTime } : {}),
    }),
    // absolute: the suffix is already applied here; the layout template must not add it again
    title: { absolute: title },
  }
}
