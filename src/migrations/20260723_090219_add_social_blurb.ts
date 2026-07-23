import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" ADD COLUMN "social_blurb" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_social_blurb" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts" DROP COLUMN "social_blurb";
  ALTER TABLE "_posts_v" DROP COLUMN "version_social_blurb";`)
}
