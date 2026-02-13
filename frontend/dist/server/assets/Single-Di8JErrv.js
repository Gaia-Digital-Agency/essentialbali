import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { b as getArticleByFields } from "./article.service-DlhMD6VX.js";
import { A as Advertisement } from "./Advertisement-CxJIGt1g.js";
import { N as Newsletter } from "./Newsletter-BG-n68FY.js";
import { I as Image } from "./Image-Dgi2d_09.js";
import { Link } from "react-router";
import { B as Button } from "./Button-CxQtGc7t.js";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { f as formatPublished } from "./format-ChXytroW.js";
import { FacebookShareButton, LinkedinShareButton, WhatsappShareButton } from "react-share";
import { S as SvgShare, a as SvgRedFacebook, b as SvgRedLinkedin, c as SvgRedWhatsapp } from "./share-M2kd5YPP.js";
import { I as useContent, u as useRoute, i as useNotification, e as useAuth, p as pkg, c as useTaxonomies } from "./TimeContext-B5j8j_GZ.js";
import { u as useArticle } from "./useArticle-m4fjTi_P.js";
/* empty css                       */
import "./newsletter.service-BbHT4ENG.js";
import "gsap";
import "@gsap/react";
import "react-router-dom";
import "date-fns";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
const { Helmet } = pkg;
const SITE_URL = "http://34.124.244.233/essentialbali";
const IMAGE_URL = "https://storage.googleapis.com/gda-s01-bucket/essentialbali";
const DiscoverArticle = ({ article }) => {
  var _a, _b;
  const { getPermalink, getFeaturedImageUrl } = useArticle();
  const { taxonomies } = useTaxonomies();
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "image-wrapper mb-5", children: /* @__PURE__ */ jsx(Image, { ratio: "62%", url: getFeaturedImageUrl(article), link: getPermalink(article) }) }),
    /* @__PURE__ */ jsx("div", { className: "category-wrapper", children: /* @__PURE__ */ jsx("p", { className: "uppercase text-front-red", children: (_b = (_a = taxonomies.categories) == null ? void 0 : _a.find((cat) => cat.id == article.category_id)) == null ? void 0 : _b.title }) }),
    /* @__PURE__ */ jsx("div", { className: "title-wrapper", children: /* @__PURE__ */ jsx(Link, { to: getPermalink(article), children: /* @__PURE__ */ jsx("p", { className: "text-front-subtitle font-serif", children: article.title }) }) })
  ] });
};
const RelatedArticle = ({ articles, theArticle }) => {
  const { getPermalink, getFeaturedImageUrl } = useArticle();
  const { taxonomies } = useTaxonomies();
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
        slidesPerView: 1,
        spaceBetween: 10,
        modules: [Pagination],
        pagination: {
          el: "#related-articles .swiper-pagination",
          enabled: true,
          clickable: true
        },
        breakpoints: {
          768: {
            slidesPerView: 2,
            spaceBetween: 20
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 40
          }
        },
        children: filtered.map((article) => {
          var _a, _b;
          return /* @__PURE__ */ jsxs(SwiperSlide, { children: [
            /* @__PURE__ */ jsx("div", { className: "image-wrapper mb-5 line-right-5", children: /* @__PURE__ */ jsx(Image, { url: getFeaturedImageUrl(article), link: getPermalink(article), ratio: "100%" }) }),
            /* @__PURE__ */ jsx("div", { className: "category-wrapper mb-1", children: /* @__PURE__ */ jsx("p", { className: "", children: (_b = (_a = taxonomies.categories) == null ? void 0 : _a.find((cat) => cat.id == article.category_id)) == null ? void 0 : _b.title }) }),
            /* @__PURE__ */ jsx("div", { className: "title-wrapper", children: /* @__PURE__ */ jsx(Link, { to: getPermalink(article), children: /* @__PURE__ */ jsx("p", { className: "font-serif text-front-title", children: article.title }) }) })
          ] }, article.id);
        })
      }
    )
  ] }) });
};
const EditButton = ({ article }) => {
  return /* @__PURE__ */ jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsx(Button, { text: "Edit article", link: `/admin/mst_article/edit/${article == null ? void 0 : article.id}` }) });
};
const Single = () => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u;
  const { initialData } = useContent();
  const { actualRoute, clientChange } = useRoute();
  const { getDeepestLocation, getFeaturedImageUrl } = useArticle();
  const [content, setContent] = useState((initialData == null ? void 0 : initialData.article) ?? void 0);
  const [discover, setDiscover] = useState((initialData == null ? void 0 : initialData.discover) ?? []);
  const [related, setRelated] = useState((initialData == null ? void 0 : initialData.related) ?? []);
  const [currentUrl, setCurrentUrl] = useState();
  const { setNotification } = useNotification();
  const { userDetails } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const deepestLocation = getDeepestLocation(actualRoute.article, "city");
  useEffect(() => {
    setCurrentUrl(window.location.href);
    setIsClient(true);
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
    try {
      setContent(actualRoute.article);
    } catch (e) {
      console.log(e);
    }
  }, [actualRoute]);
  useEffect(() => {
    if (!clientChange) return;
    (async () => {
      var _a2, _b2;
      try {
        const getArticle = await getArticleByFields({
          category: (_a2 = actualRoute == null ? void 0 : actualRoute.category) == null ? void 0 : _a2.id,
          limit: 11
        });
        if (getArticle == null ? void 0 : getArticle.articles) {
          setRelated(getArticle.articles);
        }
      } catch (e) {
        console.log(e);
      }
      try {
        const getArticle = await getArticleByFields({
          id_country: (_b2 = actualRoute == null ? void 0 : actualRoute.country) == null ? void 0 : _b2.id,
          limit: 4
        });
        if (getArticle == null ? void 0 : getArticle.articles) {
          setDiscover(getArticle.articles);
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }, [content]);
  const renderDiscover = () => {
    if (discover) {
      const filtered = discover.filter((article) => article.id != (content == null ? void 0 : content.id));
      if (filtered.length == 4) {
        filtered.pop();
      }
      return filtered == null ? void 0 : filtered.map((article) => {
        return /* @__PURE__ */ jsx("div", { className: "discover-article-wrapper mb-6", children: /* @__PURE__ */ jsx(DiscoverArticle, { article }) }, article.id);
      });
    }
  };
  const renderEditButton = () => {
    if (!isClient) return;
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
    return /* @__PURE__ */ jsx(Fragment, {});
  };
  const shareClickHandler = async () => {
    if (currentUrl) {
      await navigator.clipboard.writeText(currentUrl);
      setNotification({ message: "Copied URL to clipboard", type: "neutral" });
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Helmet, { children: [
      /* @__PURE__ */ jsxs("title", { children: [
        ((_a = actualRoute.article) == null ? void 0 : _a.title) ?? "",
        " - essentialbali"
      ] }),
      /* @__PURE__ */ jsx("meta", { name: "description", content: String(((_b = content == null ? void 0 : content.meta_data) == null ? void 0 : _b.meta_description) ?? (content == null ? void 0 : content.sub_title) ?? "") }),
      /* @__PURE__ */ jsx("link", { rel: "canonical", href: `${SITE_URL}/${(_c = actualRoute.country) == null ? void 0 : _c.slug}/${(_d = actualRoute.category) == null ? void 0 : _d.slug_title}/${(_e = actualRoute.article) == null ? void 0 : _e.slug}` }),
      /* @__PURE__ */ jsx("meta", { property: "og:type", content: "article" }),
      /* @__PURE__ */ jsx("meta", { property: "og:title", content: `${((_f = actualRoute.article) == null ? void 0 : _f.title) ?? ""} - essentialbali` }),
      /* @__PURE__ */ jsx("meta", { property: "og:description", content: (_g = actualRoute.article) == null ? void 0 : _g.sub_title }),
      /* @__PURE__ */ jsx("meta", { property: "og:url", content: `${SITE_URL}/${(_h = actualRoute.country) == null ? void 0 : _h.slug}/${(_i = actualRoute.category) == null ? void 0 : _i.slug_title}/${(_j = actualRoute.article) == null ? void 0 : _j.slug}` }),
      /* @__PURE__ */ jsx("meta", { property: "og:image", content: `${IMAGE_URL}/${((_k = actualRoute.article) == null ? void 0 : _k.featured_image_16_9_url) || ((_l = actualRoute.article) == null ? void 0 : _l.featured_image_url) || "images/placeholder.png"}` }),
      /* @__PURE__ */ jsx("meta", { property: "og:site_name", content: "essentialbali" }),
      /* @__PURE__ */ jsx("meta", { name: "twitter:card", content: "summary_large_image" }),
      /* @__PURE__ */ jsx("meta", { name: "twitter:title", content: `${((_m = actualRoute.article) == null ? void 0 : _m.title) ?? ""} - essentialbali` }),
      /* @__PURE__ */ jsx("meta", { name: "twitter:description", content: (_n = actualRoute.article) == null ? void 0 : _n.sub_title }),
      /* @__PURE__ */ jsx("meta", { name: "twitter:image", content: `${IMAGE_URL}/${((_o = actualRoute.article) == null ? void 0 : _o.featured_image_16_9_url) || ((_p = actualRoute.article) == null ? void 0 : _p.featured_image_url) || "images/placeholder.png"}` })
    ] }),
    /* @__PURE__ */ jsxs("article", { children: [
      /* @__PURE__ */ jsx("div", { className: "container mb-24", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 pt-12 md:gap-x-10 gap-y-10", children: [
        /* @__PURE__ */ jsx("div", { className: "col-span-12 mb-6", children: /* @__PURE__ */ jsxs("p", { className: "text-front-small uppercase", children: [
          /* @__PURE__ */ jsx(Link, { to: "/", children: "Home" }),
          " / ",
          /* @__PURE__ */ jsx(Link, { to: `/${deepestLocation == null ? void 0 : deepestLocation.slug}`, children: deepestLocation == null ? void 0 : deepestLocation.name }),
          " / ",
          /* @__PURE__ */ jsx(Link, { to: `/${(_q = actualRoute == null ? void 0 : actualRoute.country) == null ? void 0 : _q.slug}/${(_r = actualRoute == null ? void 0 : actualRoute.category) == null ? void 0 : _r.slug_title}`, children: (_s = actualRoute == null ? void 0 : actualRoute.category) == null ? void 0 : _s.title })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "md:col-span-9 col-span-12", children: [
          /* @__PURE__ */ jsxs("div", { className: "author-wrapper flex mb-6 justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "item flex gap-x-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "author flex gap-x-2.5", children: [
                /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "15", height: "16", viewBox: "0 0 15 16", fill: "none", children: [
                  /* @__PURE__ */ jsxs("g", { clipPath: "url(#clip0_83_51)", children: [
                    /* @__PURE__ */ jsx("rect", { width: "15", height: "15", transform: "translate(0 0.5)", fill: "white" }),
                    /* @__PURE__ */ jsx("path", { d: "M1.875 11.2812V13.625H4.21875L11.1312 6.71249L8.7875 4.36874L1.875 11.2812ZM13.3813 4.46249L11.0375 2.11874L9.45625 3.70624L11.8 6.04999L13.3813 4.46249Z", fill: "#7F7F7F" })
                  ] }),
                  /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", { id: "clip0_83_51", children: /* @__PURE__ */ jsx("rect", { width: "15", height: "15", fill: "white", transform: "translate(0 0.5)" }) }) })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-[#A9A9A9] text-front-small", children: content == null ? void 0 : content.author_name })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "author flex gap-x-2.5", children: [
                /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "15", height: "14", viewBox: "0 0 15 14", fill: "none", children: [
                  /* @__PURE__ */ jsx("path", { d: "M1.125 4.14229C1.125 3.17103 1.91236 2.38367 2.88362 2.38367H12.1164C13.0877 2.38367 13.875 3.17103 13.875 4.14229V11.6164C13.875 12.5877 13.0877 13.375 12.1164 13.375H2.88362C1.91236 13.375 1.125 12.5877 1.125 11.6164V4.14229Z", stroke: "#7F7F7F", strokeWidth: "0.9", strokeLinecap: "round", strokeLinejoin: "round" }),
                  /* @__PURE__ */ jsx("path", { d: "M3.98267 0.624878V3.70246", stroke: "#7F7F7F", strokeWidth: "0.9", strokeLinecap: "round", strokeLinejoin: "round" }),
                  /* @__PURE__ */ jsx("path", { d: "M11.0173 0.624878V3.70246", stroke: "#7F7F7F", strokeWidth: "0.9", strokeLinecap: "round", strokeLinejoin: "round" }),
                  /* @__PURE__ */ jsx("path", { d: "M3.76294 5.90027H11.2371", stroke: "#7F7F7F", strokeWidth: "0.9", strokeLinecap: "round", strokeLinejoin: "round" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-[#A9A9A9] text-front-small", children: formatPublished(content == null ? void 0 : content.updatedAt) })
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "item", children: /* @__PURE__ */ jsx(SvgShare, { className: "cursor-pointer", onClick: shareClickHandler }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "title-wrapper mb-4", children: /* @__PURE__ */ jsx("h1", { className: "font-serif text-front-hero", children: content == null ? void 0 : content.title }) }),
          /* @__PURE__ */ jsx("div", { className: "featured-image-wrapper py-4 mb-4", children: /* @__PURE__ */ jsx(Image, { url: getFeaturedImageUrl(content, "16_9"), ratio: "56.25%", isLazy: false, fetchPriority: "high" }) }),
          /* @__PURE__ */ jsxs("div", { className: "share-buttons-wrapper mb-8 flex items-center gap-x-5", children: [
            /* @__PURE__ */ jsx("p", { children: "Share:" }),
            currentUrl && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(FacebookShareButton, { url: currentUrl, children: /* @__PURE__ */ jsx(SvgRedFacebook, { className: "w-[24px] h-[24px]" }) }),
              /* @__PURE__ */ jsx(LinkedinShareButton, { url: currentUrl, children: /* @__PURE__ */ jsx(SvgRedLinkedin, { className: "w-[24px] h-[24px]" }) }),
              /* @__PURE__ */ jsx(WhatsappShareButton, { url: currentUrl, children: /* @__PURE__ */ jsx(SvgRedWhatsapp, { className: "w-[24px] h-[24px]" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "content-wrapper mb-8", dangerouslySetInnerHTML: { __html: (content == null ? void 0 : content.article_post) ?? "" } })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "md:col-span-3 col-span-12", children: [
          renderEditButton(),
          /* @__PURE__ */ jsx(Advertisement, { ratio: "vertical" }),
          /* @__PURE__ */ jsx("div", { className: "spacer py-6" }),
          /* @__PURE__ */ jsx("p", { className: "font-serif text-front-article-title", children: "Discover More" }),
          /* @__PURE__ */ jsx("div", { className: "spacer py-2" }),
          renderDiscover()
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "outer bg-front-section-grey py-8", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
        /* @__PURE__ */ jsx("div", { className: "title-wrapper mb-6 text-center", children: /* @__PURE__ */ jsxs("p", { className: "font-serif text-front-main-title", children: [
          /* @__PURE__ */ jsx("span", { className: "text-front-red", children: "Related" }),
          " Articles"
        ] }) }),
        related && /* @__PURE__ */ jsx(RelatedArticle, { articles: related, theArticle: content ?? null }),
        /* @__PURE__ */ jsx("div", { className: "button-wrapper text-center pt-16 pb-8", children: /* @__PURE__ */ jsx(Button, { text: "VIEW ALL", link: `/${(_t = actualRoute.country) == null ? void 0 : _t.slug}/${(_u = actualRoute.category) == null ? void 0 : _u.slug_title}` }) }),
        /* @__PURE__ */ jsx("div", { className: "py-8", children: /* @__PURE__ */ jsx("hr", { style: { borderColor: "#5F5F5F" } }) }),
        /* @__PURE__ */ jsx(Newsletter, {})
      ] }) })
    ] })
  ] });
};
export {
  Single as default
};
