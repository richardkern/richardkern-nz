import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath } from 'next/cache'

import type { Project } from '../../../payload-types'

export const revalidateProject: CollectionAfterChangeHook<Project> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc.status === 'published') {
      const path = `/work/${doc.slug}`

      payload.logger.info(`Revalidating project at path: ${path}`)

      revalidatePath(path)
    }

    // If the project was previously published under a different state or slug,
    // the old path needs revalidating too
    if (
      previousDoc?.status === 'published' &&
      (doc.status !== 'published' || previousDoc.slug !== doc.slug)
    ) {
      const oldPath = `/work/${previousDoc.slug}`

      payload.logger.info(`Revalidating old project at path: ${oldPath}`)

      revalidatePath(oldPath)
    }

    // The work index and the homepage both list projects
    if (doc.status === 'published' || previousDoc?.status === 'published') {
      revalidatePath('/work')
      revalidatePath('/')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Project> = ({
  doc,
  req: { context },
}) => {
  if (!context.disableRevalidate) {
    revalidatePath(`/work/${doc?.slug}`)
    revalidatePath('/work')
    revalidatePath('/')
  }

  return doc
}
