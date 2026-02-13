import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { useSearchParams, Link } from "react-router";
import { b as getArticleByFields } from "./article.service-DlhMD6VX.js";
import { u as useRoute, c as useTaxonomies, J as useTime, K as getCategoryWithFields, p as pkg } from "./TimeContext-B5j8j_GZ.js";
import { I as Image } from "./Image-Dgi2d_09.js";
import { f as formatPublished } from "./format-ChXytroW.js";
import { g as generatePagination } from "./pagination-DggO-1UD.js";
import { A as Advertisement } from "./Advertisement-CxJIGt1g.js";
import { N as Newsletter } from "./Newsletter-BG-n68FY.js";
import { u as useArticle } from "./useArticle-m4fjTi_P.js";
import { DateRangePicker } from "rsuite";
/* empty css               */
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "gsap";
import "@gsap/react";
import "react-router-dom";
import "date-fns";
import "./Button-CxQtGc7t.js";
import "./newsletter.service-BbHT4ENG.js";
const { Helmet } = pkg;
const RenderPages = ({ page, onClick, currentPage }) => {
  return /* @__PURE__ */ jsx("div", { className: `px-4 py-2 font-medium ${typeof page == "string" ? "" : "cursor-pointer"} ${currentPage == page ? "text-front-red" : ""}`, onClick: () => {
    if (typeof page == "string" || typeof page == "object") return;
    onClick(page);
  }, children: page });
};
const RenderPagination = ({ page, currentPage, onClick }) => {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "prev-button cursor-pointer", onClick: () => {
      onClick(currentPage - 1);
    }, children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "8", height: "12", viewBox: "0 0 8 12", fill: "none", style: { rotate: "180deg" }, children: /* @__PURE__ */ jsx("path", { d: "M0.589844 10.59L5.16984 6L0.589844 1.41L1.99984 0L7.99984 6L1.99984 12L0.589844 10.59Z", fill: "black" }) }) }),
    typeof page == "object" && page.map((pag) => /* @__PURE__ */ jsx(RenderPages, { page: pag, currentPage, onClick })),
    /* @__PURE__ */ jsx("div", { className: "next-button cursor-pointer", onClick: () => {
      onClick(currentPage + 1);
    }, children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "8", height: "12", viewBox: "0 0 8 12", fill: "none", children: /* @__PURE__ */ jsx("path", { d: "M0.589844 10.59L5.16984 6L0.589844 1.41L1.99984 0L7.99984 6L1.99984 12L0.589844 10.59Z", fill: "black" }) }) })
  ] });
};
const ArticleItem = ({ article, tag }) => {
  const { getPermalink, getFeaturedImageUrl } = useArticle();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "image-wrapper mb-5", children: /* @__PURE__ */ jsx(Image, { url: getFeaturedImageUrl(article), ratio: "100%", link: getPermalink(article) }) }),
    article.tags && /* @__PURE__ */ jsx("div", { className: "tag-wrapper mb-2 text-front-red", children: tag == null ? void 0 : tag.name }),
    /* @__PURE__ */ jsx("div", { className: "title-wrapper mb-2", children: /* @__PURE__ */ jsx(Link, { to: getPermalink(article), children: /* @__PURE__ */ jsx("p", { className: "text-front-subtitle font-serif", children: article.title }) }) }),
    /* @__PURE__ */ jsx("div", { className: "subtitle-wrapper mb-5", children: /* @__PURE__ */ jsx("p", { className: "text-front-small text-front-soft-grey leading-normal", children: article.sub_title }) }),
    /* @__PURE__ */ jsxs("div", { className: "date-wrapper flex gap-x-2", children: [
      /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "15", height: "14", viewBox: "0 0 15 14", fill: "none", children: [
        /* @__PURE__ */ jsx("path", { d: "M1.125 4.14229C1.125 3.17103 1.91236 2.38367 2.88362 2.38367H12.1164C13.0877 2.38367 13.875 3.17103 13.875 4.14229V11.6164C13.875 12.5877 13.0877 13.375 12.1164 13.375H2.88362C1.91236 13.375 1.125 12.5877 1.125 11.6164V4.14229Z", stroke: "#7F7F7F", "stroke-width": "0.9", "stroke-linecap": "round", "stroke-linejoin": "round" }),
        /* @__PURE__ */ jsx("path", { d: "M3.98267 0.624878V3.70246", stroke: "#7F7F7F", strokeWidth: "0.9", strokeLinecap: "round", strokeLinejoin: "round" }),
        /* @__PURE__ */ jsx("path", { d: "M11.0173 0.624878V3.70246", stroke: "#7F7F7F", strokeWidth: "0.9", strokeLinecap: "round", strokeLinejoin: "round" }),
        /* @__PURE__ */ jsx("path", { d: "M3.76294 5.90027H11.2371", stroke: "#7F7F7F", strokeWidth: "0.9", strokeLinecap: "round", strokeLinejoin: "round" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-front-small text-[#A9A9A9]", children: formatPublished(article.updatedAt) })
    ] })
  ] });
};
const getFormatDate = (date) => {
  return date.toISOString().split("T")[0];
};
const getThisWeek = (date) => {
  const today = new Date(date);
  const day = today.getDay() || 7;
  const start = new Date(today);
  const end = new Date(today);
  start.setDate(today.getDate() - (day - 1));
  end.setDate(today.getDate() + (7 - day));
  return [getFormatDate(start), getFormatDate(end)];
};
const getThisMonth = (date) => {
  const today = new Date(date);
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return [getFormatDate(start), getFormatDate(end)];
};
const determineDate = (date, currentDate) => {
  if (!date || !currentDate) return null;
  const today = new Date(currentDate);
  let dateFilter = [null, null];
  if (date == "today") {
    dateFilter[0] = getFormatDate(today);
    dateFilter[1] = getFormatDate(today);
  }
  if (date == "week") {
    dateFilter = getThisWeek(currentDate);
  }
  if (date == "month") {
    dateFilter = getThisMonth(currentDate);
  }
  if (typeof date == "object") {
    dateFilter[0] = date[0];
    dateFilter[1] = date[1] ?? null;
  }
  return dateFilter;
};
const RenderArticle = ({ articles, tags }) => {
  if (!(articles == null ? void 0 : articles.length)) return /* @__PURE__ */ jsx(Fragment, { children: "Article not found" });
  return /* @__PURE__ */ jsx(Fragment, { children: articles == null ? void 0 : articles.map((article, i) => {
    return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { className: "md:col-span-4 col-span-12", children: /* @__PURE__ */ jsx(ArticleItem, { article, index: i, tag: tags == null ? void 0 : tags.find((tag) => tag.id == ((article == null ? void 0 : article.tags) ? article.tags[0] : 0)) }) }) });
  }) });
};
const Deals = () => {
  var _a;
  const { actualRoute } = useRoute();
  const { taxonomies } = useTaxonomies();
  const [content, setContent] = useState();
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();
  const [searchParams, setSearchParams] = useSearchParams();
  const [subCategories, setSubCategories] = useState();
  const [totalPages, setTotalPages] = useState(1);
  const [tags, setTags] = useState();
  const { initialData } = useTime();
  const CATEGORY_SLUG = "deals";
  const theCategory = (_a = taxonomies == null ? void 0 : taxonomies.categories) == null ? void 0 : _a.find((cat) => cat.slug_title == CATEGORY_SLUG);
  const containerRef = useRef(null);
  const paramsPage = searchParams.get("page");
  const currentPage = paramsPage ? parseInt(paramsPage) : 1;
  const paramsCat = searchParams.get("subcategory");
  const currentCat = paramsCat ? parseInt(paramsCat) : theCategory == null ? void 0 : theCategory.id;
  const paramsDate = searchParams.get("date");
  const currentDate = paramsDate ? (paramsDate == null ? void 0 : paramsDate.split(",").length) > 1 ? paramsDate.split(",") : paramsDate : null;
  useEffect(() => {
    (async () => {
      var _a2, _b, _c, _d;
      const params = {
        metaData_start_date: null,
        metaData_end_date: null
      };
      const getDate = determineDate(currentDate, initialData);
      if (getDate && getDate[0]) {
        params.metaData_start_date = getDate[0];
      }
      if (getDate && getDate[1]) {
        params.metaData_end_date = getDate[1];
      }
      if (!params.metaData_start_date) delete params.metaData_start_date;
      if (!params.metaData_end_date) delete params.metaData_end_date;
      const getArticle = await getArticleByFields({
        id_country: ((_a2 = actualRoute == null ? void 0 : actualRoute.country) == null ? void 0 : _a2.id) ?? void 0,
        id_city: ((_b = actualRoute == null ? void 0 : actualRoute.city) == null ? void 0 : _b.id) ?? void 0,
        id_region: ((_c = actualRoute == null ? void 0 : actualRoute.region) == null ? void 0 : _c.id) ?? void 0,
        category: currentCat,
        limit: 9,
        page: currentPage,
        ...params
      });
      if (getArticle == null ? void 0 : getArticle.articles) {
        setContent(getArticle.articles);
        setTotalPages(((_d = getArticle.pagination) == null ? void 0 : _d.totalPages) ?? 1);
      } else {
        setContent([]);
        setTotalPages(1);
      }
    })();
  }, [searchParams, actualRoute]);
  useEffect(() => {
    var _a2, _b;
    window.scrollTo(0, 0);
    if ((_b = (_a2 = actualRoute.category) == null ? void 0 : _a2.tags) == null ? void 0 : _b.length) {
      setTags(actualRoute.category.tags);
    } else {
      setTags([]);
    }
  }, [actualRoute]);
  useEffect(() => {
    (async () => {
      var _a2, _b, _c;
      if (!theCategory) return;
      const getCat = await getCategoryWithFields(theCategory == null ? void 0 : theCategory.id, { id_country: (_a2 = actualRoute == null ? void 0 : actualRoute.country) == null ? void 0 : _a2.id, id_city: (_b = actualRoute == null ? void 0 : actualRoute.city) == null ? void 0 : _b.id, id_region: (_c = actualRoute == null ? void 0 : actualRoute.region) == null ? void 0 : _c.id });
      if (getCat) {
        setTitle(getCat.sub_title);
        setDescription(getCat.description);
      }
    })();
  }, [actualRoute]);
  useEffect(() => {
    var _a2;
    setSubCategories((_a2 = taxonomies.categories) == null ? void 0 : _a2.filter((cat) => {
      var _a3;
      return cat.id_parent == ((_a3 = actualRoute == null ? void 0 : actualRoute.category) == null ? void 0 : _a3.id);
    }));
    window.scrollTo(0, 0);
  }, []);
  const subCatClickHandler = (page) => {
    if (page > totalPages || page <= 0) return;
    setSearchParams(`subcategory=${page}`);
  };
  const subCategoriesRender = () => {
    if (!(subCategories == null ? void 0 : subCategories.length) || !subCategories) return;
    return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "flex mb-10 border-b border-b-[#BDBDBD]", children: [
      /* @__PURE__ */ jsx("div", { onClick: () => {
        subCatClickHandler(0);
      }, className: `px-5 py-3 cursor-pointer text-front-small ${currentCat == (theCategory == null ? void 0 : theCategory.id) ? "is-active text-front-red" : "text-[#4B4B4B]"}`, children: theCategory == null ? void 0 : theCategory.title }),
      subCategories == null ? void 0 : subCategories.map((cat) => {
        return /* @__PURE__ */ jsx("div", { onClick: () => {
          subCatClickHandler(cat.id);
        }, className: `px-5 py-3 cursor-pointer text-front-small ${`${cat.id}` == searchParams.get("subcategory") ? "is-active text-front-red" : "text-[#4B4B4B]"}`, children: cat.title });
      })
    ] }) });
  };
  const clickPagingHandler = (page) => {
    if (page > totalPages || page <= 0) return;
    setSearchParams(`page=${page}`);
  };
  const dateFilterRender = () => {
    const clickHandler = (date) => {
      if (searchParams.get("date") == date || !date) {
        setSearchParams((prev) => {
          const oldParams = new URLSearchParams(prev);
          oldParams.delete("date");
          return oldParams;
        });
        return;
      }
      setSearchParams((prev) => {
        const oldParams = new URLSearchParams(prev);
        oldParams.set("date", date);
        return oldParams;
      });
    };
    return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "flex mb-8 gap-x-6", children: [
      /* @__PURE__ */ jsx("div", { className: `button-date text-front-small px-5 py-2 rounded-full cursor-pointer ${searchParams.get("date") == "today" ? "text-[#4b4b4b] bg-[#efefef]" : "text-[#959595] bg-[#f5f5f5]"}`, onClick: () => {
        clickHandler("today");
      }, children: "Today" }),
      /* @__PURE__ */ jsx("div", { className: `button-date text-front-small px-5 py-2 rounded-full cursor-pointer ${searchParams.get("date") == "week" ? "text-[#4b4b4b] bg-[#efefef]" : "text-[#959595] bg-[#f5f5f5]"}`, onClick: () => {
        clickHandler("week");
      }, children: "This Week" }),
      /* @__PURE__ */ jsx("div", { className: `button-date text-front-small px-5 py-2 rounded-full cursor-pointer ${searchParams.get("date") == "month" ? "text-[#4b4b4b] bg-[#efefef]" : "text-[#959595] bg-[#f5f5f5]"}`, onClick: () => {
        clickHandler("month");
      }, children: "This Month" }),
      /* @__PURE__ */ jsx("div", { className: `button-date text-front-small cursor-pointer`, children: /* @__PURE__ */ jsxs("div", { className: "flex", children: [
        /* @__PURE__ */ jsx("div", { className: "text-wrapper rounded-l-full py-2 px-4 text-[#4b4b4b] bg-[#efefef]", children: "Select Date" }),
        /* @__PURE__ */ jsx(DateRangePicker, { "aria-setsize": 20, className: "deals-date-range", format: "yyyy/MM/dd", onChange: (e) => {
          clickHandler(e == null ? void 0 : e.map((dat) => getFormatDate(new Date(dat))).join(","));
        } })
      ] }) })
    ] }) });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Helmet, { children: [
      /* @__PURE__ */ jsx("title", { children: "Deals - essentialbali" }),
      /* @__PURE__ */ jsx("meta", { name: "description", content: "essentialbali is the ultimate Bali area guide for travelers, expats, and locals, featuring the best dining, events, schools, wellness, and travel in Bali" })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "py-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "container", children: [
        /* @__PURE__ */ jsx("div", { className: "ads-wrapper mb-12", children: /* @__PURE__ */ jsx(Advertisement, {}) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-12 mb-12", children: /* @__PURE__ */ jsxs("div", { className: "md:col-span-10 md:col-start-2 col-span-12", children: [
          /* @__PURE__ */ jsx("div", { className: "title-wrapper text-center mb-4", children: /* @__PURE__ */ jsx("p", { className: "font-serif text-front-hero", children: title }) }),
          /* @__PURE__ */ jsx("div", { className: "description-wrapper text-center", children: /* @__PURE__ */ jsx("p", { className: "", children: description }) })
        ] }) }),
        subCategoriesRender(),
        dateFilterRender(),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-12 gap-5", ref: containerRef, children: /* @__PURE__ */ jsx(RenderArticle, { articles: content, tags }) }),
        /* @__PURE__ */ jsx("div", { className: "pagination-wrapper flex justify-center gap-x-4 py-8 items-center", children: /* @__PURE__ */ jsx(RenderPagination, { page: generatePagination(currentPage, totalPages), currentPage, onClick: clickPagingHandler }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "newsletter-wrapper bg-front-section-grey py-8 mt-6", children: /* @__PURE__ */ jsx(Newsletter, {}) })
    ] })
  ] });
};
export {
  Deals as default
};
