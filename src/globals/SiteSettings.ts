import type { GlobalAfterChangeHook, GlobalConfig } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import { authenticated } from '../access/authenticated'

// Inner pages read SiteSettings through getCachedGlobal (tagged); the homepage
// queries it directly, so its path needs revalidating as well
const revalidateSiteSettings: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating site settings')

    revalidateTag('global_site-settings', 'max')
    revalidatePath('/')
  }

  return doc
}

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: authenticated,
  },
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
  fields: [
    {
      name: 'siteTitle',
      type: 'text',
      required: true,
    },
    {
      name: 'bio',
      type: 'textarea',
    },
    {
      name: 'byline',
      type: 'text',
      admin: {
        description:
          'One italic line under each post, e.g. "Richard Kern writes about homelab, agents, and running." Falls back to the bio if empty.',
      },
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'platform',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'navConfig',
      type: 'json',
    },
  ],
}
