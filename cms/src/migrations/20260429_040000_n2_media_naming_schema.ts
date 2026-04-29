import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * N2 — Media collection schema for canonical naming convention.
 *
 * Renames generated_by → source (with reduced enum: imager | external).
 * Adds: kind, area, topic, linked_article_id, linked_hero_ad_id.
 *
 * Safe because the media table is empty post-N5 wipe. If you re-run this
 * on a populated table, the DROP COLUMN generated_by would lose data.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    -- 1. New enum types
    CREATE TYPE "public"."enum_media_source" AS ENUM('imager', 'external');
    CREATE TYPE "public"."enum_media_kind" AS ENUM('hero', 'hero_ads', 'inline', 'newsletter', 'avatar', 'banner', 'other');
    CREATE TYPE "public"."enum_media_area" AS ENUM('canggu', 'kuta', 'ubud', 'jimbaran', 'denpasar', 'kintamani', 'singaraja', 'nusa-penida');
    CREATE TYPE "public"."enum_media_topic" AS ENUM('events', 'news', 'featured', 'dine', 'health-wellness', 'nightlife', 'activities', 'people-culture');

    -- 2. Drop old enum-backed column. Safe: media is empty post-N5.
    ALTER TABLE "media" DROP COLUMN "generated_by";
    DROP TYPE "public"."enum_media_generated_by";

    -- 3. Add new metadata columns
    ALTER TABLE "media" ADD COLUMN "source" "enum_media_source" NOT NULL DEFAULT 'external';
    ALTER TABLE "media" ADD COLUMN "kind" "enum_media_kind" NOT NULL DEFAULT 'other';
    ALTER TABLE "media" ADD COLUMN "area" "enum_media_area";
    ALTER TABLE "media" ADD COLUMN "topic" "enum_media_topic";
    ALTER TABLE "media" ADD COLUMN "linked_article_id" integer;
    ALTER TABLE "media" ADD COLUMN "linked_hero_ad_id" integer;

    -- 4. Relationship indexes + FKs
    CREATE INDEX "media_linked_article_idx" ON "media" USING btree ("linked_article_id");
    CREATE INDEX "media_linked_hero_ad_idx" ON "media" USING btree ("linked_hero_ad_id");
    ALTER TABLE "media" ADD CONSTRAINT "media_linked_article_id_articles_id_fk"
      FOREIGN KEY ("linked_article_id") REFERENCES "public"."articles"("id")
      ON DELETE set null ON UPDATE no action;
    ALTER TABLE "media" ADD CONSTRAINT "media_linked_hero_ad_id_hero_ads_id_fk"
      FOREIGN KEY ("linked_hero_ad_id") REFERENCES "public"."hero_ads"("id")
      ON DELETE set null ON UPDATE no action;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    -- Reverse FKs + indexes
    ALTER TABLE "media" DROP CONSTRAINT "media_linked_hero_ad_id_hero_ads_id_fk";
    ALTER TABLE "media" DROP CONSTRAINT "media_linked_article_id_articles_id_fk";
    DROP INDEX "media_linked_hero_ad_idx";
    DROP INDEX "media_linked_article_idx";

    -- Drop new columns
    ALTER TABLE "media" DROP COLUMN "linked_hero_ad_id";
    ALTER TABLE "media" DROP COLUMN "linked_article_id";
    ALTER TABLE "media" DROP COLUMN "topic";
    ALTER TABLE "media" DROP COLUMN "area";
    ALTER TABLE "media" DROP COLUMN "kind";
    ALTER TABLE "media" DROP COLUMN "source";

    -- Drop new enums
    DROP TYPE "public"."enum_media_topic";
    DROP TYPE "public"."enum_media_area";
    DROP TYPE "public"."enum_media_kind";
    DROP TYPE "public"."enum_media_source";

    -- Restore old enum + column
    CREATE TYPE "public"."enum_media_generated_by" AS ENUM('upload', 'imager', 'imported');
    ALTER TABLE "media" ADD COLUMN "generated_by" "enum_media_generated_by" DEFAULT 'upload';
  `)
}
