import type { Media, Post, Project, SiteSetting } from '../payload-types'

import { getServerSideURL } from './getURL'

// Structured data (schema.org JSON-LD). Each builder returns a single document
// with an `@graph`, so the Person and WebSite entities are defined once per page
// and referenced by `@id` — keeping every reference resolvable within the page
// (Google does not reliably resolve `@id`s across separate URLs).

const AUTHOR_NAME = 'Richard Kern'

type Site = Partial<SiteSetting> | null | undefined

/**
 * Absolute URL for a doc image, preferring the SEO `og` size. Media URLs are
 * already absolute here (serverURL is set in the Payload config), so only
 * prepend the origin for a relative url — mirrors generateMeta's getImageURL.
 */
function imageURL(image?: (number | null) | Media): string | undefined {
  if (image && typeof image === 'object' && 'url' in image) {
    const raw = image.sizes?.og?.url || image.url
    if (!raw) return undefined
    return raw.startsWith('http') ? raw : `${getServerSideURL()}${raw}`
  }
  return undefined
}

function socialUrls(site: Site): string[] {
  return (site?.socialLinks ?? []).map((l) => l.url).filter(Boolean)
}

/** Richard as an entity, referenced by `@id` from author/publisher. */
function personNode(base: string, site: Site) {
  const sameAs = socialUrls(site)
  return {
    '@type': 'Person',
    '@id': `${base}/#person`,
    name: AUTHOR_NAME,
    url: `${base}/`,
    ...(site?.bio ? { description: site.bio } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  }
}

function websiteNode(base: string, site: Site) {
  return {
    '@type': 'WebSite',
    '@id': `${base}/#website`,
    url: `${base}/`,
    name: AUTHOR_NAME,
    ...(site?.bio ? { description: site.bio } : {}),
    publisher: { '@id': `${base}/#person` },
    inLanguage: 'en',
  }
}

export function homeJsonLd(site: Site) {
  const base = getServerSideURL()
  return {
    '@context': 'https://schema.org',
    '@graph': [personNode(base, site), websiteNode(base, site)],
  }
}

export function postJsonLd(post: Post, site: Site) {
  const base = getServerSideURL()
  const url = `${base}/posts/${post.slug}`
  const image = imageURL(post.meta?.image ?? post.coverImage)
  const keywords = (post.tags ?? [])
    .filter((t): t is Tag => typeof t === 'object' && t !== null)
    .map((t) => t.name)
    .filter(Boolean)

  return {
    '@context': 'https://schema.org',
    '@graph': [
      personNode(base, site),
      websiteNode(base, site),
      {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        headline: post.title,
        ...(post.meta?.description ? { description: post.meta.description } : {}),
        ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
        dateModified: post.updatedAt || post.publishedAt || undefined,
        url,
        mainEntityOfPage: url,
        author: { '@id': `${base}/#person` },
        publisher: { '@id': `${base}/#person` },
        isPartOf: { '@id': `${base}/#website` },
        ...(image ? { image } : {}),
        ...(keywords.length ? { keywords } : {}),
      },
    ],
  }
}

export function projectJsonLd(project: Project, site: Site) {
  const base = getServerSideURL()
  const url = `${base}/work/${project.slug}`
  const image = imageURL(project.meta?.image ?? project.coverImage)
  const keywords = (project.tech ?? []).map((t) => t.label).filter(Boolean)
  const sameAs = [project.url, project.repoUrl].filter((u): u is string => Boolean(u))

  return {
    '@context': 'https://schema.org',
    '@graph': [
      personNode(base, site),
      websiteNode(base, site),
      {
        '@type': 'CreativeWork',
        '@id': `${url}#project`,
        name: project.title,
        ...(project.description ? { description: project.description } : {}),
        url,
        author: { '@id': `${base}/#person` },
        isPartOf: { '@id': `${base}/#website` },
        ...(image ? { image } : {}),
        ...(project.year ? { dateCreated: String(project.year) } : {}),
        ...(keywords.length ? { keywords } : {}),
        ...(sameAs.length ? { sameAs } : {}),
      },
    ],
  }
}

// Local alias so the tags filter reads clearly without importing the whole
// Tag interface name into the module's public surface.
type Tag = Extract<NonNullable<Post['tags']>[number], { name: string }>
