import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useId, useState, useEffect, useRef, useMemo } from "react";
import { useNavigate as useNavigate$1, NavLink as NavLink$1 } from "react-router-dom";
import { Link, useNavigate, NavLink, Outlet } from "react-router";
import { u as useRoute, c as useTaxonomies, d as useHeaderContent, N as NotificationProvider } from "./TimeContext-B5j8j_GZ.js";
import ReactSelect from "react-select";
import { i as isBaliAreaSlug, B as BALI_AREA_OPTIONS } from "./baliAreas-aT1W4YMu.js";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { g as getTemplateByUrl } from "./template.service-BkOXTsSh.js";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
const SvgFacebook = (props) => /* @__PURE__ */ React.createElement("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("g", { clipPath: "url(#clip0_239_890)" }, /* @__PURE__ */ React.createElement("path", { d: "M12 0C5.37264 0 0 5.37264 0 12C0 17.6275 3.87456 22.3498 9.10128 23.6467V15.6672H6.62688V12H9.10128V10.4198C9.10128 6.33552 10.9498 4.4424 14.9597 4.4424C15.72 4.4424 17.0318 4.59168 17.5685 4.74048V8.06448C17.2853 8.03472 16.7933 8.01984 16.1822 8.01984C14.2147 8.01984 13.4544 8.76528 13.4544 10.703V12H17.3741L16.7006 15.6672H13.4544V23.9122C19.3963 23.1946 24.0005 18.1354 24.0005 12C24 5.37264 18.6274 0 12 0Z", fill: "white" })), /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("clipPath", { id: "clip0_239_890" }, /* @__PURE__ */ React.createElement("rect", { width: 24, height: 24, fill: "white" }))));
const SvgInstagram = (props) => /* @__PURE__ */ React.createElement("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("g", { clipPath: "url(#clip0_239_891)" }, /* @__PURE__ */ React.createElement("path", { d: "M12 2.16094C15.2063 2.16094 15.5859 2.175 16.8469 2.23125C18.0188 2.28281 18.6516 2.47969 19.0734 2.64375C19.6313 2.85938 20.0344 3.12188 20.4516 3.53906C20.8734 3.96094 21.1313 4.35938 21.3469 4.91719C21.5109 5.33906 21.7078 5.97656 21.7594 7.14375C21.8156 8.40937 21.8297 8.78906 21.8297 11.9906C21.8297 15.1969 21.8156 15.5766 21.7594 16.8375C21.7078 18.0094 21.5109 18.6422 21.3469 19.0641C21.1313 19.6219 20.8687 20.025 20.4516 20.4422C20.0297 20.8641 19.6313 21.1219 19.0734 21.3375C18.6516 21.5016 18.0141 21.6984 16.8469 21.75C15.5813 21.8062 15.2016 21.8203 12 21.8203C8.79375 21.8203 8.41406 21.8062 7.15313 21.75C5.98125 21.6984 5.34844 21.5016 4.92656 21.3375C4.36875 21.1219 3.96563 20.8594 3.54844 20.4422C3.12656 20.0203 2.86875 19.6219 2.65313 19.0641C2.48906 18.6422 2.29219 18.0047 2.24063 16.8375C2.18438 15.5719 2.17031 15.1922 2.17031 11.9906C2.17031 8.78438 2.18438 8.40469 2.24063 7.14375C2.29219 5.97187 2.48906 5.33906 2.65313 4.91719C2.86875 4.35938 3.13125 3.95625 3.54844 3.53906C3.97031 3.11719 4.36875 2.85938 4.92656 2.64375C5.34844 2.47969 5.98594 2.28281 7.15313 2.23125C8.41406 2.175 8.79375 2.16094 12 2.16094ZM12 0C8.74219 0 8.33438 0.0140625 7.05469 0.0703125C5.77969 0.126563 4.90313 0.332812 4.14375 0.628125C3.35156 0.9375 2.68125 1.34531 2.01563 2.01562C1.34531 2.68125 0.9375 3.35156 0.628125 4.13906C0.332812 4.90313 0.126563 5.775 0.0703125 7.05C0.0140625 8.33437 0 8.74219 0 12C0 15.2578 0.0140625 15.6656 0.0703125 16.9453C0.126563 18.2203 0.332812 19.0969 0.628125 19.8563C0.9375 20.6484 1.34531 21.3188 2.01563 21.9844C2.68125 22.65 3.35156 23.0625 4.13906 23.3672C4.90313 23.6625 5.775 23.8687 7.05 23.925C8.32969 23.9812 8.7375 23.9953 11.9953 23.9953C15.2531 23.9953 15.6609 23.9812 16.9406 23.925C18.2156 23.8687 19.0922 23.6625 19.8516 23.3672C20.6391 23.0625 21.3094 22.65 21.975 21.9844C22.6406 21.3188 23.0531 20.6484 23.3578 19.8609C23.6531 19.0969 23.8594 18.225 23.9156 16.95C23.9719 15.6703 23.9859 15.2625 23.9859 12.0047C23.9859 8.74688 23.9719 8.33906 23.9156 7.05938C23.8594 5.78438 23.6531 4.90781 23.3578 4.14844C23.0625 3.35156 22.6547 2.68125 21.9844 2.01562C21.3188 1.35 20.6484 0.9375 19.8609 0.632812C19.0969 0.3375 18.225 0.13125 16.95 0.075C15.6656 0.0140625 15.2578 0 12 0Z", fill: "white" }), /* @__PURE__ */ React.createElement("path", { d: "M12 5.83594C8.59688 5.83594 5.83594 8.59688 5.83594 12C5.83594 15.4031 8.59688 18.1641 12 18.1641C15.4031 18.1641 18.1641 15.4031 18.1641 12C18.1641 8.59688 15.4031 5.83594 12 5.83594ZM12 15.9984C9.79219 15.9984 8.00156 14.2078 8.00156 12C8.00156 9.79219 9.79219 8.00156 12 8.00156C14.2078 8.00156 15.9984 9.79219 15.9984 12C15.9984 14.2078 14.2078 15.9984 12 15.9984Z", fill: "white" }), /* @__PURE__ */ React.createElement("path", { d: "M19.8469 5.59238C19.8469 6.38926 19.2 7.03145 18.4078 7.03145C17.6109 7.03145 16.9688 6.38457 16.9688 5.59238C16.9688 4.79551 17.6156 4.15332 18.4078 4.15332C19.2 4.15332 19.8469 4.8002 19.8469 5.59238Z", fill: "white" })), /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("clipPath", { id: "clip0_239_891" }, /* @__PURE__ */ React.createElement("rect", { width: 24, height: 24, fill: "white" }))));
const SvgLinkedin = (props) => /* @__PURE__ */ React.createElement("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("g", { clipPath: "url(#clip0_239_892)" }, /* @__PURE__ */ React.createElement("path", { d: "M22.2234 0H1.77187C0.792187 0 0 0.773438 0 1.72969V22.2656C0 23.2219 0.792187 24 1.77187 24H22.2234C23.2031 24 24 23.2219 24 22.2703V1.72969C24 0.773438 23.2031 0 22.2234 0ZM7.12031 20.4516H3.55781V8.99531H7.12031V20.4516ZM5.33906 7.43438C4.19531 7.43438 3.27188 6.51094 3.27188 5.37187C3.27188 4.23281 4.19531 3.30937 5.33906 3.30937C6.47813 3.30937 7.40156 4.23281 7.40156 5.37187C7.40156 6.50625 6.47813 7.43438 5.33906 7.43438ZM20.4516 20.4516H16.8937V14.8828C16.8937 13.5562 16.8703 11.8453 15.0422 11.8453C13.1906 11.8453 12.9094 13.2937 12.9094 14.7891V20.4516H9.35625V8.99531H12.7687V10.5609H12.8156C13.2891 9.66094 14.4516 8.70938 16.1813 8.70938C19.7859 8.70938 20.4516 11.0813 20.4516 14.1656V20.4516Z", fill: "white" })), /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("clipPath", { id: "clip0_239_892" }, /* @__PURE__ */ React.createElement("rect", { width: 24, height: 24, fill: "white" }))));
const SvgHamburger = (props) => /* @__PURE__ */ React.createElement("svg", { width: "1em", height: "1em", viewBox: "0 0 24 25", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("g", { clipPath: "url(#clip0_643_2614)" }, /* @__PURE__ */ React.createElement("path", { d: "M3 18.5H21V16.5H3V18.5ZM3 13.5H21V11.5H3V13.5ZM3 6.5V8.5H21V6.5H3Z", fill: "#b56576" })), /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("clipPath", { id: "clip0_643_2614" }, /* @__PURE__ */ React.createElement("rect", { width: 24, height: 24, fill: "white", transform: "translate(0 0.5)" }))));
const SvgCloseMenu = (props) => /* @__PURE__ */ React.createElement("svg", { width: "1em", height: "1em", viewBox: "0 0 24 25", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("g", { clipPath: "url(#clip0_631_2091)" }, /* @__PURE__ */ React.createElement("path", { d: "M19 6.91L17.59 5.5L12 11.09L6.41 5.5L5 6.91L10.59 12.5L5 18.09L6.41 19.5L12 13.91L17.59 19.5L19 18.09L13.41 12.5L19 6.91Z", fill: "#b56576" })), /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("clipPath", { id: "clip0_631_2091" }, /* @__PURE__ */ React.createElement("rect", { width: 24, height: 24, fill: "white", transform: "translate(0 0.5)" }))));
const STATIC_LOGO_PATH = "/logo.png";
const NavLogo = ({ to = "/" }) => {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(Link, { to, children: /* @__PURE__ */ jsx(
    "img",
    {
      src: STATIC_LOGO_PATH,
      width: 124,
      height: 52,
      className: "w-auto h-[52px] md:h-[56px]",
      alt: "essentialbali logo"
    }
  ) }) });
};
const SelectNav = ({ onChange, options, value, defaultLabel, classNames }) => {
  const instanceId = useId();
  const defaultValue = value ? options.filter((option) => value == option.value)[0] : { value: defaultLabel, label: defaultLabel };
  const emptyOption = { value: defaultLabel, label: defaultLabel };
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    ReactSelect,
    {
      instanceId,
      value: defaultValue,
      defaultValue: emptyOption,
      options: [emptyOption, ...options],
      isSearchable: false,
      onChange: (option) => {
        if ((option == null ? void 0 : option.value) == defaultLabel) {
          onChange("");
        } else {
          onChange((option == null ? void 0 : option.value) ? option.value : "");
        }
      },
      styles: {
        control: (style, state) => {
          return { ...style, borderRadius: "0", border: 0, borderBottom: state.getValue()[0].value == defaultLabel ? "1px solid var(--color-front-red)" : "1px solid var(--color-front-red)" };
        },
        menu: (style) => {
          return { ...style, borderRadius: 0 };
        },
        option: (style, { isSelected }) => {
          if (isSelected) {
            return { ...style, backgroundColor: "var(--color-front-red)", color: "#fff" };
          }
          return { ...style, color: "var(--color-front-red)" };
        },
        singleValue: (style) => {
          return { ...style, color: "var(--color-front-red)" };
        },
        dropdownIndicator: (style) => {
          return { ...style, fill: "var(--color-front-red)" };
        }
      },
      classNames: {
        control: (state) => {
          const className = (classNames == null ? void 0 : classNames.control) || "";
          return className + " bg-white";
        },
        singleValue: (state) => {
          const className = (classNames == null ? void 0 : classNames.singleValue) || "";
          return className + " text-black text-front-body-big";
        },
        indicatorSeparator: () => "hidden",
        dropdownIndicator: () => {
          return "!text-front-red";
        },
        option: () => {
          const className = (classNames == null ? void 0 : classNames.option) || "";
          return className + " hover:!bg-front-red hover:!text-white active:!bg-front-red active:!text-white";
        }
      }
    }
  ) });
};
const DropDownCountry = () => {
  var _a;
  const { actualRoute } = useRoute();
  const { taxonomies } = useTaxonomies();
  const navigate = useNavigate();
  const changeHandler = (val) => {
    var _a2;
    const area = (_a2 = taxonomies == null ? void 0 : taxonomies.countries) == null ? void 0 : _a2.find((country) => country.slug == val);
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
  const taxonomyOptions = (taxonomies.countries ?? []).filter((country) => country.id !== 999 && isBaliAreaSlug(country.slug)).map((country) => ({ value: country.slug, label: country.name }));
  const options = taxonomyOptions.length > 0 ? taxonomyOptions : BALI_AREA_OPTIONS.map((area) => ({ value: area.slug, label: area.name }));
  return /* @__PURE__ */ jsx("div", { className: "dropdown-country-wrapper", children: /* @__PURE__ */ jsx(
    SelectNav,
    {
      onChange: changeHandler,
      options,
      defaultLabel: "All Bali Areas",
      value: ((_a = actualRoute.country) == null ? void 0 : _a.slug) || void 0,
      classNames: {
        singleValue: "dropdown-country-nav dropdown-country-input text-theme-front-red md:w-[260px] w-[190px]",
        option: "dropdown-country-nav dropdown-country-option text-theme-front-red"
      }
    }
  ) });
};
const NavLocation = () => {
  var _a, _b, _c;
  const [cities, setCities] = useState();
  const [regions, setRegions] = useState();
  const { actualRoute } = useRoute();
  const { taxonomies } = useTaxonomies();
  const filteredCountries = (_a = { ...taxonomies }.countries) == null ? void 0 : _a.filter((country) => country.id !== 999 && isBaliAreaSlug(country.slug));
  const filteredTax = { ...taxonomies, countries: filteredCountries };
  const navigate = useNavigate();
  useEffect(() => {
    var _a2, _b2;
    const currentCountry = actualRoute.country;
    if (currentCountry) {
      setCities((_a2 = filteredTax == null ? void 0 : filteredTax.cities) == null ? void 0 : _a2.filter((city) => city.id_parent == currentCountry.id));
    }
    const currentCity = actualRoute.city;
    if (currentCity) {
      setRegions((_b2 = filteredTax == null ? void 0 : filteredTax.regions) == null ? void 0 : _b2.filter((region) => region.id_parent == currentCity.id));
    }
  }, [actualRoute]);
  const changeCountryHandler = (country) => {
    var _a2, _b2;
    if (country == "") {
      navigate(`${(actualRoute == null ? void 0 : actualRoute.category) ? `/${(_a2 = actualRoute == null ? void 0 : actualRoute.category) == null ? void 0 : _a2.slug_title}` : "/"}`);
      return;
    }
    navigate(`/${country}${(actualRoute == null ? void 0 : actualRoute.category) ? `/${(_b2 = actualRoute == null ? void 0 : actualRoute.category) == null ? void 0 : _b2.slug_title}` : ""}`);
  };
  const changeCityHandler = (city) => {
    var _a2, _b2, _c2, _d;
    if (city == "") {
      navigate(`/${(_a2 = actualRoute == null ? void 0 : actualRoute.country) == null ? void 0 : _a2.slug}${(actualRoute == null ? void 0 : actualRoute.category) ? `/${(_b2 = actualRoute == null ? void 0 : actualRoute.category) == null ? void 0 : _b2.slug_title}` : ""}`);
      return;
    }
    navigate(`/${(_c2 = actualRoute == null ? void 0 : actualRoute.country) == null ? void 0 : _c2.slug}/${city}${(actualRoute == null ? void 0 : actualRoute.category) ? `/${(_d = actualRoute == null ? void 0 : actualRoute.category) == null ? void 0 : _d.slug_title}` : ""}`);
  };
  const changeRegionHandler = (region) => {
    var _a2, _b2, _c2, _d, _e, _f;
    if (region == "") {
      navigate(`/${(_a2 = actualRoute == null ? void 0 : actualRoute.country) == null ? void 0 : _a2.slug}/${(_b2 = actualRoute == null ? void 0 : actualRoute.city) == null ? void 0 : _b2.slug}/${(actualRoute == null ? void 0 : actualRoute.category) ? `/${(_c2 = actualRoute == null ? void 0 : actualRoute.category) == null ? void 0 : _c2.slug_title}` : ""}`);
      return;
    }
    navigate(
      `/${(_d = actualRoute == null ? void 0 : actualRoute.country) == null ? void 0 : _d.slug}/${(_e = actualRoute == null ? void 0 : actualRoute.city) == null ? void 0 : _e.slug}/${region}${(actualRoute == null ? void 0 : actualRoute.category) ? `/${(_f = actualRoute == null ? void 0 : actualRoute.category) == null ? void 0 : _f.slug_title}` : ""}`
    );
  };
  const getCountryUrl = (country) => {
    return `/${country.slug}${(actualRoute == null ? void 0 : actualRoute.category) ? `/${actualRoute.category.slug_title}` : ""}`;
  };
  if (actualRoute.country) {
    return /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row gap-y-2 md:gap-y-0 md:gap-x-3", children: [
      /* @__PURE__ */ jsx("div", { className: "md:w-[250px] w-full", children: /* @__PURE__ */ jsx(
        SelectNav,
        {
          classNames: { singleValue: "uppercase" },
          defaultLabel: "All Bali Areas",
          onChange: changeCountryHandler,
          value: (actualRoute == null ? void 0 : actualRoute.country) ? actualRoute.country.slug : void 0,
          options: ((_b = filteredTax == null ? void 0 : filteredTax.countries) == null ? void 0 : _b.map((country) => {
            return { value: country.slug, label: country.name };
          })) ?? []
        }
      ) }),
      !!(cities && actualRoute.country && cities.length) && /* @__PURE__ */ jsx("div", { className: "md:w-[250px] w-full", children: /* @__PURE__ */ jsx(
        SelectNav,
        {
          classNames: { singleValue: "uppercase" },
          defaultLabel: "Explore City",
          onChange: changeCityHandler,
          value: actualRoute.city ? actualRoute.city.slug : void 0,
          options: cities.map((city) => {
            return { value: city.slug, label: city.name };
          })
        }
      ) }),
      !!(regions && actualRoute.city && regions.length) && /* @__PURE__ */ jsx("div", { className: "md:w-[250px] w-full", children: /* @__PURE__ */ jsx(
        SelectNav,
        {
          classNames: { singleValue: "uppercase" },
          defaultLabel: "Explore Sub Area",
          onChange: changeRegionHandler,
          value: actualRoute.region ? actualRoute.region.slug : void 0,
          options: regions.map((region) => {
            return { value: region.slug, label: region.name };
          })
        }
      ) })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsx("p", { className: "font-serif text-front-subtitle-big font-bold mb-3", children: "EXPLORE BALI AREAS" }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: (_c = filteredTax.countries) == null ? void 0 : _c.map((country) => /* @__PURE__ */ jsx("div", { className: "country uppercase text-center items-center", children: /* @__PURE__ */ jsx(
      Link,
      {
        className: "text-front-body border-[1px] border-front-red flex justify-center items-center h-10 w-full transition text-front-red bg-white hover:text-white hover:bg-front-red",
        to: getCountryUrl(country),
        children: country.name
      }
    ) }, `navlocation-explore-${country.id}`)) })
  ] });
};
const MobileMenu = ({ isModalOpen = false, closeModal }) => {
  var _a, _b;
  const { actualRoute } = useRoute();
  const mobileMenuRef = useRef(null);
  const { initialData } = useHeaderContent();
  const { taxonomies } = useTaxonomies();
  const { contextSafe } = useGSAP({ scope: mobileMenuRef });
  const [isClient, setIsClient] = useState(false);
  const [headerMenus, setHeaderMenus] = useState((initialData == null ? void 0 : initialData.header) ?? []);
  const tlRef = useRef(null);
  const onMouseLeaveHandler = contextSafe((e) => {
    if (e.currentTarget.classList.contains("is-active")) return;
    gsap.to(e.target, {
      "--hover-width": "0%",
      "--hover-color": "#b56576",
      "--hover-text": "#101828"
      // '--hover-translate': '50%'
    });
  });
  const onMouseEnterHandler = contextSafe((e) => {
    if (e.currentTarget.classList.contains("is-active")) return;
    gsap.to(e.currentTarget, {
      "--hover-width": "100%",
      "--hover-color": "#b56576",
      "--hover-text": "#b56576"
      // '--hover-translate': '0%'
    });
  });
  const generateTo = (url) => {
    var _a2;
    if (actualRoute == null ? void 0 : actualRoute.article) {
      return `/${(_a2 = actualRoute.country) == null ? void 0 : _a2.slug}/${url}`;
    }
    if (actualRoute == null ? void 0 : actualRoute.category) {
      return "../" + url;
    }
    return url;
  };
  useEffect(() => {
    setIsClient(true);
    if (!headerMenus || headerMenus.length === 0) {
      (async () => {
        var _a2, _b2, _c, _d;
        try {
          const getTemplate = await getTemplateByUrl("/header");
          if ((getTemplate == null ? void 0 : getTemplate.data) && getTemplate.status_code == 200) {
            const jsonData = JSON.parse(getTemplate.data.content);
            setHeaderMenus(jsonData);
          } else {
            const fallbackMenus = ((_b2 = (_a2 = taxonomies.categories) == null ? void 0 : _a2.filter((cat) => !cat.id_parent)) == null ? void 0 : _b2.map((cat) => ({
              label: cat.title,
              url: cat.slug_title,
              linkCategory: cat.id
            }))) ?? [];
            setHeaderMenus(fallbackMenus);
          }
        } catch (e) {
          console.log("Error fetching header template:", e);
          const fallbackMenus = ((_d = (_c = taxonomies.categories) == null ? void 0 : _c.filter((cat) => !cat.id_parent)) == null ? void 0 : _d.map((cat) => ({
            label: cat.title,
            url: cat.slug_title,
            linkCategory: cat.id
          }))) ?? [];
          setHeaderMenus(fallbackMenus);
        }
      })();
    }
  }, [taxonomies.categories]);
  useEffect(() => {
    if (!isClient) return;
    const menuEl = mobileMenuRef.current;
    if (!menuEl || tlRef.current) return;
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(menuEl, {
      translateX: "100%"
    }, {
      translateX: "0%"
    });
    tlRef.current = tl;
  }, [isClient]);
  useEffect(() => {
    const menuEl = mobileMenuRef.current;
    const tl = tlRef.current;
    if (!menuEl || !isClient || !tl) return;
    if (isModalOpen) {
      tl.play();
      return;
    } else {
      tl.reverse();
      return;
    }
  }, [isModalOpen, isClient]);
  return /* @__PURE__ */ jsx("aside", { ref: mobileMenuRef, className: "fixed inset-0 bg-white h-full z-[999] block md:hidden", style: { transform: "translateX(100%)" }, children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "container mx-auto py-6 flex justify-between items-center", children: [
      /* @__PURE__ */ jsx("div", { className: "logo-wrapper w-max", children: /* @__PURE__ */ jsx(NavLogo, { url: "/logo-header", to: "/" }) }),
      /* @__PURE__ */ jsx("div", { className: "icons-wrapper", children: /* @__PURE__ */ jsx("div", { className: "hamburger", onClick: () => {
        closeModal();
      }, children: /* @__PURE__ */ jsx(SvgCloseMenu, { className: "w-[32px] h-[32px]" }) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "line bg-black h-[1px] w-full" }),
    /* @__PURE__ */ jsx("div", { className: "location-wrapper nav-location-wrapper flex flex-col flex-0", children: /* @__PURE__ */ jsxs("div", { className: "location", children: [
      /* @__PURE__ */ jsx("div", { className: "inner container mx-auto py-4", children: /* @__PURE__ */ jsx(NavLocation, {}) }),
      /* @__PURE__ */ jsx("div", { className: "", children: /* @__PURE__ */ jsx("div", { className: "line bg-black h-[1px] w-full" }) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "nav-category-wrapper flex flex-col flex-1 overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "inner container mx-auto py-4 flex-1 flex flex-col overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "menus-wrapper flex-1 overflow-y-auto", children: (_b = (_a = taxonomies.categories) == null ? void 0 : _a.filter((cat) => {
      var _a2;
      return (_a2 = headerMenus == null ? void 0 : headerMenus.map((ca) => ca.linkCategory)) == null ? void 0 : _a2.includes(cat.id);
    })) == null ? void 0 : _b.map((menu, i) => {
      var _a2;
      return /* @__PURE__ */ jsx("div", { className: "menu mb-4", children: /* @__PURE__ */ jsx(NavLink, { relative: "path", onMouseLeave: onMouseLeaveHandler, onMouseEnter: onMouseEnterHandler, className: `menu-link text-front-body-big flex-1 text-nowrap uppercase text-black${menu.slug_title == ((_a2 = actualRoute == null ? void 0 : actualRoute.category) == null ? void 0 : _a2.slug_title) ? " is-active" : ""}`, to: generateTo(menu.slug_title), children: menu.title }, i) }, `mobile-${menu.id}`);
    }) }) }) }),
    /* @__PURE__ */ jsx("div", { className: "outer bg-front-red flex-0", children: /* @__PURE__ */ jsx("div", { className: "py-4", children: /* @__PURE__ */ jsxs("div", { className: "item flex justify-center gap-x-6", children: [
      /* @__PURE__ */ jsx(Link, { to: "#", target: "_blank", children: /* @__PURE__ */ jsx(SvgFacebook, { className: "w-[24px] h-[24px]" }) }),
      /* @__PURE__ */ jsx(Link, { to: "#", target: "_blank", children: /* @__PURE__ */ jsx(SvgInstagram, { className: "w-[24px] h-[24px]" }) }),
      /* @__PURE__ */ jsx(Link, { to: "#", target: "_blank", children: /* @__PURE__ */ jsx(SvgLinkedin, { className: "w-[24px] h-[24px]" }) })
    ] }) }) })
  ] }) });
};
const DESIRED_HEADER_MENUS = [
  { slug: "events", label: "Events" },
  { slug: "deals", label: "Deals" },
  { slug: "featured", label: "Featured" },
  { slug: "ultimate-guide", label: "Ultimate Guide" },
  { slug: "health-wellness", label: "Health & Wellness" },
  { slug: "directory", label: "Directory" },
  { slug: "nature-adventure", label: "Nature Adventure" }
];
const MenuNav = ({ menu, menus }) => {
  const { taxonomies } = useTaxonomies();
  const { actualRoute } = useRoute();
  const generateTo = (url, route) => {
    var _a;
    if (route == null ? void 0 : route.article) {
      return `/${(_a = route.country) == null ? void 0 : _a.slug}/${url}`;
    }
    return `${route.country ? `/${route.country.slug}` : ""}${route.city ? `/${route.city.slug}` : ""}${route.region ? `/${route.region.slug}` : ""}/${url}`;
  };
  const isActive = () => {
    var _a, _b, _c, _d;
    if (menu.id == ((_a = actualRoute.category) == null ? void 0 : _a.id)) return true;
    if (((_b = actualRoute.category) == null ? void 0 : _b.id_parent) && !menus.find((men) => {
      var _a2;
      return ((_a2 = actualRoute.category) == null ? void 0 : _a2.id) == men.id;
    })) {
      return ((_d = (_c = taxonomies.categories) == null ? void 0 : _c.find((cat) => {
        var _a2;
        return ((_a2 = actualRoute.category) == null ? void 0 : _a2.id_parent) == cat.id;
      })) == null ? void 0 : _d.id) == menu.id;
    }
    return false;
  };
  return /* @__PURE__ */ jsx(
    NavLink$1,
    {
      relative: "route",
      className: `menu-link text-front-body-big text-nowrap uppercase ${isActive() ? "is-active" : ""}`,
      to: generateTo(menu.slug_title, actualRoute),
      children: menu.title
    },
    menu.id
  );
};
const Header = () => {
  const { initialData } = useHeaderContent();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [headerMenus, setHeaderMenus] = useState((initialData == null ? void 0 : initialData.header) ?? []);
  const [areaSearch, setAreaSearch] = useState("");
  const { taxonomies } = useTaxonomies();
  const { actualRoute } = useRoute();
  const navigate = useNavigate$1();
  const forcedMenuCategories = useMemo(() => {
    const categories = taxonomies.categories ?? [];
    return DESIRED_HEADER_MENUS.map((item, index) => {
      const found = categories.find((cat) => cat.slug_title === item.slug);
      if (found) return found;
      return {
        id: -(index + 1),
        title: item.label,
        slug_title: item.slug
      };
    });
  }, [taxonomies.categories]);
  useEffect(() => {
    if (!headerMenus || headerMenus.length === 0) {
      (async () => {
        var _a, _b, _c, _d;
        try {
          const getTemplate = await getTemplateByUrl("/header");
          if ((getTemplate == null ? void 0 : getTemplate.data) && getTemplate.status_code == 200) {
            const jsonData = JSON.parse(getTemplate.data.content);
            setHeaderMenus(jsonData);
          } else {
            const fallbackMenus = ((_b = (_a = taxonomies.categories) == null ? void 0 : _a.filter((cat) => !cat.id_parent)) == null ? void 0 : _b.map((cat) => ({
              label: cat.title,
              url: cat.slug_title,
              linkCategory: cat.id
            }))) ?? [];
            setHeaderMenus(fallbackMenus);
          }
        } catch (e) {
          console.log("Error fetching header template:", e);
          const fallbackMenus = ((_d = (_c = taxonomies.categories) == null ? void 0 : _c.filter((cat) => !cat.id_parent)) == null ? void 0 : _d.map((cat) => ({
            label: cat.title,
            url: cat.slug_title,
            linkCategory: cat.id
          }))) ?? [];
          setHeaderMenus(fallbackMenus);
        }
      })();
    }
  }, [taxonomies.categories]);
  useEffect(() => {
    setIsModalOpen(false);
  }, [actualRoute]);
  const toNav = () => {
    return `/${(actualRoute == null ? void 0 : actualRoute.country) ? actualRoute.country.slug : ""}${(actualRoute == null ? void 0 : actualRoute.city) ? `/${actualRoute.city.slug}` : ""}${(actualRoute == null ? void 0 : actualRoute.region) ? `/${actualRoute.region.slug}` : ""}`;
  };
  const baliAreas = useMemo(() => {
    const taxonomyAreas = (taxonomies.countries ?? []).filter((country) => country.id !== 999 && isBaliAreaSlug(country.slug));
    if (taxonomyAreas.length > 0) return taxonomyAreas;
    return BALI_AREA_OPTIONS.map((area, index) => ({
      id: -(index + 1),
      name: area.name,
      slug: area.slug
    }));
  }, [taxonomies.countries]);
  const areaSearchSubmitHandler = (e) => {
    e.preventDefault();
    const normalized = areaSearch.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const fallbackArea = baliAreas[0];
    if (!normalized) {
      if (fallbackArea) navigate(`/${fallbackArea.slug}`);
      return;
    }
    const exact = baliAreas.find((area) => area.slug.toLowerCase() === normalized || area.name.toLowerCase() === areaSearch.trim().toLowerCase());
    const startsWith = baliAreas.find(
      (area) => area.slug.toLowerCase().startsWith(normalized) || area.name.toLowerCase().startsWith(areaSearch.trim().toLowerCase())
    );
    const partial = baliAreas.find(
      (area) => area.slug.toLowerCase().includes(normalized) || area.name.toLowerCase().includes(areaSearch.trim().toLowerCase())
    );
    const target = exact ?? startsWith ?? partial ?? fallbackArea;
    if (target) navigate(`/${target.slug}`);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("header", { className: "relative top-0 left-0 right-0 z-[100] bg-white", role: "banner", children: [
      /* @__PURE__ */ jsxs("div", { className: "container mx-auto py-5 flex justify-between items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "logo-wrapper w-max flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(NavLogo, { url: "/logo-header", to: toNav() }),
          /* @__PURE__ */ jsx("span", { className: "hidden md:block text-front-body-big text-front-red uppercase tracking-[0.08em]", children: "essentialbali" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "hamburger md:hidden block", onClick: () => setIsModalOpen(true), children: /* @__PURE__ */ jsx(SvgHamburger, { className: "w-[32px] h-[32px]" }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "line bg-black h-[1px] w-full" }),
      /* @__PURE__ */ jsxs("div", { className: "container mx-auto py-4 hidden md:flex items-center gap-4 area-nav-tools", children: [
        /* @__PURE__ */ jsx("div", { className: "min-w-[250px]", children: /* @__PURE__ */ jsx(DropDownCountry, {}) }),
        /* @__PURE__ */ jsxs("form", { onSubmit: areaSearchSubmitHandler, className: "area-search-wrapper flex-1 flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              list: "bali-areas-list",
              value: areaSearch,
              onChange: (event) => setAreaSearch(event.target.value),
              className: "w-full border border-[#e5d8d8] px-4 py-3 text-front-body",
              placeholder: "Type a Bali area"
            }
          ),
          /* @__PURE__ */ jsx("datalist", { id: "bali-areas-list", children: baliAreas.map((area) => /* @__PURE__ */ jsx("option", { value: area.name }, `area-option-${area.slug}`)) }),
          /* @__PURE__ */ jsx("button", { type: "submit", className: "bg-front-red text-white uppercase px-5 py-3 text-front-small font-semibold", children: "Go" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "line bg-black h-[1px] w-full" }),
      /* @__PURE__ */ jsx("div", { className: "container mx-auto py-4 hidden md:block", children: /* @__PURE__ */ jsx("nav", { className: "menus-wrapper flex flex-wrap items-center gap-x-6 gap-y-3", "aria-label": "Categories", children: forcedMenuCategories.map((menu) => /* @__PURE__ */ jsx(MenuNav, { menu, menus: forcedMenuCategories }, `header-menu-${menu.slug_title}`)) }) })
    ] }),
    /* @__PURE__ */ jsx(MobileMenu, { isModalOpen, closeModal: () => setIsModalOpen(false) })
  ] });
};
const Footer = () => {
  var _a, _b;
  const [visitorCount, setVisitorCount] = useState(7127);
  const [userLocation, setUserLocation] = useState("Bali Area");
  const [userTime, setUserTime] = useState("");
  const { taxonomies } = useTaxonomies();
  const navigate = useNavigate();
  const filteredCountries = (_a = { ...taxonomies }.countries) == null ? void 0 : _a.filter((coun) => coun.id != 999 && isBaliAreaSlug(coun.slug));
  const filteredTax = { ...taxonomies, countries: filteredCountries };
  const exploreOptions = ((_b = filteredTax == null ? void 0 : filteredTax.countries) == null ? void 0 : _b.map((country) => ({ value: country.slug, label: country.name }))) ?? [];
  useEffect(() => {
    var _a2;
    if (typeof window === "undefined") return;
    const storageKey = "essentialbali_visitor_count";
    const raw = window.localStorage.getItem(storageKey);
    const parsed = Number.parseInt(raw || "", 10);
    const nextCount = Number.isFinite(parsed) ? parsed + 1 : 7127;
    window.localStorage.setItem(storageKey, String(nextCount));
    setVisitorCount(nextCount);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const city = ((_a2 = timezone.split("/").pop()) == null ? void 0 : _a2.replace(/_/g, " ")) || "Bali Area";
    let region = "";
    const language = navigator.language || "en-US";
    const countryCode = language.split("-")[1];
    if (countryCode && typeof Intl.DisplayNames !== "undefined") {
      const regionNames = new Intl.DisplayNames([language], { type: "region" });
      region = regionNames.of(countryCode) || "";
    }
    const locationLabel = [city, region].filter(Boolean).join(", ");
    setUserLocation(locationLabel || "Bali Area");
    const tick = () => {
      const now = /* @__PURE__ */ new Date();
      setUserTime(
        now.toLocaleString(language, {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        })
      );
    };
    tick();
    const timer = window.setInterval(tick, 1e3);
    return () => window.clearInterval(timer);
  }, []);
  return /* @__PURE__ */ jsxs("footer", { className: "footer", children: [
    /* @__PURE__ */ jsx("div", { className: "container pt-6 pb-2 text-center", children: /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        className: "inline-flex items-center gap-2 border border-front-red text-front-red px-4 py-2 uppercase text-front-small font-semibold",
        onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
        children: "Back To Top"
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "container py-12", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 md:gap-x-16 gap-y-10", children: [
      /* @__PURE__ */ jsx("div", { className: "col-span-12 mb-8", children: /* @__PURE__ */ jsx("div", { className: "logo-wrapper max-w", children: /* @__PURE__ */ jsx(NavLogo, { url: "/logo-header", to: "/" }) }) }),
      /* @__PURE__ */ jsx("div", { className: "md:col-span-6 col-span-12", children: /* @__PURE__ */ jsxs("div", { className: "text-wrapper", children: [
        /* @__PURE__ */ jsx("p", { className: "text-front-body-big mb-8", children: "Welcome to essentialbali, your practical guide to discovering Bali area by area. We help travelers, expats, and locals find where to stay, eat, explore, and experience the island with confidence." }),
        /* @__PURE__ */ jsxs("p", { className: "text-front-body-big mb-8", children: [
          "essentialbali Editorial Desk",
          /* @__PURE__ */ jsx("br", {}),
          "Bali"
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-front-body-big", children: "Email. info@essentialbali.com" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-3 col-span-12", children: [
        /* @__PURE__ */ jsx("div", { className: "title-wrapper mb-2.5", children: /* @__PURE__ */ jsx("p", { className: "font-serif text-front-body-big", children: "Website Links" }) }),
        /* @__PURE__ */ jsxs("div", { className: "links-wrapper", children: [
          /* @__PURE__ */ jsx("div", { className: "link mb-2", children: /* @__PURE__ */ jsx(Link, { to: "/privacy-policy", className: "text-front-body-big", children: "Privacy Policy" }) }),
          /* @__PURE__ */ jsx("div", { className: "link", children: /* @__PURE__ */ jsx(Link, { to: "/privacy-policy", className: "text-front-body-big", children: "Term & Conditions" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-3 col-span-12", children: [
        /* @__PURE__ */ jsx("div", { className: "title-wrapper mb-2.5", children: /* @__PURE__ */ jsx("p", { className: "font-serif text-front-body-big", children: "Explore" }) }),
        /* @__PURE__ */ jsx("div", { className: "dropdown-country-wrapper max-w-[260px]", children: /* @__PURE__ */ jsx(
          SelectNav,
          {
            options: exploreOptions,
            defaultLabel: "Select Bali Area",
            onChange: (slug) => {
              if (!slug) return;
              navigate(`/${slug}`);
            },
            classNames: {
              singleValue: "dropdown-country-nav dropdown-country-input text-theme-front-red md:w-[260px] w-[190px]",
              option: "dropdown-country-nav dropdown-country-option text-theme-front-red"
            }
          }
        ) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "outer py-5 bg-front-red", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
        /* @__PURE__ */ jsx("div", { className: "item text-front-small text-white", children: "© 2026 - essentialbali" }),
        /* @__PURE__ */ jsxs("div", { className: "item flex gap-x-4", children: [
          /* @__PURE__ */ jsx(Link, { to: "#", target: "_blank", children: /* @__PURE__ */ jsx(SvgFacebook, {}) }),
          /* @__PURE__ */ jsx(Link, { to: "#", target: "_blank", children: /* @__PURE__ */ jsx(SvgInstagram, {}) }),
          /* @__PURE__ */ jsx(Link, { to: "#", target: "_blank", children: /* @__PURE__ */ jsx(SvgLinkedin, {}) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row md:justify-between md:items-center gap-y-2 mt-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "text-front-small text-white", children: [
          "Visitor Count: ",
          visitorCount
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-front-small text-white md:text-right", children: [
          "Location: ",
          userLocation,
          " | Time: ",
          userTime
        ] })
      ] })
    ] }) })
  ] });
};
const FrontLayout = () => {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Header, {}),
    /* @__PURE__ */ jsx(NotificationProvider, { children: /* @__PURE__ */ jsx(Outlet, {}) }),
    /* @__PURE__ */ jsx(Footer, {})
  ] });
};
export {
  FrontLayout as default
};
