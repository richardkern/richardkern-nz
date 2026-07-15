import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * Data migration for issue #60 (regression from 20260715_205027_align_projects_native_drafts).
 *
 * Enabling `versions.drafts` on Projects made the admin query with `draft: true`,
 * which reads the `_projects_v` versions table. The schema migration renamed
 * `status` -> `_status` on the main `projects` table but created no version rows, so
 * projects that predate drafts return nothing under `draft: true` and vanish from the
 * admin (public reads use the main table and are unaffected). Re-saving each versionless
 * project through the Local API materialises an initial published version, restoring
 * admin visibility. Idempotent: skips any project that already has a version.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const { docs } = await payload.find({
    collection: 'projects',
    depth: 0,
    limit: 0,
    pagination: false,
    overrideAccess: true,
    req,
  })

  for (const doc of docs) {
    const existing = await payload.findVersions({
      collection: 'projects',
      where: { parent: { equals: doc.id } },
      limit: 0,
      pagination: false,
      depth: 0,
      req,
    })
    if (existing.totalDocs > 0) continue

    await payload.update({
      collection: 'projects',
      id: doc.id,
      data: {}, // no field changes — just materialise the published version
      draft: false, // keep _status = published
      overrideAccess: true,
      context: { disableRevalidate: true }, // revalidate hooks throw outside a Next request
      req,
    })
    payload.logger.info(`Backfilled initial version for project "${doc.slug ?? doc.id}"`)
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // No-op: deleting the backfilled versions would re-hide the projects in the admin.
}
