import locationService from "../services/location.service.js";
import payload from "../lib/payload.client.js";

const usePayload = process.env.USE_PAYLOAD_DATA === "true";

/**
 * Returns { country, city, region } in the legacy 3-tier shape.
 *
 * - Legacy mode (USE_PAYLOAD_DATA != true): unchanged Sequelize/MySQL path.
 * - Payload mode: maps Payload `areas` → `country`, returns empty `city`/`region`.
 *   This is intentional — Phase D collapsed location to a single tier (areas).
 */
export const fetchLocationsData = async () => {
  if (usePayload) {
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
  }

  // Legacy path
  try {
    const countryRes = await locationService.getCountry();
    const cityRes = await locationService.getCity();
    const regionRes = await locationService.getRegion();
    return { country: countryRes, city: cityRes, region: regionRes };
  } catch (error) {
    console.log(error);
    return { country: [], city: [], region: [] };
  }
};
