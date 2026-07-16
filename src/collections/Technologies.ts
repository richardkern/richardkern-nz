import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { authenticated } from '../access/authenticated'
import { validatedSlugField } from '@/fields/validatedSlugField'

/**
 * Durable, reusable technologies for the Projects portfolio (issue #61).
 *
 * Replaces the per-project `tech` array of free-text labels: a technology
 * (Next.js, PostgreSQL, …) is created once and referenced from many projects,
 * so the stack stays consistent and could later drive filtering. Kept distinct
 * from Tags — Tags are content topics on posts, Technologies are the stack on
 * projects.
 */
export const Technologies: CollectionConfig = {
  slug: 'technologies',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    validatedSlugField({ useAsSlug: 'name' }),
  ],
}
