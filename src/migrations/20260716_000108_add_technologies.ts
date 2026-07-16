import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "technologies" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"generate_slug" boolean DEFAULT true,
  	"slug" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "projects_rels" ADD COLUMN "technologies_id" integer;
  ALTER TABLE "_projects_v_rels" ADD COLUMN "technologies_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "technologies_id" integer;
  CREATE UNIQUE INDEX "technologies_slug_idx" ON "technologies" USING btree ("slug");
  CREATE INDEX "technologies_updated_at_idx" ON "technologies" USING btree ("updated_at");
  CREATE INDEX "technologies_created_at_idx" ON "technologies" USING btree ("created_at");
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_technologies_fk" FOREIGN KEY ("technologies_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_technologies_fk" FOREIGN KEY ("technologies_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_technologies_fk" FOREIGN KEY ("technologies_id") REFERENCES "public"."technologies"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_rels_technologies_id_idx" ON "projects_rels" USING btree ("technologies_id");
  CREATE INDEX "_projects_v_rels_technologies_id_idx" ON "_projects_v_rels" USING btree ("technologies_id");
  CREATE INDEX "payload_locked_documents_rels_technologies_id_idx" ON "payload_locked_documents_rels" USING btree ("technologies_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "technologies" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "technologies" CASCADE;
  ALTER TABLE "projects_rels" DROP CONSTRAINT "projects_rels_technologies_fk";
  
  ALTER TABLE "_projects_v_rels" DROP CONSTRAINT "_projects_v_rels_technologies_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_technologies_fk";
  
  DROP INDEX "projects_rels_technologies_id_idx";
  DROP INDEX "_projects_v_rels_technologies_id_idx";
  DROP INDEX "payload_locked_documents_rels_technologies_id_idx";
  ALTER TABLE "projects_rels" DROP COLUMN "technologies_id";
  ALTER TABLE "_projects_v_rels" DROP COLUMN "technologies_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "technologies_id";`)
}
