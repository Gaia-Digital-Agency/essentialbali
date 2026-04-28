import tagsService from "../services/tags.service.js";
import payload from "../lib/payload.client.js";

const usePayload = process.env.USE_PAYLOAD_DATA === "true";

/**
 * Phase E rewire: when USE_PAYLOAD_DATA=true, hit Payload /api/tags
 * instead of Sequelize. Legacy MySQL path kept for safety until DB
 * is dropped.
 */
export const fetchTagsData = async (tags) => {
  if (!Array.isArray(tags)) return [];
  if (usePayload) {
    try {
      const ids = tags.map((t) => (typeof t === "object" ? t.id : t)).filter(Boolean);
      if (!ids.length) return [];
      const res = await payload.find("tags", {
        "where[id][in]": ids.join(","),
        depth: 0,
        limit: 100,
      });
      return res?.docs || [];
    } catch (e) {
      console.error("[ssr/tags.fetch:fetchTagsData] Payload error:", e.message);
      return [];
    }
  }
  return tagsService.getById(tags.join(","));
};
