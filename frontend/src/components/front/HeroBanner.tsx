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
        const params: string[] = [
          "where[active][equals]=true",
          "depth=1",
          "limit=1",
        ];
        if (area) params.push(`where[area.slug][equals]=${encodeURIComponent(area)}`);
        else params.push("where[area][exists]=false");
        if (topic) params.push(`where[topic.slug][equals]=${encodeURIComponent(topic)}`);
        else params.push("where[topic][exists]=false");

        let res = await apiClient.get(`hero-ads?${params.join("&")}`);
        let docs: HeroAdDoc[] = res?.data?.docs ?? [];

        // Fallback to the homepage default if the cell-specific slot is
        // missing or inactive and we asked for one.
        if (docs.length === 0 && (area || topic)) {
          res = await apiClient.get(
            "hero-ads?where[active][equals]=true&where[area][exists]=false&where[topic][exists]=false&depth=1&limit=1",
          );
          docs = res?.data?.docs ?? [];
        }
        if (!cancelled) setDoc(docs[0] ?? null);
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
