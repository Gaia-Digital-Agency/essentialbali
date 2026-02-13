import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { A as Advertisement } from "./Advertisement-CxJIGt1g.js";
import { u as useArticle } from "./useArticle-m4fjTi_P.js";
import { I as Image } from "./Image-Dgi2d_09.js";
import { T as TextLink } from "./TextLink-DlB-UhGi.js";
import { useSearchParams } from "react-router";
import { e as getArticleByKeyword } from "./article.service-DlhMD6VX.js";
import { B as Button } from "./Button-CxQtGc7t.js";
import { I as useContent, u as useRoute, L as Helmet } from "./TimeContext-B5j8j_GZ.js";
import "gsap";
import "@gsap/react";
import "react-router-dom";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
const ArticleCard = ({ article }) => {
  const { getPermalink, getFeaturedImageUrl } = useArticle();
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 mb-16 gap-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "md:col-span-6 col-span-12 order-2 md:order-1", children: [
      /* @__PURE__ */ jsx("div", { className: "title-wrapper mb-6", children: /* @__PURE__ */ jsx("p", { className: "text-front-article-title font-serif", children: article.title }) }),
      /* @__PURE__ */ jsx("div", { className: "subtitle-wrapper mb-6", children: /* @__PURE__ */ jsx("p", { children: article.sub_title }) }),
      /* @__PURE__ */ jsx("div", { className: "button-wrapper", children: /* @__PURE__ */ jsx(TextLink, { link: getPermalink(article), color: "gray", text: "READ MORE" }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "md:col-span-6 col-span-12 order-1 md:order-2", children: /* @__PURE__ */ jsx("div", { className: "image-wrapper", children: /* @__PURE__ */ jsx(Image, { link: getPermalink(article), url: getFeaturedImageUrl(article) }) }) })
  ] }) });
};
const RenderArticle = ({ content, q }) => {
  if (content && content.length) {
    return /* @__PURE__ */ jsx(Fragment, { children: content == null ? void 0 : content.map((article) => /* @__PURE__ */ jsx("div", { className: "article-card mb-8", children: /* @__PURE__ */ jsx(ArticleCard, { article }) })) });
  }
  if (q && q.length < 3) {
    return /* @__PURE__ */ jsx(Fragment, { children: "Keyword search need to have at least 3 characters" });
  }
  if (q) {
    return /* @__PURE__ */ jsx(Fragment, { children: "Article not found" });
  }
};
const Search = () => {
  var _a, _b;
  const { initialData } = useContent();
  const { clientChange } = useRoute();
  const [content, setContent] = useState((initialData == null ? void 0 : initialData.articles) ?? []);
  const [totalPage, setTotalPage] = useState(((_a = initialData == null ? void 0 : initialData.pagination) == null ? void 0 : _a.totalPages) ?? 1);
  const [page, setPage] = useState(((_b = initialData == null ? void 0 : initialData.pagination) == null ? void 0 : _b.page) ?? 1);
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q");
  const LIMIT = 7;
  useEffect(() => {
    if (!q || !clientChange) return;
    (async () => {
      const articles = await getArticleByKeyword({ keyword: q, page, limit: LIMIT });
      if (articles == null ? void 0 : articles.articles) {
        setContent((prev) => {
          const newUniqueArticles = articles.articles.filter(
            (newArticle2) => !prev.some((prevArticle) => prevArticle.id === newArticle2.id)
          );
          const newArticle = newUniqueArticles.map((article) => ({ ...article }));
          return [...prev, ...newArticle];
        });
      }
      if (articles == null ? void 0 : articles.pagination) {
        setTotalPage(articles.pagination.totalPages);
      }
    })();
  }, [page]);
  const clickMoreHandler = () => {
    if (page > totalPage) return;
    setPage((prev) => prev + 1);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Helmet, { children: [
      /* @__PURE__ */ jsxs("title", { children: [
        q ?? "Search",
        " - essentialbali"
      ] }),
      /* @__PURE__ */ jsx("meta", { name: "description", content: "essentialbali is the ultimate Bali area guide for travelers, expats, and locals, featuring the best dining, events, schools, wellness, and travel in Bali" })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "py-12", children: [
      /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsx(Advertisement, {}) }),
      /* @__PURE__ */ jsxs("div", { className: "container py-12", children: [
        /* @__PURE__ */ jsx(RenderArticle, { content, q }),
        !!(page < totalPage) && /* @__PURE__ */ jsx("div", { className: "button-wrapper text-center py-8", children: /* @__PURE__ */ jsx(Button, { text: "Load More", onClick: clickMoreHandler }) })
      ] })
    ] })
  ] });
};
export {
  Search as default
};
