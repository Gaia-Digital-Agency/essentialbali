import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { b as getArticleByFields } from "./article.service-DlhMD6VX.js";
import { u as useRoute, c as useTaxonomies, K as getCategoryWithFields, p as pkg } from "./TimeContext-B5j8j_GZ.js";
import { A as Advertisement } from "./Advertisement-CxJIGt1g.js";
import { I as Image } from "./Image-Dgi2d_09.js";
import { f as formatPublished } from "./format-ChXytroW.js";
import { T as TextLink } from "./TextLink-DlB-UhGi.js";
import { B as Button } from "./Button-CxQtGc7t.js";
import { N as Newsletter } from "./Newsletter-BG-n68FY.js";
import gsap from "gsap";
import { DateRangePicker, CheckboxGroup, Checkbox, Whisper, Radio, Tooltip, RangeSlider } from "rsuite";
/* empty css               */
import { useSearchParams, useLocation, Link } from "react-router";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "@gsap/react";
import "react-router-dom";
import "date-fns";
import "./newsletter.service-BbHT4ENG.js";
const { Helmet } = pkg;
const IMAGE_URL = "https://storage.googleapis.com/gda-s01-bucket/essentialbali";
const generateImageUrl = (image, id) => {
  if (image) {
    return `${IMAGE_URL}/${image}`;
  }
  return `https://picsum.photos/id/${id * 10}/1920/1080`;
};
const ArticleCard = ({ article }) => {
  var _a;
  const { getCountryById, getCategoryById } = useTaxonomies();
  const generateUrl = (article2) => {
    var _a2, _b;
    return `/${(_a2 = getCountryById(article2.id_country)) == null ? void 0 : _a2.slug}/${(_b = getCategoryById(article2.category_id)) == null ? void 0 : _b.slug_title}/${article2.slug}`;
  };
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 mb-16 gap-y-12 lg:gap-x-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "lg:col-span-6 col-span-12 order-2 lg:order-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "date-wrapper mb-2 flex gap-x-4", children: [
        /* @__PURE__ */ jsx("div", { className: "item", children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "15", height: "14", viewBox: "0 0 15 14", fill: "none", children: [
          /* @__PURE__ */ jsx("path", { d: "M1.125 4.14229C1.125 3.17103 1.91236 2.38367 2.88362 2.38367H12.1164C13.0877 2.38367 13.875 3.17103 13.875 4.14229V11.6164C13.875 12.5877 13.0877 13.375 12.1164 13.375H2.88362C1.91236 13.375 1.125 12.5877 1.125 11.6164V4.14229Z", stroke: "#7F7F7F", strokeWidth: "0.9", strokeLinecap: "round", strokeLinejoin: "round" }),
          /* @__PURE__ */ jsx("path", { d: "M3.98267 0.624878V3.70246", stroke: "#7F7F7F", strokeWidth: "0.9", strokeLinecap: "round", strokeLinejoin: "round" }),
          /* @__PURE__ */ jsx("path", { d: "M11.0173 0.624878V3.70246", stroke: "#7F7F7F", strokeWidth: "0.9", strokeLinecap: "round", strokeLinejoin: "round" }),
          /* @__PURE__ */ jsx("path", { d: "M3.76294 5.90027H11.2371", stroke: "#7F7F7F", strokeWidth: "0.9", strokeLinecap: "round", strokeLinejoin: "round" })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "item", children: /* @__PURE__ */ jsx("p", { className: "text-front-small text-[#a9a9a9]", children: formatPublished((_a = article == null ? void 0 : article.meta_data) == null ? void 0 : _a.start_date) ?? "TBA" }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "title-wrapper mb-6", children: /* @__PURE__ */ jsx("p", { className: "text-front-article-title font-serif", children: article.title }) }),
      /* @__PURE__ */ jsx("div", { className: "subtitle-wrapper mb-6", children: /* @__PURE__ */ jsx("p", { children: article.sub_title }) }),
      /* @__PURE__ */ jsx("div", { className: "button-wrapper", children: /* @__PURE__ */ jsx(TextLink, { link: generateUrl(article), color: "gray", text: "READ MORE" }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "lg:col-span-6 col-span-12 order-1 lg:order-2", children: /* @__PURE__ */ jsx("div", { className: "image-wrapper", children: /* @__PURE__ */ jsx(Image, { link: generateUrl(article), url: generateImageUrl(article.featured_image_url, article.id) }) }) })
  ] }) });
};
const Events = () => {
  var _a, _b;
  const [content, setContent] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5e3);
  const [filterDays, setFilterDays] = useState([]);
  const [time, setTime] = useState(void 0);
  const [filterDate, setFilterDate] = useState([]);
  const { actualRoute, getLocationRouteUrl } = useRoute();
  const { taxonomies } = useTaxonomies();
  const [searchParams, setSearchParams] = useSearchParams();
  const [availableSubCat, setAvailableSubCat] = useState();
  const CATEGORY_SLUG = "events";
  const parentCat = (_a = taxonomies.categories) == null ? void 0 : _a.find((cat) => CATEGORY_SLUG == cat.slug_title);
  const theCategory = actualRoute.category;
  const filterWrapperRef = useRef(null);
  const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const contentWrapperRef = useRef(null);
  const { search } = useLocation();
  useEffect(() => {
    var _a2;
    const contentWrapperEl = contentWrapperRef.current;
    if (contentWrapperEl) {
      window.scrollTo(0, contentWrapperEl.offsetTop);
    }
    const sub = (_a2 = taxonomies.categories) == null ? void 0 : _a2.filter((cat) => cat.id_parent == (parentCat == null ? void 0 : parentCat.id));
    setAvailableSubCat(sub);
  }, [actualRoute]);
  useEffect(() => {
    const minPriceParams = searchParams.get("minprice");
    if (minPriceParams) {
      setMinPrice(Number(minPriceParams));
      setMinPrice(0);
    }
    const maxPriceParams = searchParams.get("maxprice");
    if (maxPriceParams) {
      setMaxPrice(Number(maxPriceParams));
    } else {
      setMaxPrice(5e3);
    }
    const timeParams = searchParams.get("time");
    if (timeParams) {
      setTime(timeParams);
    } else {
      setTime(void 0);
    }
    searchParams.get("date");
    const dayParams = searchParams.getAll("day[]");
    if (dayParams) {
      setFilterDays(dayParams);
    } else {
      setFilterDays([]);
    }
  }, [searchParams, actualRoute]);
  useEffect(() => {
    (async () => {
      var _a2, _b2, _c, _d, _e, _f, _g;
      const params = new URLSearchParams();
      const minPriceParams = searchParams.get("minprice");
      const maxPriceParams = searchParams.get("maxprice");
      const timeParams = searchParams.get("time");
      const dateParams = searchParams.get("date");
      const dayParams = searchParams.getAll("day[]");
      const subParams = searchParams.get("subcat");
      if (minPriceParams) params.append("metaData_price[]", minPriceParams);
      if (maxPriceParams) params.append("metaData_price[]", maxPriceParams);
      if (dateParams) params.append("metaData_date", dateParams);
      if (subParams) {
        params.append("category", `${subParams}`);
      } else {
        params.append("category", `${theCategory == null ? void 0 : theCategory.id}`);
      }
      if (timeParams) {
        switch (timeParams) {
          case "morning":
            params.append("metaData_start_time", "06:00");
            params.append("metaData_end_time", "12:00");
            break;
          case "afternoon":
            params.append("metaData_start_time", "12:00");
            params.append("metaData_end_time", "18:00");
            break;
          case "night":
            params.append("metaData_start_time", "18:00");
            params.append("metaData_end_time", "24:00");
            break;
        }
      }
      if (dayParams) {
        dayParams.forEach((day) => {
          params.append("metaData_multi_day[]", day);
        });
      }
      const getArticle = await getArticleByFields({
        id_country: (_a2 = actualRoute.country) == null ? void 0 : _a2.id,
        id_city: (_b2 = actualRoute.city) == null ? void 0 : _b2.id,
        id_region: (_c = actualRoute.region) == null ? void 0 : _c.id,
        // category: theCategory?.id,
        limit: 4,
        page: currentPage
      }, params);
      if (getArticle == null ? void 0 : getArticle.articles) {
        if (((_d = getArticle == null ? void 0 : getArticle.pagination) == null ? void 0 : _d.page) == 1) {
          setContent(getArticle.articles);
        } else {
          setContent((prev) => {
            const newUniqueArticles = getArticle.articles.filter(
              (newArticle2) => !prev.some((prevArticle) => prevArticle.id === newArticle2.id)
            );
            const newArticle = newUniqueArticles.map((article) => ({ ...article }));
            return [...prev, ...newArticle];
          });
        }
      } else {
        setContent([]);
      }
      if (getArticle == null ? void 0 : getArticle.pagination) {
        setTotalPage(getArticle.pagination.totalPages);
      } else {
        setTotalPage(1);
      }
      if (theCategory) {
        const getCategory = await getCategoryWithFields(theCategory == null ? void 0 : theCategory.id, {
          id_country: (_e = actualRoute.country) == null ? void 0 : _e.id,
          id_city: (_f = actualRoute.city) == null ? void 0 : _f.id,
          id_region: (_g = actualRoute.region) == null ? void 0 : _g.id
        });
        if (getCategory) {
          setTitle(getCategory.sub_title);
          setDescription(getCategory.description);
        }
      }
    })();
  }, [currentPage, actualRoute, searchParams]);
  const pageClickHandler = () => {
    setCurrentPage(currentPage + 1);
  };
  const renderButton = () => {
    if (totalPage <= currentPage) return;
    return /* @__PURE__ */ jsx(Button, { text: "VIEW MORE", onClick: pageClickHandler });
  };
  useEffect(() => {
    const wrapperEl = filterWrapperRef.current;
    if (!wrapperEl) return;
    const accordionClickHandler = (e) => {
      const _box = e.currentTarget;
      const box = _box.parentNode;
      const content2 = box.querySelector(".content-wrapper");
      if (!content2) return;
      const isOpen = box.classList.contains("open");
      if (isOpen) {
        gsap.to(content2, {
          height: "0"
        });
        box.classList.remove("open");
      } else {
        gsap.to(content2, {
          height: "auto"
        });
        box.classList.add("open");
      }
    };
    const boxes = wrapperEl.querySelectorAll(".box");
    boxes.forEach((box) => {
      var _a2;
      const content2 = box.querySelector(".content-wrapper");
      if (content2) gsap.set(content2, { height: 0 });
      box.classList.remove("open");
      (_a2 = box.querySelector(".title")) == null ? void 0 : _a2.addEventListener("click", accordionClickHandler);
    });
    return () => {
      boxes.forEach((box) => {
        var _a2;
        (_a2 = box.querySelector(".title")) == null ? void 0 : _a2.removeEventListener("click", accordionClickHandler);
      });
    };
  }, []);
  const formatPrice = () => {
    if (minPrice == maxPrice) {
      return /* @__PURE__ */ jsx(Fragment, { children: minPrice == 0 ? "Free" : `$${minPrice}` });
    }
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      `${minPrice == 0 ? "Free" : `$${minPrice}`}`,
      " - $",
      `${maxPrice}`
    ] });
  };
  const applyFilterDate = () => {
    if (filterDate) {
      setSearchParams((prev) => {
        const url = new URLSearchParams(prev);
        url.set("dates", filterDate[0] + "," + filterDate[1]);
        return url;
      });
    } else {
      setSearchParams((prev) => {
        const url = new URLSearchParams(prev);
        url.delete("date");
        return url;
      });
    }
    if (filterDays) {
      setSearchParams((prev) => {
        const url = new URLSearchParams(prev);
        url.delete("day[]");
        filterDays.forEach((day) => {
          url.append("day[]", day);
        });
        return url;
      });
    } else {
      setSearchParams((prev) => {
        const url = new URLSearchParams(prev);
        url.delete("day[]");
        return url;
      });
    }
  };
  const applyTimeFilter = (time2) => {
    if (time2) {
      setSearchParams((prev) => {
        const url = new URLSearchParams(prev);
        url.set("time", time2);
        return url;
      });
    } else {
      setSearchParams((prev) => {
        const url = new URLSearchParams(prev);
        url.delete("time");
        return url;
      });
    }
  };
  const applyPriceFilter = () => {
    setSearchParams((prev) => {
      const url = new URLSearchParams(prev);
      url.set("minprice", `${minPrice}`);
      url.set("maxprice", `${maxPrice}`);
      return url;
    });
  };
  const clearAllFilter = () => {
    setTime(void 0);
    setFilterDate(void 0);
    setFilterDays([]);
    setMaxPrice(5e3);
    setMinPrice(0);
    setSearchParams();
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Helmet, { children: [
      /* @__PURE__ */ jsx("title", { children: "Events - essentialbali" }),
      /* @__PURE__ */ jsx("meta", { name: "description", content: "essentialbali is the ultimate Bali area guide for travelers, expats, and locals, featuring the best dining, events, schools, wellness, and travel in Bali" })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsxs("div", { className: "container py-16", children: [
        /* @__PURE__ */ jsx(Advertisement, {}),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-12 py-12", ref: contentWrapperRef, children: /* @__PURE__ */ jsxs("div", { className: "lg:col-span-6 col-span-12 lg:col-start-4 text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "font-serif text-front-hero mb-4", children: title }),
          /* @__PURE__ */ jsx("p", { className: "text-front-body", children: description })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 lg:gap-x-20 gap-y-12 py-12", children: [
          /* @__PURE__ */ jsxs("div", { className: "lg:col-span-3 col-span-12", children: [
            /* @__PURE__ */ jsx("div", { className: "title-wrapper mb-12", children: /* @__PURE__ */ jsx("p", { className: "font-serif text-front-title", children: "Filters" }) }),
            /* @__PURE__ */ jsxs("div", { className: "filter-wrapper", ref: filterWrapperRef, children: [
              !!(availableSubCat == null ? void 0 : availableSubCat.length) && /* @__PURE__ */ jsxs("div", { className: "box py-5 cursor-pointer border-t border-[#9e9e9e]", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center title mb-4", children: [
                  /* @__PURE__ */ jsx("p", { className: "", children: "Event Category" }),
                  /* @__PURE__ */ jsx("p", { className: "text-front-subtitle", children: "+" })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "content-wrapper overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "inner py-2", children: [
                  !!parentCat && /* @__PURE__ */ jsx("div", { className: `mb-4 text-front-grey ${((_b = actualRoute.category) == null ? void 0 : _b.id) == parentCat.id ? "text-front-red" : ""}`, children: /* @__PURE__ */ jsxs(Link, { to: getLocationRouteUrl() + "/" + parentCat.slug_title + search, children: [
                    "All ",
                    parentCat.title
                  ] }) }),
                  availableSubCat.map((cat) => {
                    var _a2;
                    return /* @__PURE__ */ jsx("div", { className: `mb-4 text-front-grey ${((_a2 = actualRoute.category) == null ? void 0 : _a2.id) == cat.id ? "text-front-red" : ""}`, children: /* @__PURE__ */ jsx(Link, { to: getLocationRouteUrl() + "/" + cat.slug_title + search, children: cat.title }) });
                  })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "box py-5 cursor-pointer border-t border-[#9e9e9e]", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center title", children: [
                  /* @__PURE__ */ jsx("p", { className: "", children: "Day" }),
                  /* @__PURE__ */ jsx("div", { className: "dropdown", children: /* @__PURE__ */ jsx("p", { className: "text-front-subtitle", children: "+" }) })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "content-wrapper overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "inner py-2", children: [
                  /* @__PURE__ */ jsx(DateRangePicker, { format: "yyyy/MM/dd", value: filterDate ? [new Date(filterDate[0]), new Date(filterDate[1])] : null, onChange: (e) => {
                    setFilterDate(e == null ? void 0 : e.map((date) => date.toISOString().split("T")[0]));
                  } }),
                  /* @__PURE__ */ jsx(CheckboxGroup, { value: filterDays, onChange: (value) => setFilterDays([...value]), children: DAYS.map((day) => /* @__PURE__ */ jsx(Checkbox, { value: day, className: "capitalize", children: day })) }),
                  /* @__PURE__ */ jsx(Button, { text: "Apply filter", onClick: applyFilterDate })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "box py-5 cursor-pointer border-t border-[#9e9e9e]", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center title", children: [
                  /* @__PURE__ */ jsx("p", { className: "", children: "Time" }),
                  /* @__PURE__ */ jsx("p", { className: "text-front-subtitle", children: "+" })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "content-wrapper overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "inner py-2", children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex flex-col", children: [
                    /* @__PURE__ */ jsx(Whisper, { followCursor: true, speaker: /* @__PURE__ */ jsx(Tooltip, { children: "06.00-12.00" }), children: /* @__PURE__ */ jsx(Radio, { onClick: () => {
                      setTime("morning");
                      applyTimeFilter("morning");
                    }, checked: time == "morning", value: "morning", children: "Morning" }) }),
                    /* @__PURE__ */ jsx(Whisper, { followCursor: true, speaker: /* @__PURE__ */ jsx(Tooltip, { children: "12.00-18.00" }), children: /* @__PURE__ */ jsx(Radio, { onClick: () => {
                      setTime("afternoon");
                      applyTimeFilter("afternoon");
                    }, checked: time == "afternoon", value: "afternoon", children: "Afternoon" }) }),
                    /* @__PURE__ */ jsx(Whisper, { followCursor: true, speaker: /* @__PURE__ */ jsx(Tooltip, { children: "18.00-24.00" }), children: /* @__PURE__ */ jsx(Radio, { onClick: () => {
                      setTime("night");
                      applyTimeFilter("night");
                    }, checked: time == "night", value: "night", children: "Night" }) })
                  ] }),
                  /* @__PURE__ */ jsx(Button, { text: "Clear filter", onClick: () => {
                    setTime(void 0);
                    applyTimeFilter();
                  } })
                ] }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "box py-5 cursor-pointer border-t border-[#9e9e9e]", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center title", children: [
                  /* @__PURE__ */ jsx("p", { className: "", children: "Price" }),
                  /* @__PURE__ */ jsx("p", { className: "text-front-subtitle", children: "+" })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "content-wrapper overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "inner px-2 py-4", children: [
                  /* @__PURE__ */ jsx(RangeSlider, { min: 0, max: 5e3, value: [minPrice, maxPrice], onChange: (e) => {
                    setMinPrice(e[0]);
                    setMaxPrice(e[1]);
                  } }),
                  /* @__PURE__ */ jsxs("div", { className: "confirm-box pt-6", children: [
                    /* @__PURE__ */ jsx("p", { className: "mb-4", children: formatPrice() }),
                    /* @__PURE__ */ jsx(Button, { text: "Apply filter", onClick: applyPriceFilter })
                  ] })
                ] }) })
              ] }),
              /* @__PURE__ */ jsx(Button, { text: "Clear all filters", onClick: clearAllFilter })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "lg:col-span-9 col-span-12", children: [
            content.map((article) => /* @__PURE__ */ jsx(ArticleCard, { article })),
            !content.length && /* @__PURE__ */ jsx(Fragment, { children: "Article in this category is not found" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "button-wrapper flex justify-center gap-x-6", children: [
          renderButton(),
          /* @__PURE__ */ jsx(Button, { text: "SUBMIT YOUR EVENT", borderOnly: true })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "newsletter-wrapper bg-front-section-grey py-8 mt-6", children: /* @__PURE__ */ jsx(Newsletter, {}) })
    ] })
  ] });
};
export {
  Events as default
};
