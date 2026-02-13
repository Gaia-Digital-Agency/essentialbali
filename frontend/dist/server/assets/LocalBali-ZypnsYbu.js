import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { u as useRoute, c as useTaxonomies, I as useContent, L as Helmet } from "./TimeContext-B5j8j_GZ.js";
import { b as getArticleByFields } from "./article.service-DlhMD6VX.js";
import { useSearchParams, Link } from "react-router";
import { A as Advertisement } from "./Advertisement-CxJIGt1g.js";
import { I as Image } from "./Image-Dgi2d_09.js";
import { g as generatePagination } from "./pagination-DggO-1UD.js";
import { f as formatPublished } from "./format-ChXytroW.js";
import { N as Newsletter } from "./Newsletter-BG-n68FY.js";
import { u as useArticle } from "./useArticle-m4fjTi_P.js";
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
    article.tags && /* @__PURE__ */ jsx("div", { className: "tag-wrapper mb-2 text-front-red", children: (tag == null ? void 0 : tag.name) ?? "" }),
    /* @__PURE__ */ jsx("div", { className: "title-wrapper mb-5", children: /* @__PURE__ */ jsx(Link, { to: getPermalink(article), viewTransition: true, children: /* @__PURE__ */ jsx("p", { className: "text-front-subtitle font-serif", children: article.title }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "date-wrapper flex gap-x-2", children: [
      /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "15", height: "14", viewBox: "0 0 15 14", fill: "none", children: [
        /* @__PURE__ */ jsx("path", { d: "M1.125 4.14229C1.125 3.17103 1.91236 2.38367 2.88362 2.38367H12.1164C13.0877 2.38367 13.875 3.17103 13.875 4.14229V11.6164C13.875 12.5877 13.0877 13.375 12.1164 13.375H2.88362C1.91236 13.375 1.125 12.5877 1.125 11.6164V4.14229Z", stroke: "#7F7F7F", "stroke-width": "0.9", "stroke-linecap": "round", "stroke-linejoin": "round" }),
        /* @__PURE__ */ jsx("path", { d: "M3.98267 0.624878V3.70246", stroke: "#7F7F7F", "stroke-width": "0.9", "stroke-linecap": "round", "stroke-linejoin": "round" }),
        /* @__PURE__ */ jsx("path", { d: "M11.0173 0.624878V3.70246", stroke: "#7F7F7F", "stroke-width": "0.9", "stroke-linecap": "round", "stroke-linejoin": "round" }),
        /* @__PURE__ */ jsx("path", { d: "M3.76294 5.90027H11.2371", stroke: "#7F7F7F", "stroke-width": "0.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-front-small text-[#A9A9A9]", children: formatPublished(article.updatedAt) })
    ] })
  ] });
};
const LocalBali = ({ isTrending = false }) => {
  var _a, _b;
  const { actualRoute } = useRoute();
  const { taxonomies } = useTaxonomies();
  const { initialData } = useContent();
  const [content, setContent] = useState((initialData == null ? void 0 : initialData.articles) ?? []);
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();
  const [totalPages, setTotalPages] = useState(((_a = initialData == null ? void 0 : initialData.pagination) == null ? void 0 : _a.totalPages) ?? 1);
  const [isClient, setIsClient] = useState(false);
  const [tags, setTags] = useState();
  const CATEGORY_SLUGS = ["experience", "ultimate-guide", "featured"];
  const [searchParams, setSearchParams] = useSearchParams();
  const searchPage = searchParams.get("page");
  const currentPage = searchPage ? parseInt(searchPage) : 1;
  const containerRef = useRef(null);
  useEffect(() => {
    var _a2, _b2;
    if ((_b2 = (_a2 = actualRoute.category) == null ? void 0 : _a2.tags) == null ? void 0 : _b2.length) {
      setTags(actualRoute.category.tags);
    } else {
      setTags([]);
    }
  }, [actualRoute]);
  useEffect(() => {
    setIsClient(true);
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    if (!isClient) return;
    window.scrollTo(0, 0);
  }, [actualRoute, searchPage]);
  useEffect(() => {
    var _a2, _b2;
    if (!isClient) return;
    (async () => {
      var _a3, _b3, _c;
      const urlParams = new URLSearchParams();
      (_a3 = taxonomies.countries) == null ? void 0 : _a3.filter((coun) => {
        var _a4;
        return coun.id != ((_a4 = actualRoute.country) == null ? void 0 : _a4.id);
      }).forEach((coun) => {
        urlParams.append("id_country[]", `${coun.id}`);
      });
      (_b3 = taxonomies.categories) == null ? void 0 : _b3.filter((item) => CATEGORY_SLUGS.includes(item.slug_title)).forEach((cat) => {
        urlParams.append("category[]", `${cat.id}`);
      });
      urlParams.append("page", `${currentPage}`);
      urlParams.append("limit", "9");
      const getArticle = await getArticleByFields({}, urlParams);
      if (getArticle == null ? void 0 : getArticle.articles) {
        setContent(getArticle.articles);
        setTotalPages(((_c = getArticle.pagination) == null ? void 0 : _c.totalPages) ?? 1);
      } else {
        setContent([]);
      }
    })();
    const theTitle = (_a2 = actualRoute.category) == null ? void 0 : _a2.sub_title;
    const theDescription = (_b2 = actualRoute.category) == null ? void 0 : _b2.description;
    setTitle(theTitle);
    setDescription(theDescription);
  }, [actualRoute, searchPage, isClient]);
  const getTagById = (tag) => {
    return tags == null ? void 0 : tags.find((_tag) => _tag.id == tag);
  };
  const clickPagingHandler = (page) => {
    if (page > totalPages || page <= 0) return;
    setIsClient(true);
    setSearchParams((prev) => {
      const newSearchParams = new URLSearchParams(prev);
      newSearchParams.set("page", `${page}`);
      return newSearchParams;
    });
  };
  const renderArticle = () => {
    if (content.length) {
      return content.map((article) => {
        var _a2;
        let theTag;
        if ((_a2 = article == null ? void 0 : article.tags) == null ? void 0 : _a2.length) {
          theTag = article.tags[0];
        } else {
          theTag = void 0;
        }
        return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { className: "md:col-span-4 col-span-12", children: /* @__PURE__ */ jsx(ArticleItem, { article, tag: getTagById(theTag) ?? void 0 }) }) });
      });
    }
    return /* @__PURE__ */ jsx("div", { className: "col-span-12", children: "No article for this category" });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Helmet, { children: [
      /* @__PURE__ */ jsxs("title", { children: [
        isTrending ? "Trending" : "",
        ((_b = actualRoute.category) == null ? void 0 : _b.title) ?? "",
        " - essentialbali"
      ] }),
      /* @__PURE__ */ jsx("meta", { name: "description", content: "essentialbali is the ultimate Bali area guide for travelers, expats, and locals, featuring the best dining, events, schools, wellness, and travel in Bali" })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "py-12", children: [
      /* @__PURE__ */ jsxs("div", { className: "container", children: [
        /* @__PURE__ */ jsx("div", { className: "ads-wrapper mb-12", children: /* @__PURE__ */ jsx(Advertisement, {}) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-12 mb-12", children: /* @__PURE__ */ jsxs("div", { className: "md:col-span-10 md:col-start-2 col-span-12", children: [
          /* @__PURE__ */ jsx("div", { className: "title-wrapper text-center mb-4", children: /* @__PURE__ */ jsx("p", { className: "font-serif text-front-hero", children: title }) }),
          /* @__PURE__ */ jsx("div", { className: "description-wrapper text-center", children: /* @__PURE__ */ jsx("p", { className: "", children: description }) })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-12 gap-5", ref: containerRef, children: renderArticle() }),
        /* @__PURE__ */ jsx("div", { className: "pagination-wrapper flex justify-center gap-x-4 py-8 items-center", children: /* @__PURE__ */ jsx(RenderPagination, { page: generatePagination(currentPage, totalPages), currentPage, onClick: clickPagingHandler }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "newsletter-wrapper bg-front-section-grey py-8 mt-6", children: /* @__PURE__ */ jsx(Newsletter, {}) })
    ] })
  ] });
};
export {
  LocalBali as default
};
