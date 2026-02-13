import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { b as getArticleByFields } from "./article.service-DlhMD6VX.js";
import { useNavigate, Link } from "react-router";
import { u as useRoute, c as useTaxonomies, p as pkg, J as useTime } from "./TimeContext-B5j8j_GZ.js";
import { I as Image } from "./Image-Dgi2d_09.js";
import { t as timeAgo, g as getCurrencySymbol } from "./format-ChXytroW.js";
import { B as Button } from "./Button-CxQtGc7t.js";
import { N as Newsletter } from "./Newsletter-BG-n68FY.js";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "gsap";
import "@gsap/react";
import "react-router-dom";
import "date-fns";
import "./newsletter.service-BbHT4ENG.js";
const { Helmet } = pkg;
const TagsBox = ({ text }) => {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { className: "px-2.5 py-1.5 bg-[#eee]", children: /* @__PURE__ */ jsx("p", { className: "font-medium text-[#202020]", children: text }) }) });
};
const ArticleCard = ({ article }) => {
  const { getCategoryById, getCountryById } = useTaxonomies();
  const { initialData } = useTime();
  const generateUrl = (article2) => {
    var _a, _b;
    return `/${(_a = getCountryById(article2.id_country)) == null ? void 0 : _a.slug}/${(_b = getCategoryById(article2.category_id)) == null ? void 0 : _b.slug_title}/${article2.slug}`;
  };
  let metadata;
  if (typeof (article == null ? void 0 : article.meta_data) == "string") {
    metadata = JSON.parse(article == null ? void 0 : article.meta_data);
  } else {
    metadata = article == null ? void 0 : article.meta_data;
  }
  if (article) {
    const salaryTime = () => {
      const salary = metadata == null ? void 0 : metadata.salary_time;
      if (salary) {
        return `${salary}`.slice(0, 1);
      }
      return "m";
    };
    return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { className: "md:col-span-6 col-span-12", children: /* @__PURE__ */ jsxs("div", { className: "inner py-8 px-6 border border-[#cecece]", children: [
      /* @__PURE__ */ jsxs("div", { className: "title-wrapper flex items-center gap-x-5 mb-8", children: [
        /* @__PURE__ */ jsx("div", { className: "image-wrapper w-[87px]", children: /* @__PURE__ */ jsx(Image, { url: (metadata == null ? void 0 : metadata.company_logo) ?? "/logo.png", ratio: "87px", link: generateUrl(article) }) }),
        /* @__PURE__ */ jsx("div", { className: "title-wrapper flex-1", children: /* @__PURE__ */ jsxs("div", { className: "title", children: [
          /* @__PURE__ */ jsx("p", { className: "text-front-body-big font-bold uppercase", children: /* @__PURE__ */ jsx(Link, { to: generateUrl(article), viewTransition: true, children: article.title }) }),
          /* @__PURE__ */ jsxs("p", { className: "text-front-body-big text-[#767676]", children: [
            (metadata == null ? void 0 : metadata.company_name) ?? "Company A",
            " | ",
            (metadata == null ? void 0 : metadata.company_location) ?? "Bali, Uluwatu"
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "tags-wrapper flex gap-x-2.5 mb-2.5", children: [
        /* @__PURE__ */ jsx(TagsBox, { text: (metadata == null ? void 0 : metadata.job_type) ?? "Fulltime" }),
        /* @__PURE__ */ jsx(TagsBox, { text: (metadata == null ? void 0 : metadata.experience) ? `${metadata.experience} Years` : "1 Years" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "date-wrapper mb-10", children: /* @__PURE__ */ jsx("p", { className: "text-[#767676] text-front-small", children: timeAgo(article.createdAt, initialData) }) }),
      /* @__PURE__ */ jsxs("div", { className: "footer-wrapper flex justify-between items-end", children: [
        /* @__PURE__ */ jsx("div", { className: "item", children: /* @__PURE__ */ jsxs("p", { className: "", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-[22px] text-front-red font-bold", children: [
            getCurrencySymbol((metadata == null ? void 0 : metadata.salary_currency) ?? "USD"),
            (metadata == null ? void 0 : metadata.salary_range) ?? "1000"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-front-small", children: [
            "/",
            salaryTime()
          ] })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "item", children: /* @__PURE__ */ jsx(Button, { borderOnly: true, text: "APPLY NOW", link: generateUrl(article) }) })
      ] })
    ] }) }) });
  }
};
const JobListing = ({ children }) => {
  var _a;
  const { actualRoute } = useRoute();
  const { taxonomies } = useTaxonomies();
  const [content, setContent] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();
  const CATEGORY_SLUG = "job-listing";
  const LIMIT_ARTICLE = 6;
  const theCategory = (_a = taxonomies == null ? void 0 : taxonomies.categories) == null ? void 0 : _a.find((cat) => cat.slug_title == CATEGORY_SLUG);
  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      var _a2, _b, _c, _d;
      const getArticle = await getArticleByFields({
        id_country: (_a2 = actualRoute == null ? void 0 : actualRoute.country) == null ? void 0 : _a2.id,
        id_city: (_b = actualRoute == null ? void 0 : actualRoute.city) == null ? void 0 : _b.id,
        id_region: (_c = actualRoute == null ? void 0 : actualRoute.region) == null ? void 0 : _c.id,
        limit: LIMIT_ARTICLE,
        page,
        category: theCategory == null ? void 0 : theCategory.id
      });
      if (getArticle == null ? void 0 : getArticle.articles) {
        setContent((prev) => {
          const newUniqueArticles = getArticle.articles.filter(
            (newArticle) => !prev.some((prevArticle) => prevArticle.id === newArticle.id)
          );
          return [...prev, ...newUniqueArticles];
        });
        setTotalPage(((_d = getArticle.pagination) == null ? void 0 : _d.totalPages) ?? 1);
      }
    })();
    setTitle(theCategory == null ? void 0 : theCategory.sub_title);
    setDescription(theCategory == null ? void 0 : theCategory.description);
  }, [taxonomies, actualRoute, page]);
  const moreClickHandler = () => {
    setPage(page + 1);
  };
  const renderChildren = () => {
    if (children) {
      return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "fixed z-[100] inset-0 transition", children: [
        /* @__PURE__ */ jsx("div", { className: "absolute overlay z-[100] inset-0 bg-[rgba(12,12,12,.4)]", onClick: () => {
          navigate("..", { relative: "path", viewTransition: true });
        } }),
        /* @__PURE__ */ jsx("div", { className: "absolute rounded-xl z-[100] max-h-[90vh] overflow-scroll left-0 right-0 bottom-0", children })
      ] }) });
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Helmet, { children: /* @__PURE__ */ jsx("title", { children: "Job Listing - essentialbali" }) }),
    /* @__PURE__ */ jsx("div", { className: "image-wrapper mb-10", children: /* @__PURE__ */ jsx(Image, { url: "/logo.png", ratio: "38%" }) }),
    /* @__PURE__ */ jsxs("div", { className: "page-container py-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "container mb-24", children: [
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-12 mb-20", children: /* @__PURE__ */ jsxs("div", { className: "col-span-6 col-start-4 text-center", children: [
          /* @__PURE__ */ jsx("p", { className: "font-serif text-front-hero mb-4", children: title }),
          /* @__PURE__ */ jsx("p", { className: "text-front-body", children: description })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-12 gap-5 mb-16", children: content == null ? void 0 : content.map((article) => /* @__PURE__ */ jsx(ArticleCard, { article })) }),
        totalPage > page && /* @__PURE__ */ jsx("div", { className: "button-wrapper text-center", children: /* @__PURE__ */ jsx(Button, { text: "VIEW MORE", onClick: moreClickHandler }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "outer bg-front-section-grey py-8", children: /* @__PURE__ */ jsx(Newsletter, {}) })
    ] }),
    renderChildren()
  ] });
};
export {
  JobListing as default
};
