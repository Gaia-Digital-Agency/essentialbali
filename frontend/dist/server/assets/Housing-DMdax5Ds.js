import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { b as getArticleByFields } from "./article.service-DlhMD6VX.js";
import { I as Image } from "./Image-Dgi2d_09.js";
import { u as useRoute, c as useTaxonomies, p as pkg } from "./TimeContext-B5j8j_GZ.js";
import { useSearchParams, Link } from "react-router";
import { g as generatePagination } from "./pagination-DggO-1UD.js";
import "gsap";
import "@gsap/react";
import "react-router-dom";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
const { Helmet } = pkg;
const IMAGE_URL = "https://storage.googleapis.com/gda-s01-bucket/essentialbali";
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
const Housing = () => {
  var _a, _b, _c, _d;
  const rentalType = ["daily", "monthly", "yearly"];
  const { actualRoute } = useRoute();
  const { getCountryById, getCategoryById } = useTaxonomies();
  const [content, setContent] = useState();
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchPage = searchParams.get("page");
  const currentPage = searchPage ? parseInt(searchPage) : 1;
  const searchType = searchParams.get("type");
  const currentType = searchType;
  const generateImageUrl = (image, id) => {
    if (image) {
      return `${IMAGE_URL}/${image}`;
    }
    return `https://picsum.photos/id/${id * 10}/1920/1080`;
  };
  const generateUrl = (article) => {
    var _a2, _b2;
    return `/${(_a2 = getCountryById(article.id_country)) == null ? void 0 : _a2.slug}/${(_b2 = getCategoryById(article.category_id)) == null ? void 0 : _b2.slug_title}/${article.slug}`;
  };
  const isType = currentType ? { metaData_rentaltype: currentType } : {};
  const queryData = {
    id_country: (_a = actualRoute.country) == null ? void 0 : _a.id,
    id_city: (_b = actualRoute.city) == null ? void 0 : _b.id,
    id_region: (_c = actualRoute.region) == null ? void 0 : _c.id,
    category: (_d = actualRoute.category) == null ? void 0 : _d.id,
    limit: 6,
    page: currentPage,
    ...isType
  };
  useEffect(() => {
    (async () => {
      const getArticle = await getArticleByFields(queryData);
      if (getArticle == null ? void 0 : getArticle.articles) {
        setContent(getArticle.articles);
      } else {
        setContent([]);
      }
      if (getArticle == null ? void 0 : getArticle.pagination) {
        setTotalPages(getArticle.pagination.totalPages);
      } else {
        setTotalPages(1);
      }
    })();
  }, [searchParams, actualRoute]);
  useEffect(() => {
    var _a2, _b2;
    setTitle((_a2 = actualRoute.category) == null ? void 0 : _a2.sub_title);
    setDescription((_b2 = actualRoute.category) == null ? void 0 : _b2.description);
  }, [actualRoute]);
  const clickPagingHandler = (page) => {
    if (page > totalPages || page <= 0) return;
    setSearchParams(`page=${page}`);
  };
  const clickTypeHandler = (type) => {
    if (type == currentType) {
      setSearchParams("type");
      return;
    }
    setSearchParams(`type=${type}`);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Helmet, { children: /* @__PURE__ */ jsx("title", { children: "Housing - essentialbali" }) }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("div", { className: "image-wrapper mb-10", children: /* @__PURE__ */ jsx(Image, { url: "/logo.png", ratio: "38%", alt: "hero image housing" }) }),
      /* @__PURE__ */ jsxs("div", { className: "container", children: [
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-12 mb-16", children: /* @__PURE__ */ jsxs("div", { className: "md:col-span-10 md:col-start-2 col-span-12", children: [
          /* @__PURE__ */ jsx("div", { className: "title-wrapper text-center mb-4", children: /* @__PURE__ */ jsx("p", { className: "font-serif text-front-hero", children: title }) }),
          /* @__PURE__ */ jsx("div", { className: "description-wrapper text-center", children: /* @__PURE__ */ jsx("p", { className: "", children: description }) })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "flex rent-type-wrapper gap-x-4 mb-10 pb-6 border-b border-b-front-black", children: rentalType.map((type) => /* @__PURE__ */ jsxs("div", { onClick: () => {
          clickTypeHandler(type);
        }, className: `box cursor-pointer py-3 px-8 text-front-small uppercase ${type == currentType ? "font-bold bg-front-red text-white" : "border border-front-black"}`, children: [
          type,
          " Rental"
        ] })) }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-12 gap-8", children: content == null ? void 0 : content.map((article) => {
          var _a2, _b2, _c2, _d2, _e;
          return /* @__PURE__ */ jsx("div", { className: "md:col-span-4 col-span-12", children: /* @__PURE__ */ jsxs("div", { className: "inner shadow-xl", children: [
            /* @__PURE__ */ jsx("div", { className: "image-wrapper", children: /* @__PURE__ */ jsx(Image, { url: generateImageUrl(article.featured_image_url, article.id), ratio: "92%", link: generateUrl(article), alt: article == null ? void 0 : article.featured_image_alt }) }),
            /* @__PURE__ */ jsxs("div", { className: "text-wrapper p-5", children: [
              /* @__PURE__ */ jsx("div", { className: "price-wrapper mb-2.5", children: /* @__PURE__ */ jsxs("div", { className: "box px-8 py-3 inline-block border border-front-red text-front-red text-front-small", children: [
                "FROM ",
                ((_a2 = article.meta_data) == null ? void 0 : _a2.start_price) ?? "IDR 123.456"
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "title-wrapper mb-6", children: /* @__PURE__ */ jsx("p", { className: "text-front-body-big font-serif", children: /* @__PURE__ */ jsx(Link, { to: generateUrl(article), children: article.title }) }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
                /* @__PURE__ */ jsxs("div", { className: "item-meta flex gap-x-5", children: [
                  /* @__PURE__ */ jsxs("div", { className: "item flex items-center gap-x-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "icon", children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", children: [
                      /* @__PURE__ */ jsx("g", { "clip-path": "url(#clip0_110_3663)", children: /* @__PURE__ */ jsx("path", { d: "M15.8346 7.75V3.33333H13.3346V5.5L10.0013 2.5L1.66797 10H4.16797V16.6667H8.33464V11.6667H11.668V16.6667H15.8346V10H18.3346L15.8346 7.75ZM8.33464 8.33333C8.33464 7.41667 9.08464 6.66667 10.0013 6.66667C10.918 6.66667 11.668 7.41667 11.668 8.33333H8.33464Z", fill: "#b56576" }) }),
                      /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", { id: "clip0_110_3663", children: /* @__PURE__ */ jsx("rect", { width: "20", height: "20", fill: "white" }) }) })
                    ] }) }),
                    /* @__PURE__ */ jsx("div", { className: "text", children: /* @__PURE__ */ jsx("p", { className: "text-front-small", children: ((_b2 = article.meta_data) == null ? void 0 : _b2.housing_type) ?? "Villa" }) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "item flex items-center gap-x-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "icon", children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", children: [
                      /* @__PURE__ */ jsx("g", { "clip-path": "url(#clip0_110_3669)", children: /* @__PURE__ */ jsx("path", { d: "M16.668 8.33329V4.16663H3.33464V8.33329H1.66797V14.1666H2.7763L3.33464 15.8333H4.16797L4.7263 14.1666H15.2846L15.8346 15.8333H16.668L17.2263 14.1666H18.3346V8.33329H16.668ZM9.16797 8.33329H5.0013V5.83329H9.16797V8.33329ZM15.0013 8.33329H10.8346V5.83329H15.0013V8.33329Z", fill: "#b56576" }) }),
                      /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", { id: "clip0_110_3669", children: /* @__PURE__ */ jsx("rect", { width: "20", height: "20", fill: "white" }) }) })
                    ] }) }),
                    /* @__PURE__ */ jsx("div", { className: "text", children: /* @__PURE__ */ jsx("p", { className: "text-front-small", children: ((_c2 = article.meta_data) == null ? void 0 : _c2.bedroom_amount) ?? "2" }) })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "item flex items-center gap-x-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "icon", children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", children: [
                      /* @__PURE__ */ jsxs("g", { "clip-path": "url(#clip0_111_3678)", children: [
                        /* @__PURE__ */ jsx("path", { d: "M5.83464 7.49996C6.75511 7.49996 7.5013 6.75377 7.5013 5.83329C7.5013 4.91282 6.75511 4.16663 5.83464 4.16663C4.91416 4.16663 4.16797 4.91282 4.16797 5.83329C4.16797 6.75377 4.91416 7.49996 5.83464 7.49996Z", fill: "#b56576" }),
                        /* @__PURE__ */ jsx("path", { d: "M16.668 10.8333V4.02496C16.668 2.72496 15.6096 1.66663 14.3096 1.66663C13.6846 1.66663 13.0846 1.91663 12.643 2.35829L11.6013 3.39996C11.468 3.35829 11.3263 3.33329 11.1763 3.33329C10.843 3.33329 10.5346 3.43329 10.2763 3.59996L12.5763 5.89996C12.743 5.64163 12.843 5.33329 12.843 4.99996C12.843 4.84996 12.818 4.71663 12.7846 4.57496L13.8263 3.53329C13.9513 3.40829 14.1263 3.33329 14.3096 3.33329C14.693 3.33329 15.0013 3.64163 15.0013 4.02496V10.8333H9.29297C9.04297 10.6583 8.81797 10.4583 8.60964 10.2333L7.44297 8.94163C7.28464 8.76663 7.08464 8.62496 6.86797 8.52496C6.60963 8.39996 6.3263 8.33329 6.03464 8.33329C5.0013 8.34163 4.16797 9.17496 4.16797 10.2083V10.8333H1.66797V17.5H3.33464V18.3333H16.668V17.5H18.3346V10.8333H16.668Z", fill: "#b56576" })
                      ] }),
                      /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", { id: "clip0_111_3678", children: /* @__PURE__ */ jsx("rect", { width: "20", height: "20", fill: "white" }) }) })
                    ] }) }),
                    /* @__PURE__ */ jsx("div", { className: "text", children: /* @__PURE__ */ jsx("p", { className: "text-front-small", children: ((_d2 = article.meta_data) == null ? void 0 : _d2.bathroom_amount) ?? "3" }) })
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "location-wrapper flex gap-x-2 items-center", children: [
                  /* @__PURE__ */ jsx("div", { className: "icon", children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "21", height: "20", viewBox: "0 0 21 20", fill: "none", children: [
                    /* @__PURE__ */ jsx("g", { "clip-path": "url(#clip0_111_4342)", children: /* @__PURE__ */ jsx("path", { d: "M10.3307 9.99996C9.41406 9.99996 8.66406 9.24996 8.66406 8.33329C8.66406 7.41663 9.41406 6.66663 10.3307 6.66663C11.2474 6.66663 11.9974 7.41663 11.9974 8.33329C11.9974 9.24996 11.2474 9.99996 10.3307 9.99996ZM10.3307 1.66663C6.83073 1.66663 3.66406 4.34996 3.66406 8.49996C3.66406 11.2666 5.88906 14.5416 10.3307 18.3333C14.7724 14.5416 16.9974 11.2666 16.9974 8.49996C16.9974 4.34996 13.8307 1.66663 10.3307 1.66663Z", fill: "#323232" }) }),
                    /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", { id: "clip0_111_4342", children: /* @__PURE__ */ jsx("rect", { width: "20", height: "20", fill: "white", transform: "translate(0.332031)" }) }) })
                  ] }) }),
                  /* @__PURE__ */ jsx("div", { className: "text-wrapper", children: /* @__PURE__ */ jsx("p", { className: "text-front-small", children: ((_e = article.meta_data) == null ? void 0 : _e.location) ?? "Ubud" }) })
                ] })
              ] })
            ] })
          ] }) });
        }) }),
        /* @__PURE__ */ jsx("div", { className: "pagination-wrapper flex justify-center gap-x-4 py-8 items-center", children: /* @__PURE__ */ jsx(RenderPagination, { page: generatePagination(currentPage, totalPages), currentPage, onClick: clickPagingHandler }) })
      ] })
    ] })
  ] });
};
export {
  Housing as default
};
