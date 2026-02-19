import React from "react";
import { useTaxonomies } from "../../context/TaxonomyContext";
import { NavLink, RouteProps, useNavigate } from "react-router";
import { BALI_AREA_OPTIONS, isBaliAreaSlug } from "../../utils/baliAreas";

interface AreaMenuPanelProps {
  open: boolean;
  onSelect: (label: string) => void;
}

const AreaMenuPanel: React.FC<AreaMenuPanelProps> = ({ open, onSelect }) => {
  const { taxonomies } = useTaxonomies();
  const navigate = useNavigate();

  const changeHandler = (val: string) => {
    const area = taxonomies?.countries?.find((country) => country.slug == val);
    if (area) {
      navigate(`/${area.slug}`);
      return;
    }
    if (val) {
      navigate(`/${val}`);
      return;
    }
    navigate("/");
  };

  const taxonomyOptions = (taxonomies.countries ?? [])
    .filter((country) => country.id !== 999 && isBaliAreaSlug(country.slug))
    .map((country) => ({ value: country.slug, label: country.name }));

  console.log(taxonomyOptions, "taxonomyOptions");

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
      className={`absolute w-full mx-auto bg-front-icewhite
                  transition-all duration-300 ease-in-out
                  ${
                    open
                      ? "opacity-100 translate-y-0 visible"
                      : "opacity-0 -translate-y-4 invisible"
                  }`}
    >
      <div className="container px-12 py-7">
        <div className="pb-7">
          <h2 className="text-front-title font-serif text-front-charcoal-grey">
            Explore The Essentials by Area
          </h2>
        </div>

        <div className="grid grid-rows-5 grid-flow-col auto-cols-max w-fit gap-y-5 gap-x-[100px]">
          <p
            key="all"
            className="text-front-body font-sans text-front-shadowed-slate cursor-pointer hover:text-front-navy transition-colors"
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
              className="text-front-body font-sans text-front-shadowed-slate cursor-pointer hover:text-front-navy transition-colors"
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
