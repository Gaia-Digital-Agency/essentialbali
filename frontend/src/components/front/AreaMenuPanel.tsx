import React from "react";
import { useTaxonomies } from "../../context/TaxonomyContext";
import { useNavigate } from "react-router"; // NavLink, RouteProps,
import { useRoute } from "../../context/RouteContext";
import { BALI_AREA_OPTIONS, isBaliAreaSlug } from "../../utils/baliAreas";

interface AreaMenuPanelProps {
  open: boolean;
  onSelect: (label: string) => void;
}

const AreaMenuPanel: React.FC<AreaMenuPanelProps> = ({ open, onSelect }) => {
  const { taxonomies } = useTaxonomies();
  const { actualRoute } = useRoute();
  const navigate = useNavigate();

  // Preserve the current topic when the visitor switches area:
  //   /canggu/dine → pick Ubud → /ubud/dine (NOT /ubud)
  //   /canggu      → pick Ubud → /ubud
  //   /            → pick Canggu → /canggu
  //   any URL      → pick All Area → /
  // The previous code dropped the topic context, which made it
  // tedious to compare e.g. "Dine in Canggu vs Dine in Ubud".
  const currentTopicSlug = actualRoute?.category?.slug_title;

  const changeHandler = (val: string) => {
    // "All Area" → root
    if (!val) {
      navigate("/");
      return;
    }
    // Resolve to canonical slug from taxonomy if possible.
    const area = taxonomies?.countries?.find((country) => country.slug == val);
    const slug = area?.slug ?? val;
    // Append topic when one is currently active
    if (currentTopicSlug) {
      navigate(`/${slug}/${currentTopicSlug}`);
    } else {
      navigate(`/${slug}`);
    }
  };

  const taxonomyOptions = (taxonomies.countries ?? [])
    .filter((country) => country.id !== 999 && isBaliAreaSlug(country.slug))
    .map((country) => ({ value: country.slug, label: country.name }));

  // console.log(taxonomyOptions, "taxonomyOptions");

  const options =
    taxonomyOptions.length > 0
      ? taxonomyOptions
      : BALI_AREA_OPTIONS.map((area) => ({
          value: area.slug,
          label: area.name,
        }));

  return (
    <div
      id="data-area"
      className={`absolute w-full mx-auto bg-front-icewhite z-99
                  transition-all duration-300 ease-in-out
                  ${open ? "opacity-100 -translate-y-1 visible shadow-[inset_0_20px_20px_-15px_rgba(0,0,0,0.3),0_10px_20px_rgba(0,0,0,0.2)]" : "opacity-0 -translate-y-4 invisible"}`}
    >
      <div className="container px-6 sm:px-12 pt-7 pb-12 sm:pb-14 max-h-[80vh] overflow-y-auto">
        <div className="pb-6 sm:pb-7">
          <h2 className="font-serif text-front-title text-front-charcoal-grey">
            Explore The Essentials by Area
          </h2>
        </div>

        <div className="flex flex-row flex-wrap items-center gap-x-6 sm:gap-x-8 gap-y-3 area-wrapper">
          <p
            key="all"
            className="font-sans transition-colors cursor-pointer text-front-body text-front-shadowed-slate hover:text-front-navy"
            onClick={() => {
              changeHandler("");
              onSelect("All Area");
            }}
          >
            {"All Area"}
          </p>
          {options.map((option) => (
            <p
              key={option.value}
              className="font-sans transition-colors cursor-pointer text-front-body text-front-shadowed-slate hover:text-front-navy"
              onClick={() => {
                changeHandler(option.value);
                onSelect(option.label);
              }}
            >
              {option.label}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AreaMenuPanel;
