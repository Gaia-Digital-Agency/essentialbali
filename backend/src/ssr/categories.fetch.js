import CategoryService from "../services/category.service.js";
import payload from "../lib/payload.client.js";

const usePayload = process.env.USE_PAYLOAD_DATA === "true";

const isObject = (data) => !!data && data.constructor === Object;

/**
 * Returns categories list. Legacy returned an array of category objects.
 * Payload mode maps `topics` 1:1 onto category shape with these fields:
 *   id, slug_title (= topic.slug), title (= topic.name), id_parent (= null)
 */
export const fetchCategoriesData = async () => {
  if (usePayload) {
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
  }

  // Legacy path
  const getCategory = await CategoryService.getAll();
  const resCategory = isObject(getCategory)
    ? getCategory
    : Array.isArray(getCategory)
      ? getCategory
      : getCategory;
  return resCategory;
};
