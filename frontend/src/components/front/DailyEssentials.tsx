import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api";
import Image from "./Image";
import { DAILY_ESSENTIALS_SIZE } from "../../lib/constants";

/**
 * Homepage 4×4 grid — 16 articles, 2 per topic, refreshed daily by
 * the cms picker cron (cms/scripts/pick-daily-feed.mjs at 04:00 GMT+8).
 *
 * Reads `home-daily-feed` filtered to today's row, expands each slot
 * to its article + topic + area + hero image, and renders tiles.
 *
 * Sparse-pool behaviour:
 *   • 16 → 4×4 (lg:grid-cols-4)
 *   • 12 → 4×3
 *   • 8  → 4×2
 *   • 4  → 2×2 (centred)
 *   • 0  → "No daily picks yet" panel (centred)
 *
 * Tile shape: square cover image · topic chip · serif title · 2-line
 * excerpt · area chip. Whole tile is a Link to the article.
 */

type Slot = {
  slotIndex: number;
  topic?: { id: number; slug: string; name: string } | null;
  article?: ArticleExpanded | null;
};

type ArticleExpanded = {
  id: number;
  title: string;
  slug: string;
  subTitle?: string | null;
  area?: { id: number; slug: string; name: string } | null;
  topic?: { id: number; slug: string; name: string } | null;
  hero?: {
    url?: string | null;
    alt?: string | null;
    sizes?: { card?: { url?: string | null }; thumbnail?: { url?: string | null } };
  } | null;
  publishedAt?: string | null;
};

type FeedDoc = {
  id: number;
  date: string;
  slots?: Slot[];
};

function articleHref(a: ArticleExpanded): string {
  const area = a.area?.slug ?? "bali";
  const topic = a.topic?.slug ?? "featured";
  return `/${area}/${topic}/${a.slug}`;
}

function articleImage(a: ArticleExpanded): string | null {
  return (
    a.hero?.sizes?.card?.url ||
    a.hero?.sizes?.thumbnail?.url ||
    a.hero?.url ||
    null
  );
}

function pickColsClass(n: number): string {
  if (n >= 16) return "lg:grid-cols-4 md:grid-cols-3";
  if (n >= 12) return "lg:grid-cols-4 md:grid-cols-3";
  if (n >= 8) return "lg:grid-cols-4 md:grid-cols-3";
  if (n >= 4) return "lg:grid-cols-2 md:grid-cols-2";
  if (n >= 2) return "lg:grid-cols-2 md:grid-cols-2";
  return "lg:grid-cols-1 md:grid-cols-1";
}

const DailyEssentials: React.FC = () => {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Fetch today's row. The picker writes one row per Bali date;
        // the most recent entry IS today (or, in the picker-failure
        // case, the most recent successful day). depth=2 expands
        // article + area + topic + hero in one round trip.
        const res = await apiClient.get(
          "home-daily-feed?limit=1&sort=-date&depth=2",
        );
        const doc: FeedDoc | undefined = res?.data?.docs?.[0];
        if (!cancelled) setSlots(doc?.slots ?? []);
      } catch {
        if (!cancelled) setSlots([]);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded) {
    // Skeleton card stack — pre-reserves the same vertical footprint the
    // populated grid will occupy. aspect-video (16:9) matches the hero
    // image aspect; the 3 stacked grey lines reserve title + subtitle +
    // area-pin block below. Count = 12 matches the picker's typical
    // output today (sparse pool: events topic empty, single-article
    // topics). CLS-critical: any aspect or count mismatch here causes
    // a layout jump on hydration.
    return (
      <section className="container py-12">
        <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-1 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="aspect-video bg-front-icewhite animate-pulse rounded" />
              <div className="h-3 w-1/3 bg-front-icewhite animate-pulse rounded" />
              <div className="h-5 w-5/6 bg-front-icewhite animate-pulse rounded" />
              <div className="h-3 w-3/4 bg-front-icewhite animate-pulse rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const populated = (slots ?? []).filter((s) => s.article);

  // Empty state — centred panel rather than a broken grid.
  if (populated.length === 0) {
    return (
      <section className="container py-16">
        <div className="text-center">
          <p className="font-serif text-2xl text-front-navy mb-2">
            Today's Essentials
          </p>
          <p className="font-sans text-base text-front-soft-gray">
            No daily picks yet — check back once articles land.
          </p>
        </div>
      </section>
    );
  }

  const colsClass = pickColsClass(Math.min(populated.length, DAILY_ESSENTIALS_SIZE));

  return (
    <section className="container py-12">
      <div className="text-center mb-10">
        <p className="font-serif text-3xl md:text-front-section-title text-front-navy">
          Today's Essentials
        </p>
        <div className="mt-2 mx-auto h-px w-24 bg-front-navy/30" />
      </div>

      <div
        className={`grid grid-cols-1 ${colsClass} gap-6 mx-auto`}
        style={populated.length < 8 ? { maxWidth: "900px" } : undefined}
      >
        {populated.map((slot) => {
          const a = slot.article!;
          return (
            <Link
              key={`${slot.slotIndex}-${a.id}`}
              to={articleHref(a)}
              className="group block"
            >
              <div className="mb-4 image-wrapper">
                <Image
                  url={articleImage(a) || undefined}
                  ratio="56.25%"
                  alt={a.hero?.alt || a.title}
                />
              </div>
              {slot.topic?.name && (
                <div className="mb-2 text-xs uppercase tracking-wider text-front-red">
                  {slot.topic.name}
                </div>
              )}
              <p className="mb-2 font-serif text-front-subtitle text-front-navy transition-all duration-300 group-hover:[text-shadow:0_0_0.3px_currentColor]">
                {a.title}
              </p>
              {a.subTitle && (
                <p className="mb-3 text-front-small leading-normal text-front-soft-gray line-clamp-2">
                  {a.subTitle}
                </p>
              )}
              {a.area?.name && (
                <div className="text-xs text-front-soft-gray flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="11"
                    height="13"
                    viewBox="0 0 11 13"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M5.5 0.5C2.7 0.5 0.5 2.7 0.5 5.5c0 3.7 5 7 5 7s5-3.3 5-7c0-2.8-2.2-5-5-5zm0 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"
                      fill="currentColor"
                    />
                  </svg>
                  {a.area.name}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default DailyEssentials;
