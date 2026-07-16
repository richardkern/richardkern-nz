import type { Payload, PayloadRequest } from 'payload'

/**
 * Seed the durable `technologies` collection from each project's legacy `tech`
 * labels and link them via the `technologies` relationship (issue #61). Shared by
 * the backfill migration (prod/staging, passes the migration `req`) and the dev
 * seed (fresh local data). Find-or-create by name (deduped case-insensitively) so
 * a stack item shared across projects becomes one Technology. Idempotent: skips
 * projects that already have technologies. Returns the number of projects linked.
 */
export const backfillProjectTechnologies = async (
  payload: Payload,
  req?: PayloadRequest,
): Promise<number> => {
  const byName = new Map<string, number>()

  const findOrCreate = async (label: string): Promise<number> => {
    const name = label.trim()
    const key = name.toLowerCase()
    const cached = byName.get(key)
    if (cached) return cached

    const existing = await payload.find({
      collection: 'technologies',
      where: { name: { equals: name } },
      limit: 1,
      pagination: false,
      overrideAccess: true,
      req,
    })
    let id = existing.docs[0]?.id
    if (id == null) {
      // Passing `req` (the migration transaction) to payload.create makes its
      // overload resolution demand a `draft` prop that Technologies — a
      // non-versioned collection — has no business requiring. `next build` fails
      // on it though `tsc --noEmit` does not, so cast the options to the create
      // parameter type; the call is valid at runtime (the seed exercises it).
      const created = await payload.create({
        collection: 'technologies',
        data: { name },
        overrideAccess: true,
        req,
      } as Parameters<typeof payload.create>[0])
      id = created.id
    }
    byName.set(key, id)
    return id
  }

  const { docs } = await payload.find({
    collection: 'projects',
    depth: 0,
    limit: 0,
    pagination: false,
    overrideAccess: true,
    req,
  })

  let linked = 0
  for (const project of docs) {
    if (Array.isArray(project.technologies) && project.technologies.length > 0) continue
    const legacy = project.tech
    if (!Array.isArray(legacy) || legacy.length === 0) continue

    const ids: number[] = []
    for (const t of legacy) {
      if (t?.label && typeof t.label === 'string' && t.label.trim()) ids.push(await findOrCreate(t.label))
    }
    if (ids.length === 0) continue

    await payload.update({
      collection: 'projects',
      id: project.id,
      data: { technologies: Array.from(new Set(ids)) },
      draft: false, // keep the project published (native drafts)
      overrideAccess: true,
      context: { disableRevalidate: true },
      req,
    })
    linked++
    payload.logger.info(`Linked ${ids.length} technologies to project "${project.slug ?? project.id}"`)
  }
  return linked
}
