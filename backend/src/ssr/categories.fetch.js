import payload from "../lib/payload.client.js";

/**
 * Returns categories list (Payload `topics` mapped 1:1 onto legacy
 * category shape).
 *
 * Legacy Sequelize fallback removed in cleanup-C — MySQL is gone and
 * USE_PAYLOAD_DATA has been permanently true since 2026-04-28.
 */
export const fetchCategoriesData = async () => {
  try {
    const res = await payload.find("topics", { limit: 100, depth: 0 });
    return (res?.docs || []).map((t) => ({
      id: t.id,
      slug_title: t.slug,
      title: t.name,
      slug: t.slug,
      name: t.name,
      id_parent: null,
      icon: t.icon || null,
    }));
  } catch (e) {
    console.error("[ssr/categories.fetch] Payload error:", e.message);
    return [];
  }
};
