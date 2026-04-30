import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../api";

/**
 * One full-width hero image, sourced from the `hero-ads` collection.
 *
 * Slot resolution:
 *   • <HeroBanner />                       → (NULL area, NULL topic)  — homepage default
 *   • <HeroBanner area="canggu" topic="dine"> → (canggu, dine)         — cell-specific
 *   • <HeroBanner area="canggu">            → (canggu, NULL)          — area-only (currently unused)
 *   • <HeroBanner topic="dine">             → (NULL, dine)            — topic-only (currently unused)
 *
 * Falls back to the homepage default if the requested cell has no
 * active hero. Renders nothing if even the homepage default is
 * inactive — keeps the page from showing a broken slot.
 *
 * Props read from the hero_ads doc:
 *   • creative.url      — the image
 *   • headline / subline — overlay copy (optional)
 *   • client            — shown as a subtle "Sponsored by" line when set
 *   • linkUrl           — image-click destination (optional)
 *   • ctaActive + ctaText + ctaUrl — optional CTA button
 */

type HeroAdSize = { url?: string | null; width?: number | null };
type HeroAdMedia = {
  url?: string | null;
  alt?: string | null;
  sizes?: { hero?: HeroAdSize; card?: HeroAdSize; thumbnail?: HeroAdSize };
};
type HeroAdRel = { id: number; slug: string };
type HeroAdDoc = {
  id: number;
  area?: HeroAdRel | null;
  topic?: HeroAdRel | null;
  active?: boolean;
  creative?: HeroAdMedia | null;
  linkUrl?: string | null;
  client?: string | null;
  headline?: string | null;
  subline?: string | null;
  ctaActive?: boolean;
  ctaText?: string | null;
  ctaUrl?: string | null;
};

type Props = {
  area?: string | null; // slug
  topic?: string | null; // slug
};

function pickImageUrl(creative: HeroAdMedia | null | undefined): string | null {
  if (!creative) return null;
  return (
    creative.sizes?.hero?.url ||
    creative.sizes?.card?.url ||
    creative.url ||
    null
  );
}

const HeroBanner: React.FC<Props> = ({ area, topic }) => {
  const [doc, setDoc] = useState<HeroAdDoc | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // STRICT AREA SEMANTICS (2026-04-30):
        //
        // The hero you see MUST belong to the cell you're looking at.
        // No fall back to a different area's hero — that would lie
        // about location context (e.g. showing a Canggu hero on
        // a Nusa Penida page with an "Explore Canggu" CTA).
        //
        // Lookup order:
        //   • area + topic        → only (area, topic) cell hero
        //   • area only           → (area, NULL) area-level hero, then
        //                            (area, ANY) any active cell hero
        //                            for the same area (still on-area)
        //   • topic only          → (NULL, topic) topic-level hero (for
        //                            future use — currently no rows)
        //   • neither (homepage)  → (NULL, NULL) homepage default
        //
        // If nothing matches at any step, render NOTHING (return null).
        // The page just shows no hero — a blank space is honest;
        // the wrong-area hero is misleading.

        const fetchOne = async (q: string): Promise<HeroAdDoc | null> => {
          const r = await apiClient.get(
            `hero-ads?${q}&where[active][equals]=true&depth=1&limit=1`,
          );
          return (r?.data?.docs ?? [])[0] ?? null;
        };

        let pick: HeroAdDoc | null = null;

        if (area && topic) {
          pick = await fetchOne(
            `where[area.slug][equals]=${encodeURIComponent(area)}` +
              `&where[topic.slug][equals]=${encodeURIComponent(topic)}`,
          );
        } else if (area) {
          // Area-only hero (the dedicated one for this area page)
          pick = await fetchOne(
            `where[area.slug][equals]=${encodeURIComponent(area)}` +
              `&where[topic][exists]=false`,
          );
          // Same-area cell hero as a fallback — still on-area, just may
          // emphasise a particular topic. Never crosses area boundary.
          if (!pick) {
            pick = await fetchOne(
              `where[area.slug][equals]=${encodeURIComponent(area)}` +
                `&where[topic][exists]=true`,
            );
          }
        } else if (topic) {
          pick = await fetchOne(
            `where[area][exists]=false` +
              `&where[topic.slug][equals]=${encodeURIComponent(topic)}`,
          );
        } else {
          pick = await fetchOne(
            `where[area][exists]=false&where[topic][exists]=false`,
          );
        }

        if (!cancelled) setDoc(pick);
      } catch {
        if (!cancelled) setDoc(null);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [area, topic]);

  if (!loaded) {
    // Skeleton — preserves layout height so there's no CLS on first paint.
    return <div className="w-full bg-front-icewhite aspect-[1200/628] animate-pulse" />;
  }
  if (!doc) return null;

  const imgUrl = pickImageUrl(doc.creative);
  const showCta = !!doc.ctaActive && !!doc.ctaText;
  const ImgWrap: React.ElementType = doc.linkUrl ? Link : "div";
  const wrapProps = doc.linkUrl ? { to: doc.linkUrl } : {};

  return (
    <section className="relative w-full overflow-hidden">
      <ImgWrap {...wrapProps} className="block relative w-full">
        <div
          className="relative w-full bg-[#0B1D2B]"
          style={{ aspectRatio: "1200 / 628" }}
        >
          {imgUrl && (
            <img
              src={imgUrl}
              alt={doc.creative?.alt || doc.headline || ""}
              className="absolute inset-0 w-full h-full object-cover"
              fetchPriority="high"
              decoding="async"
            />
          )}
          {/* Soft gradient overlay so light copy stays legible on busy images */}
          {(doc.headline || doc.subline || showCta) && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          )}

          {(doc.headline || doc.subline || showCta || doc.client) && (
            <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 text-front-icewhite">
              <div className="container max-w-3xl">
                {doc.headline && (
                  <h2 className="font-serif text-3xl md:text-front-section-title leading-tight mb-3">
                    {doc.headline}
                  </h2>
                )}
                {doc.subline && (
                  <p className="font-sans text-base md:text-lg leading-relaxed opacity-90 mb-4 max-w-2xl">
                    {doc.subline}
                  </p>
                )}
                {showCta &&
                  (doc.ctaUrl ? (
                    <Link
                      to={doc.ctaUrl}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-block bg-front-icewhite text-front-navy font-sans font-medium px-6 py-3 rounded-md hover:bg-white transition-colors"
                    >
                      {doc.ctaText}
                    </Link>
                  ) : (
                    <span className="inline-block bg-front-icewhite text-front-navy font-sans font-medium px-6 py-3 rounded-md">
                      {doc.ctaText}
                    </span>
                  ))}
                {doc.client && (
                  <div className="mt-4 text-xs uppercase tracking-wider opacity-70">
                    Sponsored by {doc.client}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ImgWrap>
    </section>
  );
};

export default HeroBanner;
