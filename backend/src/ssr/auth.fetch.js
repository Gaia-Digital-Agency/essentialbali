/**
 * fetchAuth — legacy SSR session probe.
 *
 * The legacy admin (signin/signup pages) was retired and replaced with
 * Payload at /admin (which nginx routes to :4008, never reaching this
 * Express server). The result of fetchAuth is only consumed in two places:
 *
 *   1. /admin redirect guard in app.js — dead code now, /admin never
 *      reaches Express (nginx allowlist routes it to Payload).
 *   2. Public-page SSR template context — initialAuth is passed through
 *      so legacy templates could swap a "login"/"logout" button. Public
 *      pages get undefined gracefully.
 *
 * cleanup-C stubs this to undefined so we can drop services + models.
 */
export const fetchAuth = async (_req) => undefined;
