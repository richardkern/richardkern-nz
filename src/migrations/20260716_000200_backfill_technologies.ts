import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * Data migration for issue #61: it seeded the durable `technologies` collection
 * from each project's legacy `tech` labels and linked them.
 *
 * It has already run on every environment that had legacy `tech` data (prod +
 * staging), and the legacy `tech` field was removed in #67 (a later migration
 * drops the `projects_tech` table). Fresh databases now get their technologies
 * from the dev seed, which creates them directly. So this is intentionally a
 * no-op going forward — kept as a record; its original Local-API backfill lived
 * in `backfillProjectTechnologies`, removed with the legacy field.
 */
export async function up(_args: MigrateUpArgs): Promise<void> {
  // no-op — see the note above
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // no-op
}
