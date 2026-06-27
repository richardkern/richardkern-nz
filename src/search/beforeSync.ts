import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'

export const beforeSyncWithSearch: BeforeSync = async ({ req, originalDoc, searchDoc }) => {
  const {
    doc: { relationTo: collection },
  } = searchDoc

  const { slug, id, tags, title, meta } = originalDoc

  const modifiedDoc: DocToSync = {
    ...searchDoc,
    slug,
    meta: {
      ...meta,
      title: meta?.title || title,
      image: meta?.image?.id || meta?.image,
      description: meta?.description,
    },
    tags: [],
  }

  if (tags && Array.isArray(tags) && tags.length > 0) {
    const populatedTags: { id: string | number; name: string }[] = []
    for (const tag of tags) {
      if (!tag) {
        continue
      }

      if (typeof tag === 'object') {
        populatedTags.push(tag)
        continue
      }

      const doc = await req.payload.findByID({
        collection: 'tags',
        id: tag,
        disableErrors: true,
        depth: 0,
        select: { name: true },
        req,
      })

      if (doc !== null) {
        populatedTags.push(doc)
      } else {
        console.error(
          `Failed. Tag not found when syncing collection '${collection}' with id: '${id}' to search.`,
        )
      }
    }

    modifiedDoc.tags = populatedTags.map((each) => ({
      relationTo: 'tags',
      tagID: String(each.id),
      name: each.name,
    }))
  }

  return modifiedDoc
}
