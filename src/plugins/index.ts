import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'

// R2 storage switches on when all four vars are present (staging/production);
// dev leaves them unset and stays on local disk. No `prefix` option here:
// prefix would add a column to media, and the schema must stay identical
// whether the plugin is enabled or not, or migrations diverge from dev.
const r2Configured = Boolean(
  process.env.R2_BUCKET &&
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY,
)

// Bare title only: generateMeta appends the "· Richard Kern" suffix at render
// time, so a suffix baked into meta.title here would render doubled
const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ?? ''
}

const generateURL: GenerateURL<Post | Page> = ({ doc, collectionSlug }) => {
  const url = getServerSideURL()
  if (!doc?.slug) return url
  const prefix = collectionSlug === 'posts' ? '/posts' : collectionSlug === 'projects' ? '/work' : ''
  return `${url}${prefix}/${doc.slug}`
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description:
                  'The path to redirect from, e.g. /old-post. Changes take effect immediately on save — the revalidateRedirects hook refreshes the cache, no rebuild needed.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  s3Storage({
    enabled: r2Configured,
    collections: {
      media: true,
    },
    bucket: process.env.R2_BUCKET || '',
    config: {
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      region: 'auto',
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
      forcePathStyle: true,
    },
  }),
]
