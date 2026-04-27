/**
 * Thin Payload REST client used by backend SSR fetchers (Phase E rewire).
 *
 * Reads from PAYLOAD_BASE_URL env (default http://127.0.0.1:4008).
 * Authenticates with PAYLOAD_AI_API_KEY when present.
 *
 * Returns the `docs` array directly for find queries (Payload's pagination
 * envelope is preserved on the second arg: `(docs, meta) => …`).
 */
const PAYLOAD_BASE_URL =
  process.env.PAYLOAD_BASE_URL || "http://127.0.0.1:4008";
const PAYLOAD_API_KEY = process.env.PAYLOAD_AI_API_KEY || "";

const buildQuery = (params = {}) => {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    usp.set(k, String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : "";
};

const headers = () => {
  const h = { "Content-Type": "application/json" };
  if (PAYLOAD_API_KEY) {
    h["Authorization"] = `users API-Key ${PAYLOAD_API_KEY}`;
  }
  return h;
};

const handleJson = async (res, label) => {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Payload ${label} failed: ${res.status} ${res.statusText} ${text.slice(0, 200)}`,
    );
  }
  return res.json();
};

export const find = async (collection, params = {}) => {
  const url = `${PAYLOAD_BASE_URL}/api/${collection}${buildQuery(params)}`;
  const res = await fetch(url, { headers: headers() });
  return handleJson(res, `find:${collection}`);
};

export const findById = async (collection, id) => {
  const url = `${PAYLOAD_BASE_URL}/api/${collection}/${id}`;
  const res = await fetch(url, { headers: headers() });
  return handleJson(res, `findById:${collection}/${id}`);
};

export const findBySlug = async (collection, slug) => {
  const r = await find(collection, {
    "where[slug][equals]": slug,
    limit: 1,
    depth: 2,
  });
  return r?.docs?.[0] || null;
};

export const create = async (collection, data) => {
  const url = `${PAYLOAD_BASE_URL}/api/${collection}`;
  const res = await fetch(url, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return handleJson(res, `create:${collection}`);
};

export const update = async (collection, id, data) => {
  const url = `${PAYLOAD_BASE_URL}/api/${collection}/${id}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(data),
  });
  return handleJson(res, `update:${collection}/${id}`);
};

export default { find, findById, findBySlug, create, update };
