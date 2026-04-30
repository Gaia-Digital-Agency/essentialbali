import React from "react";
import { Link } from "react-router";
import { useRoute } from "../../context/RouteContext";

/**
 * Always-visible "you are here" strip rendered below the main header.
 *
 * Mobile + desktop, single source of awareness for area + category
 * context. Replaces the need for an absolutely-positioned breadcrumb
 * over the hero (the SingleV2 article-page breadcrumb that bled onto
 * the photo and was fixed 2026-04-30).
 *
 * Hidden when neither area nor category is set (the bare homepage)
 * — there's nothing to navigate "back to" from there.
 *
 * Visual:
 *   ›  Home › Canggu › Dine
 *
 * Each segment links to the parent context. Tap the area name to
 * land on `/{area}`, tap the topic name to land on `/{area}/{topic}`,
 * tap Home to land on `/`.
 */
const BreadcrumbStrip: React.FC = () => {
  const { actualRoute } = useRoute();
  const area = actualRoute?.country;
  const topic = actualRoute?.category;

  if (!area && !topic) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="border-b border-front-navy/10 bg-front-icewhite/95"
    >
      <div className="container py-2 flex items-center gap-2 text-front-small overflow-x-auto whitespace-nowrap">
        <Link
          to="/"
          className="text-front-shadowed-slate hover:text-front-navy transition-colors flex-shrink-0"
        >
          Home
        </Link>
        {area && (
          <>
            <span aria-hidden className="text-front-navy/40 flex-shrink-0">›</span>
            <Link
              to={`/${area.slug}`}
              className="text-front-red font-semibold hover:text-front-red/80 transition-colors flex-shrink-0"
            >
              {area.name}
            </Link>
          </>
        )}
        {topic && (
          <>
            <span aria-hidden className="text-front-navy/40 flex-shrink-0">›</span>
            <Link
              to={`/${area ? area.slug + "/" : ""}${topic.slug_title}`}
              className="text-front-red font-semibold hover:text-front-red/80 transition-colors flex-shrink-0"
            >
              {topic.title}
            </Link>
          </>
        )}
        {actualRoute?.article && (
          <>
            <span aria-hidden className="text-front-navy/40 flex-shrink-0">›</span>
            <span className="text-front-shadowed-slate truncate" title={actualRoute.article.title}>
              {actualRoute.article.title}
            </span>
          </>
        )}
      </div>
    </nav>
  );
};

export default BreadcrumbStrip;
