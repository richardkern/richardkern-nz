import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineCodeFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { slugField } from 'payload'

import { authenticated } from '../../access/authenticated'
import { Code } from '../../blocks/Code/config'

export const Projects: CollectionConfig = {
  slug: 'projects',
  access: {
    create: authenticated,
    delete: authenticated,
    read: ({ req }) => {
      if (req.user) return true
      return {
        status: {
          equals: 'published',
        },
      }
    },
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'status', 'year', 'featured', 'updatedAt'],
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'description',
              type: 'text',
              label: 'Short Description',
            },
            {
              name: 'longDescription',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                  BlocksFeature({ blocks: [Code] }),
                  InlineCodeFeature(),
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                  HorizontalRuleFeature(),
                ],
              }),
              label: 'Long Description',
            },
            {
              name: 'tech',
              type: 'array',
              label: 'Technologies',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Media',
          fields: [
            {
              name: 'coverImage',
              type: 'relationship',
              relationTo: 'media' as const,
              label: 'Cover Image',
            },
            {
              name: 'images',
              type: 'array',
              label: 'Gallery Images',
              fields: [
                {
                  name: 'image',
                  type: 'relationship',
                  relationTo: 'media' as const,
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Links',
          fields: [
            {
              name: 'url',
              type: 'text',
              label: 'Live URL',
            },
            {
              name: 'repoUrl',
              type: 'text',
              label: 'Repository URL',
            },
          ],
        },
      ],
    },
    {
      name: 'year',
      type: 'number',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags' as const,
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    slugField(),
  ],
}
