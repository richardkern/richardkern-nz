import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

import { backfillProjectTechnologies } from '../utilities/backfillProjectTechnologies'

/**
 * Data migration for issue #61: seed the durable `technologies` collection from
 * each project's legacy `tech` labels and link them via the new `technologies`
 * relationship. Idempotent; shares its logic with the dev seed. The legacy `tech`
 * array is left in place and removed in a follow-up once this is verified.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await backfillProjectTechnologies(payload, req)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // No-op: leaves seeded technologies and links in place; the legacy `tech`
  // array is untouched, so the schema migration's own down() still has the source.
}
