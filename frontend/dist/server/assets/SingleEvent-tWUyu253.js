import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { I as useContent, i as useNotification, u as useRoute, e as useAuth, p as pkg, c as useTaxonomies } from "./TimeContext-B5j8j_GZ.js";
import { A as Advertisement } from "./Advertisement-CxJIGt1g.js";
import { FacebookShareButton, LinkedinShareButton, WhatsappShareButton } from "react-share";
import { S as SvgShare, a as SvgRedFacebook, b as SvgRedLinkedin, c as SvgRedWhatsapp } from "./share-M2kd5YPP.js";
import { I as Image } from "./Image-Dgi2d_09.js";
import { Link } from "react-router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { b as getTagByIDs } from "./tags.service-D334lDpz.js";
import { f as formatPublished } from "./format-ChXytroW.js";
import { N as Newsletter } from "./Newsletter-BG-n68FY.js";
import { B as Button } from "./Button-CxQtGc7t.js";
import { b as getArticleByFields } from "./article.service-DlhMD6VX.js";
import { u as useArticle } from "./useArticle-m4fjTi_P.js";
import { parseISO, format } from "date-fns";
/* empty css                       */
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "gsap";
import "@gsap/react";
import "react-router-dom";
import "./newsletter.service-BbHT4ENG.js";
const { Helmet } = pkg;
const SITE_URL = "http://34.124.244.233/essentialbali";
const IMAGE_URL = "https://storage.googleapis.com/gda-s01-bucket/essentialbali";
const DiscoverArticle = ({ article }) => {
  var _a;
  const { getCategoryById } = useTaxonomies();
  const { getFeaturedImageUrl, getPermalink } = useArticle();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "image-wrapper mb-5", children: /* @__PURE__ */ jsx(Image, { ratio: "62%", url: getFeaturedImageUrl(article), link: getPermalink(article) }) }),
    /* @__PURE__ */ jsx("div", { className: "category-wrapper", children: /* @__PURE__ */ jsx("p", { className: "uppercase text-front-red", children: (_a = getCategoryById(article == null ? void 0 : article.category_id)) == null ? void 0 : _a.title }) }),
    /* @__PURE__ */ jsx("div", { className: "title-wrapper", children: /* @__PURE__ */ jsx(Link, { to: getPermalink(article), children: /* @__PURE__ */ jsx("p", { className: "text-front-subtitle font-serif", children: article.title }) }) })
  ] });
};
const RelatedArticle = ({ articles, theArticle }) => {
  const { getCategoryById } = useTaxonomies();
  const { getFeaturedImageUrl, getPermalink } = useArticle();
  if (!theArticle) return;
  const filtered = articles.filter((article) => article.id != theArticle.id);
  if (filtered.length == 10) {
    filtered.pop();
  }
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { id: "related-articles", className: "relative pb-12", children: [
    /* @__PURE__ */ jsx("div", { className: "swiper-pagination" }),
    /* @__PURE__ */ jsx(
      Swiper,
      {
        slidesPerView: 4,
        spaceBetween: 40,
        modules: [Pagination],
        pagination: {
          el: "#related-articles .swiper-pagination",
          enabled: true,
          clickable: true
        },
        children: filtered.map((article) => {
          var _a;
          return /* @__PURE__ */ jsxs(SwiperSlide, { children: [
            /* @__PURE__ */ jsx("div", { className: "image-wrapper mb-5 line-right-5", children: /* @__PURE__ */ jsx(Image, { url: getFeaturedImageUrl(article), link: getPermalink(article), ratio: "100%" }) }),
            /* @__PURE__ */ jsx("div", { className: "category-wrapper mb-1", children: /* @__PURE__ */ jsx("p", { className: "", children: (_a = getCategoryById(article == null ? void 0 : article.category_id)) == null ? void 0 : _a.title }) }),
            /* @__PURE__ */ jsx("div", { className: "title-wrapper", children: /* @__PURE__ */ jsx(Link, { to: getPermalink(article), children: /* @__PURE__ */ jsx("p", { className: "font-serif text-front-title", children: article.title }) }) })
          ] });
        })
      }
    )
  ] }) });
};
const formatTime = (time) => {
  let m = "AM";
  const [hour, minute] = time.split(":");
  let resHour = Number(hour);
  if (!hour || !minute) return;
  if (Number(hour) > 11) {
    m = "PM";
    resHour = Number(hour) == 12 ? 12 : Number(hour) - 12;
  }
  return `${resHour}${m}`;
};
const formatDate = (isoDate) => {
  if (!isoDate) return void 0;
  const date = parseISO(isoDate);
  return format(date, "EEEE, d MMMM yyyy");
};
const EditButton = ({ article }) => {
  if (!article) return /* @__PURE__ */ jsx(Fragment, {});
  return /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Button, { text: "Edit article", link: `/admin/mst_article/edit/${article.id}` }) });
};
const SingleEvent = () => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _A, _B;
  const { initialData } = useContent();
  const { setNotification } = useNotification();
  const { actualRoute } = useRoute();
  const { getFeaturedImageUrl } = useArticle();
  const [content, setContent] = useState((initialData == null ? void 0 : initialData.article) ?? void 0);
  const [relatedArticle, setRelatedArticle] = useState((initialData == null ? void 0 : initialData.related) ?? []);
  const [discoverArticle, setDiscoverArticle] = useState((initialData == null ? void 0 : initialData.discover) ?? []);
  const [currentPage, setCurrentPage] = useState();
  const [tags, setTags] = useState([]);
  const { userDetails } = useAuth();
  const renderEditButton = () => {
    if ((userDetails == null ? void 0 : userDetails.user_level) == "super_admin") {
      return /* @__PURE__ */ jsx(EditButton, { article: content });
    }
    if ((userDetails == null ? void 0 : userDetails.user_level) == "admin_country") {
      if ((content == null ? void 0 : content.id_country) == userDetails.id_country) {
        return /* @__PURE__ */ jsx(EditButton, { article: content });
      }
    }
    if ((userDetails == null ? void 0 : userDetails.user_level) == "admin_city") {
      if ((content == null ? void 0 : content.id_city) == userDetails.id_city) {
        return /* @__PURE__ */ jsx(EditButton, { article: content });
      }
    }
  };
  useEffect(() => {
    (async () => {
      var _a2, _b2, _c2;
      try {
        if ((_a2 = content == null ? void 0 : content.tags) == null ? void 0 : _a2.length) {
          const getTag = await getTagByIDs(content == null ? void 0 : content.tags);
          if (getTag) {
            setTags(getTag);
          }
        }
      } catch (e) {
        console.log(e);
      }
      try {
        const getArticle = await getArticleByFields({
          category: (_b2 = actualRoute == null ? void 0 : actualRoute.category) == null ? void 0 : _b2.id,
          limit: 11
        });
        if (getArticle == null ? void 0 : getArticle.articles) {
          setRelatedArticle(getArticle.articles);
        }
      } catch (e) {
        console.log(e);
      }
      try {
        const getArticle = await getArticleByFields({
          id_country: (_c2 = actualRoute == null ? void 0 : actualRoute.country) == null ? void 0 : _c2.id,
          limit: 4
        });
        if (getArticle == null ? void 0 : getArticle.articles) {
          setDiscoverArticle(getArticle.articles);
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }, [content]);
  useEffect(() => {
    setCurrentPage(window.location.href);
    setContent(actualRoute.article);
  }, []);
  const shareClickHandler = async () => {
    if (currentPage) {
      await navigator.clipboard.writeText(currentPage);
      setNotification({ message: "Copied URL to clipboard", type: "neutral" });
    }
  };
  const renderTags = () => {
    if (tags.length) {
      return tags.map((tag) => /* @__PURE__ */ jsx("div", { className: "box px-8 py-2 bg-[#EEEEEE] uppercase", children: tag.name }));
    }
  };
  const renderDiscover = () => {
    if (discoverArticle) {
      const filtered = discoverArticle.filter((article) => article.id != (content == null ? void 0 : content.id));
      if (filtered.length == 4) {
        filtered.pop();
      }
      return filtered == null ? void 0 : filtered.map((article) => {
        return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { className: "discover-article-wrapper mb-6", children: /* @__PURE__ */ jsx(DiscoverArticle, { article }) }) });
      });
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Helmet, { children: [
      /* @__PURE__ */ jsxs("title", { children: [
        (_a = actualRoute.article) == null ? void 0 : _a.title,
        " - essentialbali"
      ] }),
      /* @__PURE__ */ jsx("meta", { name: "description", content: String(((_b = content == null ? void 0 : content.meta_data) == null ? void 0 : _b.meta_description) ?? (content == null ? void 0 : content.sub_title) ?? "") }),
      /* @__PURE__ */ jsx("link", { rel: "canonical", href: `${SITE_URL}/${(_c = actualRoute.country) == null ? void 0 : _c.slug}/${(_d = actualRoute.category) == null ? void 0 : _d.slug_title}/${(_e = actualRoute.article) == null ? void 0 : _e.slug}` }),
      /* @__PURE__ */ jsx("meta", { property: "og:type", content: "article" }),
      /* @__PURE__ */ jsx("meta", { property: "og:title", content: `${(_f = actualRoute.article) == null ? void 0 : _f.title} - essentialbali` }),
      /* @__PURE__ */ jsx("meta", { property: "og:description", content: (_g = actualRoute.article) == null ? void 0 : _g.sub_title }),
      /* @__PURE__ */ jsx("meta", { property: "og:url", content: `${SITE_URL}/${(_h = actualRoute.country) == null ? void 0 : _h.slug}/${(_i = actualRoute.category) == null ? void 0 : _i.slug_title}/${(_j = actualRoute.article) == null ? void 0 : _j.slug}` }),
      /* @__PURE__ */ jsx("meta", { property: "og:image", content: `${IMAGE_URL}/${((_k = actualRoute.article) == null ? void 0 : _k.featured_image_16_9_url) || ((_l = actualRoute.article) == null ? void 0 : _l.featured_image_url) || "images/placeholder.png"}` }),
      /* @__PURE__ */ jsx("meta", { property: "og:site_name", content: "essentialbali" }),
      /* @__PURE__ */ jsx("meta", { name: "twitter:card", content: "summary_large_image" }),
      /* @__PURE__ */ jsx("meta", { name: "twitter:title", content: `${(_m = actualRoute.article) == null ? void 0 : _m.title} - essentialbali` }),
      /* @__PURE__ */ jsx("meta", { name: "twitter:description", content: (_n = actualRoute.article) == null ? void 0 : _n.sub_title }),
      /* @__PURE__ */ jsx("meta", { name: "twitter:image", content: `${IMAGE_URL}/${((_o = actualRoute.article) == null ? void 0 : _o.featured_image_16_9_url) || ((_p = actualRoute.article) == null ? void 0 : _p.featured_image_url) || "images/placeholder.png"}` })
    ] }),
    /* @__PURE__ */ jsxs("article", { children: [
      /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 lg:gap-x-10 py-12", children: [
        /* @__PURE__ */ jsx("div", { className: "lg:col-span-8 lg:col-start-3 col-span-12 mb-12", children: /* @__PURE__ */ jsx(Advertisement, {}) }),
        /* @__PURE__ */ jsx("div", { className: "col-span-12 mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsx("div", { className: "item", children: /* @__PURE__ */ jsx("p", { className: "text-[#222222]", children: formatPublished(content == null ? void 0 : content.updatedAt) }) }),
          /* @__PURE__ */ jsx("div", { className: "item", children: /* @__PURE__ */ jsx(SvgShare, { className: "cursor-pointer", onClick: shareClickHandler }) })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-9 col-span-12", children: [
          /* @__PURE__ */ jsx("div", { className: "thumbnail-wrapper mb-6", children: /* @__PURE__ */ jsx(Image, { url: getFeaturedImageUrl(content ?? void 0), ratio: "56.25%", isLazy: false, fetchPriority: "high" }) }),
          /* @__PURE__ */ jsxs("div", { className: "author-wrapper flex justify-between mb-6 items-center", children: [
            /* @__PURE__ */ jsx("div", { className: "item", children: /* @__PURE__ */ jsxs("p", { children: [
              "By ",
              content == null ? void 0 : content.author_name
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "item flex gap-x-4", children: renderTags() })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "title-wrapper mb-6", children: /* @__PURE__ */ jsx("h1", { className: "text-front-article-title font-serif", children: content == null ? void 0 : content.title }) }),
          /* @__PURE__ */ jsxs("div", { className: "date-information mb-8", children: [
            ((_q = content == null ? void 0 : content.meta_data) == null ? void 0 : _q.start_date) || ((_r = content == null ? void 0 : content.meta_data) == null ? void 0 : _r.start_time) && /* @__PURE__ */ jsx("div", { className: "title mb-4", children: /* @__PURE__ */ jsx("p", { className: "text-front-subtitle font-serif", children: "Date & Time" }) }),
            ((_s = content == null ? void 0 : content.meta_data) == null ? void 0 : _s.start_date) && /* @__PURE__ */ jsxs("div", { className: "item flex gap-x-4 mb-2", children: [
              /* @__PURE__ */ jsx("div", { className: "icon", children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "15", height: "14", viewBox: "0 0 15 14", fill: "none", children: [
                /* @__PURE__ */ jsx("path", { d: "M1.125 4.14229C1.125 3.17103 1.91236 2.38367 2.88362 2.38367H12.1164C13.0877 2.38367 13.875 3.17103 13.875 4.14229V11.6164C13.875 12.5877 13.0877 13.375 12.1164 13.375H2.88362C1.91236 13.375 1.125 12.5877 1.125 11.6164V4.14229Z", stroke: "#7F7F7F", "stroke-width": "0.9", "stroke-linecap": "round", "stroke-linejoin": "round" }),
                /* @__PURE__ */ jsx("path", { d: "M3.98267 0.624878V3.70246", stroke: "#7F7F7F", "stroke-width": "0.9", "stroke-linecap": "round", "stroke-linejoin": "round" }),
                /* @__PURE__ */ jsx("path", { d: "M11.0173 0.624878V3.70246", stroke: "#7F7F7F", "stroke-width": "0.9", "stroke-linecap": "round", "stroke-linejoin": "round" }),
                /* @__PURE__ */ jsx("path", { d: "M3.76294 5.90027H11.2371", stroke: "#7F7F7F", "stroke-width": "0.9", "stroke-linecap": "round", "stroke-linejoin": "round" })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "text", children: ((_t = content == null ? void 0 : content.meta_data) == null ? void 0 : _t.start_date) ? formatDate(`${(_u = content == null ? void 0 : content.meta_data) == null ? void 0 : _u.start_date}`) : "Saturday, 16 September 2025" })
            ] }),
            ((_v = content == null ? void 0 : content.meta_data) == null ? void 0 : _v.start_time) && /* @__PURE__ */ jsxs("div", { className: "item flex gap-x-4", children: [
              /* @__PURE__ */ jsx("div", { className: "icon", children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "15", height: "15", viewBox: "0 0 15 15", fill: "none", children: [
                /* @__PURE__ */ jsx("g", { "clip-path": "url(#clip0_670_5700)", children: /* @__PURE__ */ jsx("path", { d: "M8.74994 0.625H6.24994C5.90619 0.625 5.62494 0.90625 5.62494 1.25C5.62494 1.59375 5.90619 1.875 6.24994 1.875H8.74994C9.09369 1.875 9.37494 1.59375 9.37494 1.25C9.37494 0.90625 9.09369 0.625 8.74994 0.625ZM7.49994 8.75C7.84369 8.75 8.12494 8.46875 8.12494 8.125V5.625C8.12494 5.28125 7.84369 5 7.49994 5C7.15619 5 6.87494 5.28125 6.87494 5.625V8.125C6.87494 8.46875 7.15619 8.75 7.49994 8.75ZM11.8937 4.61875L12.3624 4.15C12.5999 3.9125 12.6062 3.51875 12.3624 3.275L12.3562 3.26875C12.1124 3.025 11.7249 3.03125 11.4812 3.26875L11.0124 3.7375C10.0437 2.9625 8.82494 2.5 7.49994 2.5C4.49994 2.5 1.94994 4.975 1.87494 7.975C1.79369 11.15 4.33744 13.75 7.49994 13.75C10.6124 13.75 13.1249 11.2312 13.1249 8.125C13.1249 6.8 12.6624 5.58125 11.8937 4.61875ZM7.49994 12.5C5.08119 12.5 3.12494 10.5437 3.12494 8.125C3.12494 5.70625 5.08119 3.75 7.49994 3.75C9.91869 3.75 11.8749 5.70625 11.8749 8.125C11.8749 10.5437 9.91869 12.5 7.49994 12.5Z", fill: "#7F7F7F" }) }),
                /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", { id: "clip0_670_5700", children: /* @__PURE__ */ jsx("rect", { width: "15", height: "15", fill: "white" }) }) })
              ] }) }),
              /* @__PURE__ */ jsxs("div", { className: "text", children: [
                ((_w = content == null ? void 0 : content.meta_data) == null ? void 0 : _w.start_time) ? `${formatTime(`${(_x = content == null ? void 0 : content.meta_data) == null ? void 0 : _x.start_time}`)} ` : "",
                ((_y = content == null ? void 0 : content.meta_data) == null ? void 0 : _y.end_time) ? `- ${formatTime(`${(_z = content == null ? void 0 : content.meta_data) == null ? void 0 : _z.end_time}`)}` : ""
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "share-buttons-wrapper mb-8 flex items-center gap-x-5", children: [
            /* @__PURE__ */ jsx("p", { children: "Share:" }),
            currentPage && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(FacebookShareButton, { url: currentPage, children: /* @__PURE__ */ jsx(SvgRedFacebook, { className: "w-[24px] h-[24px]" }) }),
              /* @__PURE__ */ jsx(LinkedinShareButton, { url: currentPage, children: /* @__PURE__ */ jsx(SvgRedLinkedin, { className: "w-[24px] h-[24px]" }) }),
              /* @__PURE__ */ jsx(WhatsappShareButton, { url: currentPage, children: /* @__PURE__ */ jsx(SvgRedWhatsapp, { className: "w-[24px] h-[24px]" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "content-wrapper mb-8", dangerouslySetInnerHTML: { __html: (content == null ? void 0 : content.article_post) ?? "" } })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "lg:col-span-3 col-span-12", children: [
          renderEditButton(),
          /* @__PURE__ */ jsx("div", { className: "ads-wrapper mb-12", children: /* @__PURE__ */ jsx(Advertisement, { ratio: "vertical" }) }),
          renderDiscover()
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "outer bg-front-section-grey py-8", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
        /* @__PURE__ */ jsx("div", { className: "title-wrapper mb-6 text-center", children: /* @__PURE__ */ jsxs("p", { className: "font-serif text-front-main-title", children: [
          /* @__PURE__ */ jsx("span", { className: "text-front-red", children: "Related" }),
          " Articles"
        ] }) }),
        relatedArticle && /* @__PURE__ */ jsx(RelatedArticle, { articles: relatedArticle, theArticle: content ?? null }),
        /* @__PURE__ */ jsx("div", { className: "button-wrapper text-center pt-12 pb-8", children: /* @__PURE__ */ jsx(Button, { text: "VIEW ALL", link: `${(_A = actualRoute.country) == null ? void 0 : _A.slug}/${(_B = actualRoute.category) == null ? void 0 : _B.slug_title}` }) }),
        /* @__PURE__ */ jsx("div", { className: "py-8", children: /* @__PURE__ */ jsx("hr", { style: { borderColor: "#5F5F5F" } }) }),
        /* @__PURE__ */ jsx(Newsletter, {})
      ] }) })
    ] })
  ] });
};
export {
  SingleEvent as default
};
