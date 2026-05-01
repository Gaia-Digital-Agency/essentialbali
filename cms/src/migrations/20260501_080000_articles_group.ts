import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Phase 0 v4 — explicit `group` field on articles for homepage placement.
 *
 * Until this migration the homepage was rendered by category-driven queries
 * (heroImage = people-culture, mostPopular = featured, etc.). That model
 * forced every cell of the 8x8 area-category grid to be tagged exactly to
 * stitch the homepage together — bad scaling for 1,280 articles.
 *
 * New model: a 5-value nullable enum on articles, set on exactly 20 rows
 * at any time (4 per group). Homepage queries each group; every other
 * article has group = NULL and lives only on its area-page and category-
 * page surfaces.
 *
 * Groups (intentionally orthogonal to area + category):
 *   - mostPopular     editorial pick / "this is the headline"
 *   - trending        timely, what is happening now
 *   - ultimateGuide   evergreen long-form, depth
 *   - overseas        outside-Bali / regional spotlight
 *   - spotlight       single-feature standout, rotates
 *
 * Index on group is for the homepage queries (5 small WHERE-equals lookups
 * with LIMIT 4 each).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_articles_group" AS ENUM(
      'mostPopular', 'trending', 'ultimateGuide', 'overseas', 'spotlight'
    );
    ALTER TABLE "articles" ADD COLUMN "group" "enum_articles_group";
    CREATE INDEX "articles_group_idx" ON "articles" USING btree ("group");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX "articles_group_idx";
    ALTER TABLE "articles" DROP COLUMN "group";
    DROP TYPE "public"."enum_articles_group";
  `)
}
