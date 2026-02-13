import { jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import { c as useTaxonomies } from "./TimeContext-B5j8j_GZ.js";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
const TemplateLayout = () => {
  const [locations, setLocations] = useState([]);
  const { adminTaxonomies } = useTaxonomies();
  useEffect(() => {
    if (!adminTaxonomies.countries || !adminTaxonomies.cities || !adminTaxonomies.regions) return;
    const newCity = adminTaxonomies.cities.map((cit) => {
      var _a;
      return { ...cit, regions: (_a = adminTaxonomies.regions) == null ? void 0 : _a.filter((reg) => reg.id_parent == cit.id) };
    });
    const newCountry = adminTaxonomies.countries.map((coun) => {
      const city = newCity == null ? void 0 : newCity.filter((cit) => cit.id_parent == coun.id);
      return { ...coun, cities: city };
    });
    setLocations(newCountry);
  }, [adminTaxonomies]);
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(Outlet, { context: { locations } }) });
};
export {
  TemplateLayout as default
};
