import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { useRef, useState, useEffect } from "react";
import { u as useRoute, c as useTaxonomies, d as useHeaderContent, I as useContent, p as pkg } from "./TimeContext-B5j8j_GZ.js";
import { B as Button } from "./Button-CxQtGc7t.js";
import { u as useArticle } from "./useArticle-m4fjTi_P.js";
import { I as Image } from "./Image-Dgi2d_09.js";
import { Link } from "react-router";
import Skeleton from "react-loading-skeleton";
import { T as TextLink } from "./TextLink-DlB-UhGi.js";
import { Swiper, SwiperSlide } from "swiper/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
/* empty css                       */
import { Pagination, Navigation } from "swiper/modules";
import { N as Newsletter } from "./Newsletter-BG-n68FY.js";
import { f as formatPublished } from "./format-ChXytroW.js";
import { A as Advertisement } from "./Advertisement-CxJIGt1g.js";
import { g as getTemplateByUrl } from "./template.service-BkOXTsSh.js";
const HeroDescription = ({ children }) => {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("p", { className: "text-white text-front-subtitle mb-6", children: children || /* @__PURE__ */ jsx(Skeleton, { count: 3 }) }) });
};
const HeroTitleWrapper = (props) => {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { className: "absolute bottom-20 left-0 right-0 z-10", children: /* @__PURE__ */ jsx("div", { className: "container", children: props.children }) }) });
};
const HeroTitle = (props) => {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("h1", { className: `text-front-hero font-serif text-white ${props.className}`, children: props.children || /* @__PURE__ */ jsx(Skeleton, { count: 2 }) }) });
};
const HeroImage = ({ preContent = [], admin = false }) => {
  const { actualRoute, clientChange } = useRoute();
  const { getCityById, getCountryById, getRegionById, taxonomies } = useTaxonomies();
  const { generateContent, getPermalink, getFeaturedImageUrl } = useArticle();
  const activeAnim = useRef(null);
  const imageRef = useRef(null);
  const textRef = useRef(null);
  const navigationRef = useRef(null);
  const playControls = useRef({ play: () => {
  } });
  const CATEGORY_SLUG = "featured";
  const [content, setContent] = useState(preContent);
  const getDeepestLocation = (article) => {
    if (article.id_region) {
      return getRegionById(article.id_region);
    }
    if (article.id_city) {
      return getCityById(article.id_city);
    }
    return getCountryById(article.id_country);
  };
  useEffect(() => {
    (async () => {
      var _a, _b, _c, _d, _e;
      const get = await generateContent({
        content: preContent,
        query: {
          id_country: (_a = actualRoute == null ? void 0 : actualRoute.country) == null ? void 0 : _a.id,
          id_city: (_b = actualRoute == null ? void 0 : actualRoute.city) == null ? void 0 : _b.id,
          id_region: (_c = actualRoute == null ? void 0 : actualRoute.region) == null ? void 0 : _c.id,
          limit: 3,
          pinned: 1,
          category: (_e = (_d = taxonomies.categories) == null ? void 0 : _d.find((cat) => cat.slug_title == CATEGORY_SLUG)) == null ? void 0 : _e.id
        }
      });
      if (get) {
        setContent(get);
      } else {
        setContent([]);
      }
    })();
  }, [actualRoute, preContent, clientChange]);
  useGSAP(() => {
    if (!content.length) return;
    if (!imageRef.current) return;
    const loadingBars = gsap.utils.toArray("#hero-article .loading-bar");
    const loadingTab = gsap.utils.toArray("#hero-article .tab-content");
    const play = (index) => {
      var _a, _b, _c;
      if (activeAnim.current) {
        activeAnim.current.kill();
      }
      let currentIndex = index;
      if (currentIndex >= loadingBars.length) {
        currentIndex = 0;
      }
      gsap.set(loadingBars, {
        width: (i) => i < currentIndex ? "100%" : "0%",
        height: "1px",
        backgroundColor: "#fff"
      });
      (_a = imageRef.current) == null ? void 0 : _a.slideToLoop(currentIndex);
      (_b = textRef.current) == null ? void 0 : _b.slideToLoop(currentIndex);
      if (admin) return;
      loadingTab.forEach((bar) => {
        bar.classList.remove("active");
      });
      (_c = loadingTab[currentIndex]) == null ? void 0 : _c.classList.add("active");
      const newAnim = gsap.to(loadingBars[currentIndex], {
        width: "100%",
        duration: 6,
        ease: "none",
        onComplete: () => {
          play(currentIndex + 1);
        }
      });
      activeAnim.current = newAnim;
    };
    playControls.current.play = play;
    if (!admin) {
      play(0);
    }
    return () => {
      var _a;
      (_a = activeAnim.current) == null ? void 0 : _a.kill();
    };
  }, [content]);
  const animClickHandler = (index) => {
    playControls.current.play(index);
  };
  if (content.length) {
    return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("section", { children: /* @__PURE__ */ jsxs("div", { id: "hero-article", className: "relative", children: [
      /* @__PURE__ */ jsx(
        Swiper,
        {
          onSwiper: (swiper) => imageRef.current = swiper,
          slidesPerView: 1,
          allowTouchMove: false,
          children: content.map((item, i) => {
            if (item) {
              return /* @__PURE__ */ jsx(SwiperSlide, { children: /* @__PURE__ */ jsx(Image, { width: "1920", height: "1080", fetchPriority: i ? "low" : "high", isLazy: i ? true : false, url: getFeaturedImageUrl(item, "16_9"), ratio: "max( calc(100vh - var(--nav-height)), 750px )", mobileRatio: "150%", overlay: true, alt: item == null ? void 0 : item.featured_image_alt }) }, `image-${i}`);
            }
          })
        }
      ),
      /* @__PURE__ */ jsxs(HeroTitleWrapper, { children: [
        /* @__PURE__ */ jsx(
          Swiper,
          {
            onSwiper: (swiper) => textRef.current = swiper,
            slidesPerView: 1,
            autoHeight: true,
            noSwiping: true,
            allowTouchMove: false,
            children: content.map((item, i) => {
              if (item) {
                return /* @__PURE__ */ jsx(SwiperSlide, { children: /* @__PURE__ */ jsxs("div", { className: "md:max-w-3/4", children: [
                  /* @__PURE__ */ jsx(HeroTitle, { className: "mb-7", children: item.title }),
                  /* @__PURE__ */ jsx(HeroDescription, { children: item == null ? void 0 : item.sub_title }),
                  /* @__PURE__ */ jsx("div", { className: "button-wrapper", children: /* @__PURE__ */ jsx(Button, { uppercase: true, text: "Read More", link: admin ? void 0 : getPermalink(item) }) })
                ] }) }, `text-${i}`);
              }
            })
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-3 gap-x-8 pt-12", ref: navigationRef, children: content.map((item, i) => {
          var _a;
          if (item) {
            return /* @__PURE__ */ jsxs("div", { onClick: () => {
              animClickHandler(i);
            }, "data-index": i, className: `tab-content text-white col-span-3 md:col-span-1 cursor-pointer${i == 0 ? " active" : ""}`, children: [
              /* @__PURE__ */ jsx("div", { className: "loading-bar-wrapper relative h-[1px] mb-4", children: /* @__PURE__ */ jsx("div", { className: "loading-bar mb-2" }) }),
              /* @__PURE__ */ jsx("div", { className: "category-wrapper mb-4", children: item ? (_a = getDeepestLocation(item)) == null ? void 0 : _a.name : /* @__PURE__ */ jsx(Skeleton, {}) }),
              /* @__PURE__ */ jsx("div", { className: "title-wrapper hidden", children: (item == null ? void 0 : item.title) ? item.title : /* @__PURE__ */ jsx(Skeleton, {}) })
            ] }, `tabs-${i}`);
          }
        }) })
      ] })
    ] }) }) });
  } else {
    return /* @__PURE__ */ jsxs("div", { className: "h-screen w-screen relative", children: [
      /* @__PURE__ */ jsx(Skeleton, { className: "absolute w-full h-full inset-0" }),
      /* @__PURE__ */ jsxs(HeroTitleWrapper, { children: [
        /* @__PURE__ */ jsx(HeroTitle, {}),
        /* @__PURE__ */ jsx(HeroDescription, {})
      ] })
    ] });
  }
};
const AdminHeroImage = ({ preContent = [0, 0, 0] }) => {
  const wrapperRef = useRef(null);
  const [content, setContent] = useState([]);
  useEffect(() => {
    (async () => {
      const content2 = await generateContent({ content: preContent, admin: true });
      if (content2) {
        setContent(content2);
      }
    })();
  }, [preContent]);
  const { generateContent } = useArticle();
  if (content.length) {
    return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { ref: wrapperRef, children: /* @__PURE__ */ jsx(HeroImage, { admin: true, preContent: content }) }) });
  }
};
const MostPopular = ({ preContent }) => {
  const [content, setContent] = useState(preContent ?? []);
  const [title, setTitle] = useState("");
  const { actualRoute, clientChange } = useRoute();
  const { getPermalink, getFeaturedImageUrl, generateContent } = useArticle();
  const { taxonomies } = useTaxonomies();
  const CATEGORY_SLUG = "most-popular";
  const theCategory = () => {
    var _a;
    return (_a = taxonomies == null ? void 0 : taxonomies.categories) == null ? void 0 : _a.filter((cat) => cat.slug_title == CATEGORY_SLUG)[0];
  };
  useEffect(() => {
    (async () => {
      var _a, _b, _c, _d;
      try {
        const get = await generateContent({
          content: preContent,
          query: {
            id_country: (_a = actualRoute == null ? void 0 : actualRoute.country) == null ? void 0 : _a.id,
            id_city: (_b = actualRoute == null ? void 0 : actualRoute.city) == null ? void 0 : _b.id,
            id_region: (_c = actualRoute == null ? void 0 : actualRoute.region) == null ? void 0 : _c.id,
            limit: 8,
            category: (_d = theCategory()) == null ? void 0 : _d.id
          }
        });
        if (get) {
          setContent(get);
        }
      } catch (e) {
        console.log(e);
      }
    })();
    return;
  }, [actualRoute, preContent, clientChange]);
  useEffect(() => {
    if (actualRoute == null ? void 0 : actualRoute.region) {
      setTitle(actualRoute.region.name);
      return;
    }
    if (actualRoute == null ? void 0 : actualRoute.city) {
      setTitle(actualRoute.city.name);
      return;
    }
    if (actualRoute == null ? void 0 : actualRoute.country) {
      setTitle(actualRoute.country.name);
      return;
    }
    setTitle("Bali");
  }, [actualRoute]);
  if (content.filter(Boolean).length) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Spacer, {}),
      /* @__PURE__ */ jsx("div", { id: "most-popular", className: "bg-front-section-grey py-12", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
        /* @__PURE__ */ jsxs("div", { className: "title-wrapper mb-8 text-center", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-front-section-title font-serif text-front-grey font-semibold mb-2", children: [
            "The Most Popular Area in ",
            /* @__PURE__ */ jsx("span", { className: "text-front-red", children: title })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-front-body text-front-grey", children: "Explore diverse experiences at every destination and uncover exciting, budget-friendly adventures." })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "slider-wrapper pb-8 mb-8 relative", children: [
          /* @__PURE__ */ jsx("div", { className: "swiper-pagination" }),
          /* @__PURE__ */ jsx(
            Swiper,
            {
              slidesPerView: 1,
              spaceBetween: 10,
              modules: [Pagination],
              pagination: {
                el: "#most-popular .swiper-pagination",
                enabled: true,
                clickable: true
              },
              breakpoints: {
                768: {
                  slidesPerView: 3,
                  spaceBetween: 40
                }
              },
              children: content == null ? void 0 : content.map(
                (article) => {
                  if (article) {
                    return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(SwiperSlide, { children: /* @__PURE__ */ jsxs("div", { className: "inner", children: [
                      /* @__PURE__ */ jsx("div", { className: "image-wrapper mb-4", children: /* @__PURE__ */ jsx(Image, { url: getFeaturedImageUrl(article), ratio: "145%", link: getPermalink(article), alt: article == null ? void 0 : article.featured_image_alt }) }),
                      /* @__PURE__ */ jsx("div", { className: "text-wrapper", children: /* @__PURE__ */ jsxs(Link, { to: getPermalink(article), children: [
                        /* @__PURE__ */ jsx("div", { className: "title mb-2", children: /* @__PURE__ */ jsx("p", { className: "font-serif text-front-article-title", children: article.title }) }),
                        /* @__PURE__ */ jsx("div", { className: "subtitle", children: /* @__PURE__ */ jsx("p", { className: "text-front-body-big", children: article.sub_title }) })
                      ] }) })
                    ] }) }) });
                  }
                }
              )
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "button-wrapper text-center", children: /* @__PURE__ */ jsx(Button, { text: "VIEW ALL", link: `${(actualRoute == null ? void 0 : actualRoute.country) ? `/${actualRoute.country.slug}` : ""}${(actualRoute == null ? void 0 : actualRoute.city) ? `/${actualRoute.city.slug}` : ""}${(actualRoute == null ? void 0 : actualRoute.region) ? `/${actualRoute.region.slug}` : ""}/${CATEGORY_SLUG}` }) })
      ] }) }),
      /* @__PURE__ */ jsx(Spacer, {})
    ] });
  } else {
    return /* @__PURE__ */ jsx(Fragment, {});
  }
};
const AdminMostPopular = ({ preContent }) => {
  const [content, setContent] = useState();
  const { generateContent } = useArticle();
  useEffect(() => {
    (async () => {
      const get = await generateContent({
        content: preContent,
        admin: true
      });
      if (get) {
        setContent(get);
      }
    })();
  }, []);
  if (content) {
    return /* @__PURE__ */ jsx(MostPopular, { preContent: content, admin: true });
  }
};
const UltimateGuide = ({ preContent }) => {
  const { actualRoute, clientChange } = useRoute();
  const { taxonomies } = useTaxonomies();
  const [content, setContent] = useState(preContent);
  const { generateContent, getPermalink, getFeaturedImageUrl } = useArticle();
  const CATEGORY_SLUG = "ultimate-guide";
  const theCategory = () => {
    var _a;
    return (_a = taxonomies == null ? void 0 : taxonomies.categories) == null ? void 0 : _a.find((cat) => cat.slug_title == CATEGORY_SLUG);
  };
  useEffect(() => {
    (async () => {
      var _a, _b, _c, _d;
      try {
        const get = await generateContent({
          content: preContent,
          query: {
            id_country: (_a = actualRoute == null ? void 0 : actualRoute.country) == null ? void 0 : _a.id,
            id_city: (_b = actualRoute == null ? void 0 : actualRoute.city) == null ? void 0 : _b.id,
            id_region: (_c = actualRoute == null ? void 0 : actualRoute.region) == null ? void 0 : _c.id,
            category: (_d = theCategory()) == null ? void 0 : _d.id,
            limit: 6
          }
        });
        if (get) {
          setContent(get);
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }, [actualRoute, clientChange]);
  return /* @__PURE__ */ jsx(Fragment, { children: content && !!content.filter(Boolean).length && /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Spacer, {}),
    /* @__PURE__ */ jsx("section", { id: "ultimate-guide", children: /* @__PURE__ */ jsxs("div", { className: "md:container px-0 md:px-7", children: [
      /* @__PURE__ */ jsx("div", { className: "title-wrapper text-center mb-8", children: /* @__PURE__ */ jsx("p", { className: "font-serif font-semibold text-front-section-title text-front-grey", children: "Latest Ultimate Guides" }) }),
      /* @__PURE__ */ jsxs("div", { className: "slider-wrapper pb-8 mb-8 relative", children: [
        /* @__PURE__ */ jsx("div", { className: "swiper-pagination" }),
        /* @__PURE__ */ jsxs(
          Swiper,
          {
            slidesPerView: 1,
            modules: [Pagination, Navigation],
            pagination: {
              el: "#ultimate-guide .swiper-pagination",
              enabled: true,
              clickable: true
            },
            navigation: {
              nextEl: "#ultimate-guide .next-button",
              prevEl: "#ultimate-guide .prev-button",
              enabled: true
            },
            breakpoints: {
              1024: {
                // autoHeight: auyoH
              }
            },
            children: [
              content == null ? void 0 : content.map((article, i) => {
                if (article) {
                  return /* @__PURE__ */ jsx(SwiperSlide, { children: /* @__PURE__ */ jsx("div", { className: "inner", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12", children: [
                    /* @__PURE__ */ jsx("div", { className: "lg:col-span-6 col-span-12 h-full lg:order-1 order-2", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full justify-center items-center bg-[#000] md:px-14 py-10 lg:py-0", children: [
                      /* @__PURE__ */ jsx("div", { className: "category-wrapper text-center pb-6 md:mb-6 mb-4", children: /* @__PURE__ */ jsx("p", { className: "text-front-body text-white before-red-line", children: "ULTIMATE GUIDE" }) }),
                      /* @__PURE__ */ jsx("div", { className: "title-wrapper text-center mb-3", children: /* @__PURE__ */ jsx("p", { className: "text-front-main-title font-serif text-white", children: article.title }) }),
                      /* @__PURE__ */ jsx("div", { className: "subtitle-wrapper text-center mb-4", children: /* @__PURE__ */ jsx("p", { className: "text-front-body-big text-white", children: article.sub_title }) }),
                      /* @__PURE__ */ jsx("div", { className: "text-link-wrapper", children: /* @__PURE__ */ jsx(TextLink, { text: "Read More", uppercase: true, color: "white", link: getPermalink(article) }) })
                    ] }) }),
                    /* @__PURE__ */ jsx("div", { className: "lg:col-span-6 col-span-12 lg:order-2 order-1", children: /* @__PURE__ */ jsx("div", { className: "image-wrapper", children: /* @__PURE__ */ jsx(Image, { url: getFeaturedImageUrl(article), link: getPermalink(article), ratio: "100%", alt: article == null ? void 0 : article.featured_image_alt }) }) })
                  ] }) }) }, `ultimate-guide-${i}`);
                }
              }),
              /* @__PURE__ */ jsxs("div", { className: "swiper-navigation", children: [
                /* @__PURE__ */ jsx("div", { className: "prev-button cursor-pointer absolute top-1/2 -translate-y-1/2 left-0 z-10", children: /* @__PURE__ */ jsx("div", { className: "inner w-[32px] h-[32px] flex justify-center items-center bg-front-red", children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "8", height: "12", viewBox: "0 0 8 12", fill: "none", style: { rotate: "180deg" }, children: /* @__PURE__ */ jsx("path", { d: "M0.589844 10.59L5.16984 6L0.589844 1.41L1.99984 0L7.99984 6L1.99984 12L0.589844 10.59Z", fill: "#fff" }) }) }) }),
                /* @__PURE__ */ jsx("div", { className: "next-button cursor-pointer absolute top-1/2 -translate-y-1/2 right-0 z-10", children: /* @__PURE__ */ jsx("div", { className: "inner w-[32px] h-[32px] flex justify-center items-center bg-front-red", children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "8", height: "12", viewBox: "0 0 8 12", fill: "none", children: /* @__PURE__ */ jsx("path", { d: "M0.589844 10.59L5.16984 6L0.589844 1.41L1.99984 0L7.99984 6L1.99984 12L0.589844 10.59Z", fill: "#fff" }) }) }) })
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "button-wrapper text-center py-6", children: /* @__PURE__ */ jsx(Button, { text: "VIEW ALL", link: `${(actualRoute == null ? void 0 : actualRoute.country) ? `/${actualRoute.country.slug}` : ""}${(actualRoute == null ? void 0 : actualRoute.city) ? `/${actualRoute.city.slug}` : ""}${(actualRoute == null ? void 0 : actualRoute.region) ? `/${actualRoute.region.slug}` : ""}/${CATEGORY_SLUG}` }) })
    ] }) })
  ] }) });
};
const AdminUltimateGuide = ({ preContent }) => {
  const [content, setContent] = useState([]);
  const { generateContent } = useArticle();
  useEffect(() => {
    (async () => {
      const get = await generateContent({
        content: preContent,
        admin: true
      });
      if (get) {
        setContent(get);
      }
    })();
  }, [preContent]);
  if (content.length) {
    return /* @__PURE__ */ jsx(UltimateGuide, { preContent: content, admin: true });
  }
};
const LocalBali = ({ preContent = [] }) => {
  const { actualRoute, clientChange } = useRoute();
  const { taxonomies, getCategoryById } = useTaxonomies();
  const CATEGORY_SLUGS = ["area-highlights", "ultimate-guide", "featured"];
  const { generateContent, getPermalink, getFeaturedImageUrl } = useArticle();
  const [content, setContent] = useState(preContent);
  const findCategory = (article) => {
    return getCategoryById(article.category_id);
  };
  useEffect(() => {
    (async () => {
      var _a, _b;
      try {
        const filterCountry = (_a = taxonomies == null ? void 0 : taxonomies.countries) == null ? void 0 : _a.filter((country) => {
          var _a2;
          return ((_a2 = actualRoute == null ? void 0 : actualRoute.country) == null ? void 0 : _a2.id) != country.id;
        }).map((country) => country.id);
        const get = await generateContent({
          content: preContent,
          query: {
            id_country: filterCountry,
            limit: 8,
            category: (_b = taxonomies.categories) == null ? void 0 : _b.filter((item) => CATEGORY_SLUGS.includes(item.slug_title)).map((cat) => cat.id)
          }
        });
        if (get) {
          setContent(get);
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }, [actualRoute, preContent, clientChange]);
  return /* @__PURE__ */ jsx(Fragment, { children: !!content.filter(Boolean).length && /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Spacer, {}),
    /* @__PURE__ */ jsx("section", { id: "area-highlights", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
      /* @__PURE__ */ jsx("div", { className: "title-wrapper text-center mb-8", children: /* @__PURE__ */ jsx("p", { className: "text-front-section-title font-serif font-semibold", children: /* @__PURE__ */ jsx("span", { className: "text-front-red", children: "Bali News" }) }) }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-12 md:gap-x-10 gap-y-10 gap-x-6 md:mb-10 mb-12 overflow-x-hidden", children: content == null ? void 0 : content.map((article) => {
        var _a;
        if (article) {
          return /* @__PURE__ */ jsxs("div", { className: `md:col-span-6 lg:col-span-3 col-span-12 line-right-5 relative`, children: [
            /* @__PURE__ */ jsx("div", { className: "image-wrapper mb-5", children: /* @__PURE__ */ jsx(Image, { url: getFeaturedImageUrl(article), ratio: "100%", mobileRatio: "125%", link: getPermalink(article), alt: article == null ? void 0 : article.featured_image_alt }) }),
            /* @__PURE__ */ jsx("div", { className: "category-wrapper mb-2", children: /* @__PURE__ */ jsx("p", { className: "text-front-grey", children: (_a = findCategory(article)) == null ? void 0 : _a.title }) }),
            /* @__PURE__ */ jsx("div", { className: "title-wrapper", children: /* @__PURE__ */ jsx(Link, { to: getPermalink(article), children: /* @__PURE__ */ jsx("p", { className: "text-front-title text-front-grey font-serif", children: article.title }) }) })
          ] }, "area-highlights-" + article.id);
        }
      }) }),
      /* @__PURE__ */ jsx("div", { className: "button-wrapper text-center", children: /* @__PURE__ */ jsx(Button, { text: "VIEW ALL", link: `${(actualRoute == null ? void 0 : actualRoute.country) ? `/${actualRoute.country.slug}` : ""}${(actualRoute == null ? void 0 : actualRoute.city) ? `/${actualRoute.city.slug}` : ""}${(actualRoute == null ? void 0 : actualRoute.region) ? `/${actualRoute.region.slug}` : ""}/area-highlights` }) })
    ] }) }),
    /* @__PURE__ */ jsx(Spacer, {})
  ] }) });
};
const EventsHome = ({ preContent = [] }) => {
  const [content, setContent] = useState(preContent);
  const { actualRoute, clientChange } = useRoute();
  const { taxonomies } = useTaxonomies();
  const { generateContent, getPermalink, getFeaturedImageUrl } = useArticle();
  const CATEGORY_SLUG = "events";
  useEffect(() => {
    (async () => {
      var _a, _b, _c, _d, _e;
      try {
        const get = await generateContent({
          content: preContent,
          query: {
            id_country: (_a = actualRoute == null ? void 0 : actualRoute.country) == null ? void 0 : _a.id,
            id_city: (_b = actualRoute == null ? void 0 : actualRoute.city) == null ? void 0 : _b.id,
            id_region: (_c = actualRoute == null ? void 0 : actualRoute.region) == null ? void 0 : _c.id,
            limit: 4,
            category: (_e = (_d = taxonomies == null ? void 0 : taxonomies.categories) == null ? void 0 : _d.find((cat) => cat.slug_title == CATEGORY_SLUG)) == null ? void 0 : _e.id
          }
        });
        if (get) {
          setContent(get);
        } else {
          setContent([]);
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }, [actualRoute, preContent, clientChange]);
  return /* @__PURE__ */ jsx(Fragment, { children: !!content.filter(Boolean).length && /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Spacer, {}),
    /* @__PURE__ */ jsx("section", { id: "events", children: /* @__PURE__ */ jsxs("div", { className: "container", children: [
      /* @__PURE__ */ jsx("div", { className: "title-wrapper text-center mb-8", children: /* @__PURE__ */ jsx("p", { className: "text-front-section-title font-serif font-semibold", children: "Events You Shouldnt Miss" }) }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-12 md:gap-x-10 gap-y-10 mb-6 md:mb-4 overflow-x-hidden", children: content == null ? void 0 : content.map((article) => {
        var _a;
        if (article) {
          return /* @__PURE__ */ jsx("div", { className: "md:col-span-6 lg:col-span-3 col-span-12 line-right-5 relative", children: /* @__PURE__ */ jsxs("div", { className: "inner grid grid-cols-12 gap-x-6 md:gap-x-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "col-span-6 md:col-span-12", children: [
              /* @__PURE__ */ jsxs("div", { className: "date pb-4 flex gap-x-2", children: [
                /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "15", height: "14", viewBox: "0 0 15 14", fill: "none", children: [
                  /* @__PURE__ */ jsx("path", { d: "M1.125 4.14229C1.125 3.17103 1.91236 2.38367 2.88362 2.38367H12.1164C13.0877 2.38367 13.875 3.17103 13.875 4.14229V11.6164C13.875 12.5877 13.0877 13.375 12.1164 13.375H2.88362C1.91236 13.375 1.125 12.5877 1.125 11.6164V4.14229Z", stroke: "#7F7F7F", strokeWidth: "0.9", strokeLinecap: "round", strokeLinejoin: "round" }),
                  /* @__PURE__ */ jsx("path", { d: "M3.98267 0.624878V3.70246", stroke: "#7F7F7F", strokeWidth: "0.9", strokeLinecap: "round", strokeLinejoin: "round" }),
                  /* @__PURE__ */ jsx("path", { d: "M11.0173 0.624878V3.70246", stroke: "#7F7F7F", strokeWidth: "0.9", strokeLinecap: "round", strokeLinejoin: "round" }),
                  /* @__PURE__ */ jsx("path", { d: "M3.76294 5.90027H11.2371", stroke: "#7F7F7F", strokeWidth: "0.9", strokeLinecap: "round", strokeLinejoin: "round" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-front-small text-front-soft-gray", children: formatPublished((_a = article == null ? void 0 : article.meta_data) == null ? void 0 : _a.start_date) ?? "TBA" })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "image-wrapper md:mb-4", children: /* @__PURE__ */ jsx(Image, { url: getFeaturedImageUrl(article), ratio: "100%", link: getPermalink(article), alt: article == null ? void 0 : article.featured_image_alt }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "col-span-6 md:col-span-12", children: [
              /* @__PURE__ */ jsx("div", { className: "title-wrapper mb-4", children: /* @__PURE__ */ jsx(Link, { to: getPermalink(article), children: /* @__PURE__ */ jsx("p", { className: "text-front-title text-front-grey font-serif", children: article.title }) }) }),
              /* @__PURE__ */ jsx("div", { className: "link-text-wrapper", children: /* @__PURE__ */ jsx(TextLink, { text: "Read More", uppercase: true, color: "gray", link: getPermalink(article) }) })
            ] })
          ] }) }, `events-home-${article.id}`);
        }
      }) }),
      /* @__PURE__ */ jsx("div", { className: "button-wrapper text-center py-6", children: /* @__PURE__ */ jsx(Button, { text: "VIEW ALL", link: `${(actualRoute == null ? void 0 : actualRoute.country) ? `/${actualRoute.country.slug}` : ""}${(actualRoute == null ? void 0 : actualRoute.city) ? `/${actualRoute.city.slug}` : ""}${(actualRoute == null ? void 0 : actualRoute.region) ? `/${actualRoute.region.slug}` : ""}/${CATEGORY_SLUG}` }) })
    ] }) })
  ] }) });
};
const AdminEventsHome = ({ preContent }) => {
  const [content, setContent] = useState([]);
  const { generateContent } = useArticle();
  useEffect(() => {
    (async () => {
      const get = await generateContent({
        content: preContent,
        admin: true
      });
      if (get) {
        setContent(get);
      }
    })();
  }, [preContent]);
  if (content.length) {
    return /* @__PURE__ */ jsx(EventsHome, { preContent: content, admin: true });
  }
};
const BRAND_LOGO_PATH = "/logo.png";
const About = () => {
  var _a;
  const { initialData } = useHeaderContent();
  const [content, setContent] = useState(initialData == null ? void 0 : initialData.about);
  useEffect(() => {
    if (!content) {
      (async () => {
        var _a2;
        try {
          const getTemplate = await getTemplateByUrl("/about");
          if ((getTemplate == null ? void 0 : getTemplate.status_code) == 200 && ((_a2 = getTemplate.data) == null ? void 0 : _a2.content)) {
            setContent(JSON.parse(getTemplate.data.content));
          }
        } catch (e) {
          console.log("Error fetching about template:", e);
        }
      })();
    }
  }, []);
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { className: "container pb-16 mb-12 border-b border-[#5F5F5F]", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 md:gap-x-10 gap-y-10 items-center", children: [
    /* @__PURE__ */ jsxs("div", { className: "md:col-span-6 col-span-12 md:order-1 order-2", children: [
      /* @__PURE__ */ jsx("div", { className: "title-wrapper mb-3", children: /* @__PURE__ */ jsx("p", { className: "font-serif font-semibold text-front-section-title", children: (content == null ? void 0 : content.title) ?? /* @__PURE__ */ jsx(Skeleton, {}) }) }),
      /* @__PURE__ */ jsx("div", { className: "description-wrapper", children: /* @__PURE__ */ jsx("p", { className: "text-front-body-big", children: (content == null ? void 0 : content.description) ?? /* @__PURE__ */ jsx(Skeleton, {}) }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "md:col-span-6 col-span-12 md:order-2 order-1", children: /* @__PURE__ */ jsx("div", { className: "image-wrapper", children: /* @__PURE__ */ jsx(
      Image,
      {
        url: BRAND_LOGO_PATH,
        alt: ((_a = content == null ? void 0 : content.image) == null ? void 0 : _a.alt) ?? "essentialbali",
        fit: "contain",
        noRatio: true
      }
    ) }) })
  ] }) }) });
};
const HomeTemplate$1 = {
  heroImage: {
    articles: [0, 0, 0],
    rules: {
      limit: 3
    },
    query: {
      useRoute: true,
      pinned: 1,
      category: {
        slug: "featured"
      }
    }
  },
  trending: {
    articles: [0, 0, 0, 0, 0],
    rules: {
      limit: 5
    },
    query: {
      useRoute: true,
      category: {
        exclude_slugs: ["most-popular", "ultimate-guide", "events"]
      }
    }
  },
  mostPopular: {
    articles: [0, 0, 0, 0, 0, 0, 0, 0],
    rules: {
      limit: 8
    },
    query: {
      useRoute: true,
      category: {
        slug: "most-popular"
      }
    }
  },
  events: {
    articles: [0, 0, 0, 0],
    rules: {
      limit: 4
    },
    query: {
      useRoute: true,
      category: {
        slug: "events"
      }
    }
  },
  ultimateGuide: {
    articles: [0, 0, 0, 0, 0, 0],
    rules: {
      limit: 6
    },
    query: {
      useRoute: true,
      category: {
        slug: "ultimate-guide"
      }
    }
  },
  overseas: {
    articles: [0, 0, 0, 0, 0, 0, 0, 0],
    rules: {
      limit: 8
    },
    query: {
      useRoute: false
    }
  }
};
const { Helmet } = pkg;
const SITE_URL = "http://34.124.244.233/essentialbali";
const Spacer = () => /* @__PURE__ */ jsx("div", { className: "spacer md:py-12 py-6" });
const HomeTemplate = () => {
  const { initialData } = useContent();
  const [content, setContent] = useState((initialData == null ? void 0 : initialData.template) ?? HomeTemplate$1);
  const [isReady, setIsReady] = useState(true);
  const { actualRoute, clientChange } = useRoute();
  const isLocation = (actualRoute == null ? void 0 : actualRoute.country) || (actualRoute == null ? void 0 : actualRoute.city) || (actualRoute == null ? void 0 : actualRoute.region);
  useEffect(() => {
    setIsReady(false);
    (async () => {
      var _a;
      try {
        const _urlToGet = isLocation ? `${(actualRoute == null ? void 0 : actualRoute.country) ? `/${actualRoute.country.slug}` : ""}${(actualRoute == null ? void 0 : actualRoute.city) ? `/${actualRoute.city.slug}` : ""}${(actualRoute == null ? void 0 : actualRoute.region) ? `/${actualRoute.region.slug}` : ""}` : "/";
        const urlToGet = `/v2${_urlToGet}`;
        const getTemplate = await getTemplateByUrl(urlToGet);
        if (((_a = getTemplate == null ? void 0 : getTemplate.data) == null ? void 0 : _a.content) && getTemplate.status_code == 200) {
          setContent(JSON.parse(getTemplate.data.content));
        } else {
          setContent(HomeTemplate$1);
        }
        setIsReady(true);
      } catch (e) {
        console.log(e);
        setIsReady(true);
        setContent(HomeTemplate$1);
      }
    })();
  }, [actualRoute, clientChange]);
  const heroImage = content.heroImage ? content.heroImage.articles : [0, 0, 0];
  const trending = content.trending ? content.trending.articles : [0, 0, 0, 0, 0];
  const mostPopular = content.mostPopular ? content.mostPopular.articles : [0, 0, 0, 0, 0, 0, 0, 0];
  const events = content.events ? content.events.articles : [0, 0, 0, 0];
  const ultimateGuide = content.ultimateGuide ? content.ultimateGuide.articles : [0, 0, 0, 0, 0, 0];
  const overseas = content.overseas ? content.overseas.articles : [0, 0, 0, 0, 0, 0, 0, 0];
  const getDeepestLocation = () => {
    if (actualRoute.region) return actualRoute.region.name;
    if (actualRoute.city) return actualRoute.city.name;
    if (actualRoute.country) return actualRoute.country.name;
    return "Home";
  };
  const getHelmet = () => {
    return /* @__PURE__ */ jsxs(Helmet, { children: [
      /* @__PURE__ */ jsxs("title", { children: [
        getDeepestLocation(),
        " - essentialbali"
      ] }),
      /* @__PURE__ */ jsx("meta", { name: "description", content: "essentialbali is the ultimate Bali area guide for travelers, expats, and locals, featuring the best dining, events, schools, wellness, and travel in Bali" }),
      /* @__PURE__ */ jsx("link", { rel: "canonical", href: SITE_URL }),
      /* @__PURE__ */ jsx("meta", { property: "og:type", content: "website" }),
      /* @__PURE__ */ jsx("meta", { property: "og:title", content: "Home - essentialbali" }),
      /* @__PURE__ */ jsx("meta", { property: "og:description", content: "essentialbali is the ultimate Bali area guide for travelers, expats, and locals, featuring the best dining, events, schools, wellness, and travel in Bali" }),
      /* @__PURE__ */ jsx("meta", { property: "og:url", content: SITE_URL }),
      /* @__PURE__ */ jsx("meta", { property: "og:site_name", content: "essentialbali" })
    ] });
  };
  if (!isReady) return /* @__PURE__ */ jsx(Fragment, { children: getHelmet() });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    getHelmet(),
    /* @__PURE__ */ jsx(HeroImage, { preContent: heroImage }),
    /* @__PURE__ */ jsx(Spacer, {}),
    /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsx(Advertisement, {}) }),
    /* @__PURE__ */ jsx(Trending, { preContent: trending }),
    isLocation && /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(MostPopular, { preContent: mostPopular }) }),
    /* @__PURE__ */ jsx(EventsHome, { preContent: events }),
    /* @__PURE__ */ jsx(UltimateGuide, { preContent: ultimateGuide }),
    /* @__PURE__ */ jsx(LocalBali, { preContent: overseas }),
    /* @__PURE__ */ jsxs("div", { className: "outer bg-front-section-grey", children: [
      /* @__PURE__ */ jsx(Spacer, {}),
      /* @__PURE__ */ jsx(About, {}),
      /* @__PURE__ */ jsx(Newsletter, {}),
      /* @__PURE__ */ jsx(Spacer, {})
    ] })
  ] });
};
const Home = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Spacer,
  default: HomeTemplate
}, Symbol.toStringTag, { value: "Module" }));
const Trendings = ({ content, admin = false }) => {
  const { getCityById, getCountryById } = useTaxonomies();
  const { getFeaturedImageUrl, getPermalink } = useArticle();
  const renderArticle = (article, i) => {
    var _a, _b;
    if (article) {
      return /* @__PURE__ */ jsx("div", { className: `md:col-span-6 lg:col-span-3 col-span-12 relative${i + 1 < content.length ? " line-right-5" : ""}`, children: /* @__PURE__ */ jsxs("div", { className: "inner grid grid-cols-12 gap-x-6 md:gap-x-0", children: [
        /* @__PURE__ */ jsx("div", { className: "col-span-6 md:col-span-12", children: /* @__PURE__ */ jsx("div", { className: "image-wrapper md:mb-10", children: /* @__PURE__ */ jsx(Image, { url: getFeaturedImageUrl(article), ratio: "100%", link: admin ? void 0 : getPermalink(article), alt: article == null ? void 0 : article.featured_image_alt }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "col-span-6 md:col-span-12", children: [
          /* @__PURE__ */ jsx("div", { className: "location-wrapper mb-2", children: /* @__PURE__ */ jsx("p", { className: "text-front-body text-front-red", children: getCityById(article == null ? void 0 : article.id_city) ? (_a = getCityById(article.id_city)) == null ? void 0 : _a.name : (_b = getCountryById(article.id_country)) == null ? void 0 : _b.name }) }),
          /* @__PURE__ */ jsx("div", { className: "text-wrapper", children: /* @__PURE__ */ jsx(Link, { to: admin ? "" : getPermalink(article), children: /* @__PURE__ */ jsx("p", { className: "text-front-title font-serif", children: article.title }) }) })
        ] })
      ] }) }, `trendings-${i}`);
    } else {
      return /* @__PURE__ */ jsx(Fragment, {});
    }
  };
  if (content) {
    return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-12 md:gap-x-10 gap-y-10 md:overflow-x-hidden md:overflow-y-visible pb-2 py-8 md:py-0", children: content.map((article, i) => {
      return renderArticle(article, i);
    }) }) }) });
  } else {
    return /* @__PURE__ */ jsxs("div", { className: "container", children: [
      "asd",
      [{}, {}, {}, {}].map(() => /* @__PURE__ */ jsx(Skeleton, { count: 2 }))
    ] });
  }
};
const TrendingMain = ({ content, admin = false }) => {
  var _a, _b;
  const { getCategoryById } = useTaxonomies();
  const { getPermalink, getFeaturedImageUrl } = useArticle();
  const getCategory = (id) => {
    return getCategoryById(id);
  };
  if (content) {
    return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "md:container mx-auto !px-0 md:!px-7", children: [
      /* @__PURE__ */ jsx("div", { className: "title-wrapper text-center mb-8", children: /* @__PURE__ */ jsxs("h3", { className: "text-front-section-title font-serif font-semibold", children: [
        "Trending in ",
        /* @__PURE__ */ jsx("span", { className: "text-front-red", children: "Bali" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "trending-main-wrapper md:mb-6", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 items-center", children: [
        /* @__PURE__ */ jsx("div", { className: "md:col-span-6 col-span-12", children: /* @__PURE__ */ jsx("div", { className: "image-wrapper", children: /* @__PURE__ */ jsx(Image, { url: getFeaturedImageUrl(content), ratio: "100%", link: admin ? void 0 : getPermalink(content), alt: content == null ? void 0 : content.featured_image_alt }) }) }),
        /* @__PURE__ */ jsx("div", { className: "md:col-span-6 col-span-12 h-full", children: /* @__PURE__ */ jsxs("div", { className: "text-wrapper px-10 py-8 text-center h-full flex flex-col justify-center bg-front-light-grey", children: [
          /* @__PURE__ */ jsx("div", { className: "category-wrapper mb-6", children: /* @__PURE__ */ jsx(Link, { to: admin ? "" : `${(_a = getCategory(content.category_id)) == null ? void 0 : _a.slug_title}`, children: /* @__PURE__ */ jsx("p", { className: "text-front-body text-front-red uppercase before-red-line inline", children: (_b = getCategory(content.category_id)) == null ? void 0 : _b.title }) }) }),
          /* @__PURE__ */ jsx("div", { className: "article-title-wrapper mb-3", children: /* @__PURE__ */ jsx(Link, { to: admin ? "" : getPermalink(content), children: /* @__PURE__ */ jsx("p", { className: "text-front-black text-front-main-title font-serif", children: content.title }) }) }),
          /* @__PURE__ */ jsx("div", { className: "article-description-wrapper mb-3", children: /* @__PURE__ */ jsx(Link, { to: admin ? "" : getPermalink(content), children: /* @__PURE__ */ jsx("p", { className: "text-front-black text-front-body-big", children: content.sub_title }) }) }),
          /* @__PURE__ */ jsx("div", { className: "text-link-wrapper", children: /* @__PURE__ */ jsx(TextLink, { text: "Read More", uppercase: true, link: admin ? "" : getPermalink(content) }) })
        ] }) })
      ] }) })
    ] }) });
  } else {
    return /* @__PURE__ */ jsx(Fragment, {});
  }
};
const Trending = ({ preContent = [0, 0, 0, 0, 0], admin = false }) => {
  const { actualRoute, clientChange } = useRoute();
  const [content, setContent] = useState(preContent);
  const { generateContent } = useArticle();
  useEffect(() => {
    (async () => {
      var _a, _b, _c;
      const theContent = await generateContent({
        content: preContent,
        query: {
          id_country: (_a = actualRoute == null ? void 0 : actualRoute.country) == null ? void 0 : _a.id,
          id_city: (_b = actualRoute == null ? void 0 : actualRoute.city) == null ? void 0 : _b.id,
          id_region: (_c = actualRoute == null ? void 0 : actualRoute.region) == null ? void 0 : _c.id,
          limit: 5,
          isTrending: true,
          exclude_category: ["most-popular", "ultimate-guide", "events"]
        }
      });
      if (theContent) {
        setContent(theContent);
      } else {
        setContent([]);
      }
    })();
  }, [actualRoute, preContent, clientChange]);
  return /* @__PURE__ */ jsx(Fragment, { children: !!content.filter(Boolean).length && /* @__PURE__ */ jsxs("section", { id: "trending", children: [
    /* @__PURE__ */ jsx(Spacer, {}),
    /* @__PURE__ */ jsx(TrendingMain, { content: content[0] }),
    /* @__PURE__ */ jsx(Trendings, { content: content.slice(1) }),
    /* @__PURE__ */ jsx("div", { className: "button-wrapper text-center py-6", children: /* @__PURE__ */ jsx(Button, { text: "View All", uppercase: true, link: admin ? void 0 : `${(actualRoute == null ? void 0 : actualRoute.country) ? `/${actualRoute.country.slug}` : ""}${(actualRoute == null ? void 0 : actualRoute.city) ? `/${actualRoute.city.slug}` : ""}${(actualRoute == null ? void 0 : actualRoute.region) ? `/${actualRoute.region.slug}` : ""}/trending` }) })
  ] }) });
};
const AdminTrending = ({ preContent = [0, 0, 0, 0, 0] }) => {
  const [content, setContent] = useState([]);
  const { generateContent } = useArticle();
  useEffect(() => {
    (async () => {
      const theContent = await generateContent({ content: preContent, admin: true });
      setContent(theContent);
    })();
  }, [preContent]);
  if (content.length) {
    return /* @__PURE__ */ jsx(Trending, { preContent: content, admin: true });
  }
};
export {
  AdminHeroImage as A,
  HomeTemplate$1 as H,
  AdminTrending as a,
  AdminMostPopular as b,
  AdminEventsHome as c,
  AdminUltimateGuide as d,
  Home as e
};
