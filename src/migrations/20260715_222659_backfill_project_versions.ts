import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Data migration for issue #60 (regression from 20260715_205027_align_projects_native_drafts).
 *
 * Enabling `versions.drafts` on Projects made the admin query with `draft: true`,
 * which reads the `_projects_v` versions table. The schema migration renamed
 * `status` -> `_status` on the main `projects` table but created no version rows, so
 * projects that predate drafts return nothing under `draft: true` and vanish from the
 * admin (public reads use the main table and are unaffected). Re-saving each versionless
 * project through the Local API materialises an initial published version.
 *
 * The versionless projects are found via raw SQL, NOT payload.find: a Local-API query
 * builds its SQL from the *current* config, so once a later migration adds a projects
 * relationship column (e.g. `technologies` in 20260716_000108) the find would reference
 * a column that doesn't exist yet at this migration's point and a fresh `pnpm migrate`
 * (CI / the deploy build) would fail. Raw SQL only touches tables that exist here. On a
 * fresh database there are no projects, so the loop is a no-op; this only ever did work
 * on the one production database that predated drafts.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  const result = await db.execute<{ id: number }>(sql`
    SELECT p."id"
    FROM "projects" p
    LEFT JOIN "_projects_v" v ON v."parent_id" = p."id"
    WHERE v."id" IS NULL
  `)

  for (const { id } of result.rows) {
    await payload.update({
      collection: 'projects',
      id,
      data: {}, // no field changes — just materialise the published version
      draft: false, // keep _status = published
      overrideAccess: true,
      context: { disableRevalidate: true }, // revalidate hooks throw outside a Next request
      req,
    })
    payload.logger.info(`Backfilled initial version for project ${id}`)
  }
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // No-op: deleting the backfilled versions would re-hide the projects in the admin.
}
