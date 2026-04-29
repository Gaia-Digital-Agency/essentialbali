import payload from "../lib/payload.client.js";

/**
 * Returns { country, city, region } in the legacy 3-tier shape.
 * Payload collapsed location to a single tier (areas) — `country` carries
 * the area list, city/region are empty arrays kept for legacy compatibility.
 *
 * Legacy Sequelize fallback removed in cleanup-C.
 */
export const fetchLocationsData = async () => {
  try {
    const res = await payload.find("areas", { limit: 100, depth: 0 });
    const country = (res?.docs || []).map((a) => ({
      id: a.id,
      slug: a.slug,
      name: a.name,
      timezone: "Asia/Makassar",
    }));
    return { country, city: [], region: [] };
  } catch (e) {
    console.error("[ssr/locations.fetch] Payload error:", e.message);
    return { country: [], city: [], region: [] };
  }
};
