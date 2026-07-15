/**
 * One-off backfill for the native-drafts migration (issue #60).
 *
 * Enabling `versions.drafts` on Projects made the admin query with `draft: true`,
 * which reads the `_projects_v` versions table. The schema migration renamed
 * `status` -> `_status` on the main table but created no initial version rows, so
 * projects that predate drafts are invisible in the admin (public reads use the
 * main table and are unaffected). This re-saves each project through the Local API,
 * which writes an initial published version, restoring admin visibility.
 *
 * Idempotent: skips any project that already has a version. Run with tsx (like
 * seed-dev.ts); the equivalent runs automatically in prod via a Payload migration.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

const run = async () => {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'projects',
    depth: 0,
    limit: 0,
    pagination: false,
    overrideAccess: true,
  })

  let created = 0
  let skipped = 0
  for (const doc of docs) {
    const existing = await payload.findVersions({
      collection: 'projects',
      where: { parent: { equals: doc.id } },
      limit: 0,
      pagination: false,
      depth: 0,
    })
    if (existing.totalDocs > 0) {
      skipped++
      continue
    }
    await payload.update({
      collection: 'projects',
      id: doc.id,
      data: {},
      draft: false, // keep it published; just materialise the version
      overrideAccess: true,
      context: { disableRevalidate: true },
    })
    created++
    payload.logger.info(`Backfilled version for project "${doc.slug}"`)
  }

  payload.logger.info(`Done. versions created: ${created}, skipped (already had one): ${skipped}`)
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
