import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" ADD COLUMN "meta_title" varchar;
  ALTER TABLE "projects" ADD COLUMN "meta_image_id" integer;
  ALTER TABLE "projects" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "projects_meta_meta_image_idx" ON "projects" USING btree ("meta_image_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects" DROP CONSTRAINT "projects_meta_image_id_media_id_fk";
  
  DROP INDEX "projects_meta_meta_image_idx";
  ALTER TABLE "projects" DROP COLUMN "meta_title";
  ALTER TABLE "projects" DROP COLUMN "meta_image_id";
  ALTER TABLE "projects" DROP COLUMN "meta_description";`)
}
