const BALI_AREAS = [
  "Canggu",
  "Seminyak",
  "Kuta",
  "Legian",
  "Ubud",
  "Uluwatu",
  "Jimbaran",
  "Sanur",
  "Nusa Dua",
  "Ungasan",
  "Pecatu",
  "Kutuh",
  "Sawangan",
  "Kerobokan",
  "Umalas",
  "Denpasar",
  "Candidasa",
  "Amed",
  "Tulamben",
  "Padangbai",
  "Sidemen",
  "Amlapura",
  "Klungkung",
  "Tirta Gangga",
  "Bedugul",
  "Kintamani",
  "Munduk",
  "Lovina",
  "Singaraja",
  "Baturiti",
  "Bangli",
  "Jatiluwih",
  "Pemuteran",
  "Medewi",
  "Negara",
  "Gilimanuk",
  "Menjangan Island",
  "Tabanan",
  "Nusa Penida",
  "Nusa Lembongan",
  "Nusa Ceningan",
  "Serangan Island"
];
const normalizeToSlug = (value) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const BALI_AREA_SLUGS = new Set(BALI_AREAS.map(normalizeToSlug));
const BALI_AREA_OPTIONS = BALI_AREAS.map((name) => ({
  name,
  slug: normalizeToSlug(name)
}));
const isBaliAreaSlug = (slug) => {
  if (!slug) return false;
  return BALI_AREA_SLUGS.has(normalizeToSlug(slug));
};
export {
  BALI_AREA_OPTIONS as B,
  isBaliAreaSlug as i
};
