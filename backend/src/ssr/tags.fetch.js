import payload from "../lib/payload.client.js";

/**
 * Resolve tag IDs to tag objects via Payload /api/tags.
 *
 * Legacy Sequelize fallback removed in cleanup-C.
 */
export const fetchTagsData = async (tags) => {
  if (!Array.isArray(tags) || tags.length === 0) return [];
  try {
    const ids = tags
      .map((t) => (typeof t === "object" ? t.id : t))
      .filter(Boolean);
    if (!ids.length) return [];
    const res = await payload.find("tags", {
      "where[id][in]": ids.join(","),
      depth: 0,
      limit: 100,
    });
    return res?.docs || [];
  } catch (e) {
    console.error("[ssr/tags.fetch] Payload error:", e.message);
    return [];
  }
};
