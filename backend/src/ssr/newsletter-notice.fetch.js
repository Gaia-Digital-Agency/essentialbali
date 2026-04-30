/**
 * SSR fetcher for the `newsletter-notice` Payload Global.
 *
 * Hydrates the homepage subscribe-form copy server-side so the SSR
 * HTML contains the live values (not the frontend's hard-coded
 * FALLBACK constants). Without this, every page's first paint
 * showed the FALLBACK then flashed to the live values after a
 * client-side fetch resolved — confusing editors who saw "Subscribe"
 * in CMS but "Subscribe Now" on the page.
 *
 * Failure mode: best-effort. If Payload is unreachable at SSR time
 * the page still renders (the frontend FALLBACK kicks in). We never
 * block page render on this.
 */
const PAYLOAD_BASE_URL =
  process.env.PAYLOAD_BASE_URL || "http://127.0.0.1:4008";

export const fetchNewsletterNotice = async () => {
  try {
    const res = await fetch(
      `${PAYLOAD_BASE_URL}/api/globals/newsletter-notice?depth=1`,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || typeof data !== "object") return null;
    // Strip Payload internals — just expose the editorial fields.
    return {
      active: data.active !== false,
      headline: data.headline ?? null,
      subline: data.subline ?? null,
      placeholder: data.placeholder ?? null,
      buttonText: data.buttonText ?? null,
      successMessage: data.successMessage ?? null,
      alreadySubscribedMessage: data.alreadySubscribedMessage ?? null,
      errorMessage: data.errorMessage ?? null,
      backgroundImage: data.backgroundImage?.url
        ? { url: data.backgroundImage.url }
        : null,
    };
  } catch (e) {
    console.warn(
      "[ssr/newsletter-notice] fetch failed, frontend FALLBACK will kick in:",
      e?.message || e,
    );
    return null;
  }
};
