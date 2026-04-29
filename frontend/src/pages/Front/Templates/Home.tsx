import React from "react";
import HeroBanner from "../../../components/front/HeroBanner";
import DailyEssentials from "../../../components/front/DailyEssentials";
import Newsletter from "../../../components/front/Newsletter";
import pkg from "../../../lib/utils/Helmet";
const { Helmet } = pkg;

const SITE_URL = import.meta.env.VITE_SITE_URL || "";

/**
 * Homepage layout (post-redesign 2026-04-29).
 *
 *   1. Header + topic nav (rendered by FrontLayout, not here)
 *   2. <HeroBanner />            — one full-width hero from the
 *                                  hero-ads (NULL, NULL) homepage slot
 *   3. <DailyEssentials />       — 4×4 grid of 16 articles, daily-
 *                                  rotated by the cms picker cron;
 *                                  shrinks-and-centres if sparse
 *   4. <Newsletter />            — sign-up block, copy from the
 *                                  newsletter-notice Global
 *   5. Footer (rendered by FrontLayout)
 *
 * The previous HeroImage + BaliEssentialSection1/2/3 + LocalBali
 * were retired in this rewrite. Their underlying components
 * remain on disk pending the Batch D cleanup.
 */
const HomeTemplate: React.FC = () => {
  const pageTitle = "Essential Bali";

  return (
    <div className="min-h-screen overflow-x-hidden bg-front-icewhite">
      <Helmet>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="Essential Bali — your guide to dining, events, schools, wellness, and travel across 8 areas of Bali."
        />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta
          property="og:description"
          content="Essential Bali — curated News, Events, Dining, Wellness across 8 areas of Bali."
        />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:site_name" content="Essential Bali" />
      </Helmet>

      <HeroBanner />
      <main>
        <DailyEssentials />
      </main>
      <Newsletter />
    </div>
  );
};

export default HomeTemplate;
