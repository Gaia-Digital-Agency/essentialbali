import { jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect, Suspense, lazy } from "react";
import { u as useRoute, c as useTaxonomies, e as useAuth } from "./TimeContext-B5j8j_GZ.js";
import { useParams } from "react-router";
import { g as getArticleBySlug } from "./article.service-DlhMD6VX.js";
import { B as BALI_AREA_OPTIONS } from "./baliAreas-aT1W4YMu.js";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
const HomeTemplate = lazy(() => import("./Trending-BuZDUftN.js").then((n) => n.e));
const Single = lazy(() => import("./Single-Di8JErrv.js"));
const Deals = lazy(() => import("./Deals-BJO2pEKT.js"));
const JobListing = lazy(() => import("./JobListing-rX3dS-W6.js"));
const Directory = lazy(() => import("./Directory-B4sojD5O.js"));
const Events = lazy(() => import("./Events-C9stgzAC.js"));
const SingleJob = lazy(() => import("./SingleJob-IW4Lx_CM.js"));
const SingleEvent = lazy(() => import("./SingleEvent-tWUyu253.js"));
const NotFound = lazy(() => import("./NotFound-Dch__mO1.js"));
const Housing = lazy(() => import("./Housing-DMdax5Ds.js"));
const Search = lazy(() => import("./Search-qKGKPuoq.js"));
const LocalBali = lazy(() => import("./LocalBali-ZypnsYbu.js"));
const parseParams = (slugs, tax) => {
  const p = { country: void 0, city: void 0, region: void 0, category: void 0 };
  const fallbackCountryBySlug = (slug) => {
    const index = BALI_AREA_OPTIONS.findIndex((area) => area.slug === slug);
    if (index === -1) return void 0;
    return { id: index + 1, slug: BALI_AREA_OPTIONS[index].slug, name: BALI_AREA_OPTIONS[index].name };
  };
  slugs.forEach((s) => {
    var _a, _b, _c, _d;
    const c = (_a = tax.countries) == null ? void 0 : _a.find((x) => x.slug == s);
    const ct = (_b = tax.cities) == null ? void 0 : _b.find((x) => x.slug == s);
    const r = (_c = tax.regions) == null ? void 0 : _c.find((x) => x.slug == s);
    const cat = (_d = tax.categories) == null ? void 0 : _d.find((x) => x.slug_title == s);
    const fallbackCountry = fallbackCountryBySlug(s);
    if (c) p.country = c;
    else if (fallbackCountry) p.country = fallbackCountry;
    else if (ct) p.city = ct;
    else if (r) p.region = r;
    else if (cat) p.category = cat;
  });
  return p;
};
const resolveRoute = async (path, tax, _userDetails) => {
  var _a, _b, _c, _d, _e;
  const slugs = path ? path.split("/").filter(Boolean) : [];
  if (slugs.length === 0) {
    return { type: "HOME", listingParams: { country: void 0, city: void 0, region: void 0, category: void 0 } };
  }
  const last = slugs[slugs.length - 1];
  const art = await getArticleBySlug(last);
  if (art) {
    const cat = (_a = tax.categories) == null ? void 0 : _a.find((x) => x.id == art.category_id);
    const listing2 = parseParams(slugs.slice(0, -1), tax);
    if ((cat == null ? void 0 : cat.slug_title) === "job-listing") {
      return { type: "ARTICLE_JOB", listingParams: { ...listing2, article: art }, articleSlug: last };
    }
    if ((cat == null ? void 0 : cat.slug_title) === "events") {
      return { type: "ARTICLE_EVENT", listingParams: { ...listing2, article: art }, articleSlug: last };
    }
    return { type: "ARTICLE_PAGE", listingParams: { ...listing2, article: art }, articleSlug: last };
  }
  const listing = parseParams(slugs, tax);
  const lp = { ...listing, article: void 0 };
  if (last === "trending") return { type: "LISTING_TRENDINGS", listingParams: lp };
  if (last === "overseas" || last === "area-highlights") return { type: "LISTING_OVERSEAS", listingParams: lp };
  if (last === "search") return { type: "LISTING_SEARCH", listingParams: lp };
  if (((_b = listing.category) == null ? void 0 : _b.slug_title) === "events") return { type: "LISTING_EVENTS", listingParams: lp };
  if (((_c = listing.category) == null ? void 0 : _c.slug_title) === "job-listing") return { type: "LISTING_JOBS", listingParams: lp };
  if (((_d = listing.category) == null ? void 0 : _d.slug_title) === "deals") return { type: "LISTING_DEALS", listingParams: lp };
  if (((_e = listing.category) == null ? void 0 : _e.slug_title) === "housing") return { type: "LISTING_HOUSING", listingParams: lp };
  if (listing.category) return { type: "LISTING_CATEGORIES", listingParams: lp };
  if (!listing.country && !listing.city && !listing.region && !listing.category) return { type: "NOT_FOUND", listingParams: lp };
  return { type: "LISTING_HOME", listingParams: lp };
};
const PathResolver = () => {
  var _a;
  const { routeType, setRouteType, setActualRoute, actualRoute, setClientChange, clientChange } = useRoute();
  const [renderState, setRenderState] = useState({ type: routeType, listingParams: actualRoute });
  const params = useParams();
  const path = params["*"];
  const { taxonomies } = useTaxonomies();
  const { userDetails } = useAuth();
  useEffect(() => {
    setClientChange(true);
  }, [path]);
  useEffect(() => {
    (async () => {
      const r = await resolveRoute(path ?? "", taxonomies);
      setRenderState(r);
      setRouteType(r.type);
      setActualRoute(r.listingParams);
    })();
  }, [path, taxonomies, userDetails, clientChange]);
  switch (routeType) {
    case "ARTICLE_JOB":
      return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(Fragment, {}), children: /* @__PURE__ */ jsx(JobListing, { children: /* @__PURE__ */ jsx(SingleJob, {}) }, "single-job") });
    case "ARTICLE_EVENT":
      return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(Fragment, {}), children: /* @__PURE__ */ jsx(SingleEvent, {}, "single-event") });
    case "ARTICLE_PAGE":
      return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(Fragment, {}), children: /* @__PURE__ */ jsx(Single, {}, "single-article") });
    case "LISTING_JOBS":
      return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(Fragment, {}), children: /* @__PURE__ */ jsx(JobListing, {}, "job-listing") });
    case "LISTING_SEARCH":
      return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(Fragment, {}), children: /* @__PURE__ */ jsx(Search, {}, "search") });
    case "LISTING_TRENDINGS":
      return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(Fragment, {}), children: /* @__PURE__ */ jsx(Directory, { isTrending: true }, "trending") });
    case "LISTING_OVERSEAS":
      return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(Fragment, {}), children: /* @__PURE__ */ jsx(LocalBali, {}, "local-bali") });
    case "LISTING_EVENTS":
      return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(Fragment, {}), children: /* @__PURE__ */ jsx(Events, {}, "events") });
    case "LISTING_DEALS":
      return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(Fragment, {}), children: /* @__PURE__ */ jsx(Deals, {}, "deals") });
    case "LISTING_CATEGORIES":
      return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(Fragment, {}), children: /* @__PURE__ */ jsx(Directory, {}, `cat-${(_a = renderState.listingParams.category) == null ? void 0 : _a.slug_title}`) });
    case "LISTING_HOUSING":
      return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(Fragment, {}), children: /* @__PURE__ */ jsx(Housing, {}, "housing") });
    case "LISTING_HOME":
    case "HOME":
      return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(Fragment, {}), children: /* @__PURE__ */ jsx(HomeTemplate, {}, "home") });
    case "LOADING":
      return null;
    default:
      return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(Fragment, {}), children: /* @__PURE__ */ jsx(NotFound, {}) });
  }
};
export {
  PathResolver as default
};
