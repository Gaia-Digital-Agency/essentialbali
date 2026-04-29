/**
 * Unit tests for media-naming helper.
 *
 * Run: cd cms && pnpm tsx src/lib/media-naming.test.ts
 *      (no test framework — assertions throw on first failure)
 */

import {
  mediaName,
  parseMediaName,
  isCanonicalMediaName,
  VALID_KINDS,
  VALID_AREAS,
  VALID_TOPICS,
} from "./media-naming";

let pass = 0;
let fail = 0;

function eq(label: string, got: unknown, want: unknown): void {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) {
    pass++;
    console.log(`  ✓ ${label}`);
  } else {
    fail++;
    console.error(`  ✗ ${label}\n     got:  ${JSON.stringify(got)}\n     want: ${JSON.stringify(want)}`);
  }
}

function throws(label: string, fn: () => unknown): void {
  try {
    fn();
    fail++;
    console.error(`  ✗ ${label} — expected throw, got value`);
  } catch {
    pass++;
    console.log(`  ✓ ${label}`);
  }
}

console.log("\n# mediaName — build");
{
  const f = mediaName({
    source: "imager",
    kind: "hero",
    area: "canggu",
    topic: "activities",
    slug: "sunset-surf-spots",
    nano: "abc123",
  });
  eq("imager hero w/ area+topic", f, "imager_hero_canggu_activities_sunset-surf-spots-abc123.webp");
}
{
  const f = mediaName({ source: "imager", kind: "newsletter", slug: "weekly-april-29", nano: "z00000" });
  eq("imager newsletter no area/topic", f, "imager_newsletter_weekly-april-29-z00000.webp");
}
{
  const f = mediaName({ source: "imager", kind: "hero_ads", area: "kuta", topic: "nightlife", slug: "friday-block", nano: "9z2x1m" });
  eq("imager hero_ads (two-token kind)", f, "imager_hero_ads_kuta_nightlife_friday-block-9z2x1m.webp");
}
{
  const f = mediaName({ source: "external", kind: "avatar", slug: "Persona Zara!! Bali", nano: "1f8e0c" });
  eq("external avatar — slug sanitised", f, "external_avatar_persona-zara-bali-1f8e0c.webp");
}
{
  const f = mediaName({ source: "external", kind: "inline", area: "ubud", topic: "health-wellness", slug: "yoga-retreat", nano: "2v6a4d" });
  eq("external inline w/ hyphenated topic", f, "external_inline_ubud_health-wellness_yoga-retreat-2v6a4d.webp");
}

console.log("\n# mediaName — validation");
throws("invalid source", () => mediaName({ source: "bogus" as any, kind: "hero", slug: "x" }));
throws("invalid kind", () => mediaName({ source: "imager", kind: "bogus" as any, slug: "x" }));
throws("invalid area", () => mediaName({ source: "imager", kind: "hero", area: "bogus" as any, slug: "x" }));
throws("invalid topic", () => mediaName({ source: "imager", kind: "hero", topic: "bogus" as any, slug: "x" }));
throws("missing slug", () => mediaName({ source: "imager", kind: "hero", slug: "" }));
throws("slug becomes empty after sanitise", () => mediaName({ source: "imager", kind: "hero", slug: "!!!" }));

console.log("\n# parseMediaName");
{
  const p = parseMediaName("imager_hero_canggu_activities_sunset-surf-spots-abc123.webp");
  eq("hero canggu activities", p, {
    source: "imager",
    kind: "hero",
    area: "canggu",
    topic: "activities",
    slug: "sunset-surf-spots",
    nano: "abc123",
    ext: "webp",
  });
}
{
  const p = parseMediaName("imager_hero_ads_kuta_nightlife_friday-block-9z2x1m.webp");
  eq("hero_ads kuta nightlife", p, {
    source: "imager",
    kind: "hero_ads",
    area: "kuta",
    topic: "nightlife",
    slug: "friday-block",
    nano: "9z2x1m",
    ext: "webp",
  });
}
{
  const p = parseMediaName("external_avatar_persona-zara-bali-1f8e0c.webp");
  eq("avatar no area/topic", p, {
    source: "external",
    kind: "avatar",
    area: null,
    topic: null,
    slug: "persona-zara-bali",
    nano: "1f8e0c",
    ext: "webp",
  });
}
{
  const p = parseMediaName("imager_newsletter_weekly-april-29-z00000.webp");
  eq("newsletter no area/topic", p, {
    source: "imager",
    kind: "newsletter",
    area: null,
    topic: null,
    slug: "weekly-april-29",
    nano: "z00000",
    ext: "webp",
  });
}
{
  // Round-trip — build then parse should match input
  const built = mediaName({
    source: "imager",
    kind: "hero",
    area: "ubud",
    topic: "people-culture",
    slug: "canang-sari-ritual",
    nano: "rt6789",
  });
  const parsed = parseMediaName(built);
  eq("round-trip", parsed, {
    source: "imager",
    kind: "hero",
    area: "ubud",
    topic: "people-culture",
    slug: "canang-sari-ritual",
    nano: "rt6789",
    ext: "webp",
  });
}

console.log("\n# isCanonicalMediaName");
eq("legit", isCanonicalMediaName("imager_hero_canggu_activities_x-ab1234.webp"), true);
eq("legacy png", isCanonicalMediaName("hero-69.png"), false);
eq("missing nano", isCanonicalMediaName("imager_hero_canggu_activities_x.webp"), false);
eq("wrong ext", isCanonicalMediaName("imager_hero_canggu_activities_x-ab1234.jpg"), false);

console.log("\n# Constants — sizes");
eq("VALID_KINDS length", VALID_KINDS.length, 7);
eq("VALID_AREAS length", VALID_AREAS.length, 8);
eq("VALID_TOPICS length", VALID_TOPICS.length, 8);

console.log(`\n${pass} passed · ${fail} failed`);
if (fail > 0) process.exit(1);
