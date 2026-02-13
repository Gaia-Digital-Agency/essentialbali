import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { useViewTransitionState, Link } from "react-router";
import { u as useRoute, i as useNotification, p as pkg } from "./TimeContext-B5j8j_GZ.js";
import { I as Image } from "./Image-Dgi2d_09.js";
import { g as getCurrencySymbol } from "./format-ChXytroW.js";
import { I as Input } from "./InputField-CcQ93cDN.js";
import { B as Button } from "./Button-CxQtGc7t.js";
import PhoneInput from "react-phone-number-input";
import { a as applyJob } from "./job.service-BirsFooS.js";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "gsap";
import "@gsap/react";
import "react-router-dom";
import "date-fns";
const { Helmet } = pkg;
const SITE_URL = "http://34.124.244.233/essentialbali";
const IMAGE_URL = "https://storage.googleapis.com/gda-s01-bucket/essentialbali";
const TagsBox = ({ text }) => {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { className: "px-2.5 py-1.5 bg-[#eee]", children: /* @__PURE__ */ jsx("p", { className: "font-medium text-[#202020]", children: text }) }) });
};
const SingleJob = () => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
  const { actualRoute } = useRoute();
  const [content, setContent] = useState();
  const [transition, setTransition] = useState(false);
  const [email, setEmail] = useState();
  const [phone, setPhone] = useState();
  const [cv, setCv] = useState();
  const errorRef = useRef(null);
  const cvRef = useRef(null);
  const { setNotification } = useNotification();
  const ALLOWED_EXTENSION = ["pdf", "png", "jpg", "jpeg", "txt"];
  useEffect(() => {
    (async () => {
      if (!actualRoute.article) return;
      setContent(actualRoute.article);
    })();
  }, [actualRoute]);
  let metadata;
  if (typeof (content == null ? void 0 : content.meta_data) == "string") {
    metadata = JSON.parse(content.meta_data);
  } else {
    metadata = content == null ? void 0 : content.meta_data;
  }
  const salaryTime = () => {
    const salary = metadata == null ? void 0 : metadata.salary_time;
    if (salary) {
      return `${salary}`.slice(0, 1);
    }
    return "m";
  };
  const toBack = "..";
  const isTransitioning = useViewTransitionState(toBack, { relative: "path" });
  useEffect(() => {
    if (transition) return;
    if (isTransitioning) {
      setTransition(true);
    }
  }, [isTransitioning]);
  const errorApplyHandler = (type) => {
    const errorEl = errorRef.current;
    if (errorEl) {
      if (type == "email") {
        errorEl.innerHTML = "Email is needed";
        return;
      }
      if (type == "cv") {
        errorEl.innerHTML = "CV is needed";
        return;
      }
      if (type == "phone") {
        errorEl.innerHTML = "Phone number is neeeded";
      }
    }
  };
  const clearError = () => {
    const errorEl = errorRef.current;
    if (errorEl) {
      errorEl.innerHTML = "";
    }
  };
  const applyHandler = async () => {
    var _a2, _b2;
    if (!email) {
      errorApplyHandler("email");
      return;
    }
    if (!phone) {
      errorApplyHandler("phone");
      return;
    }
    if (!cv) {
      errorApplyHandler("cv");
      return;
    }
    if ((_a2 = actualRoute.article) == null ? void 0 : _a2.id) {
      const apply = await applyJob((_b2 = actualRoute.article) == null ? void 0 : _b2.id, { applicant_email: email, phone, fileCV: cv });
      if (apply) {
        clearError();
        setNotification({ message: "Your application is sent to the system", type: "neutral" });
      }
    }
  };
  const cvHandler = (e) => {
    var _a2, _b2;
    const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
    if (!file) return;
    const fileExtension = (_b2 = file.name.split(".").pop()) == null ? void 0 : _b2.toLowerCase();
    if (!fileExtension || !ALLOWED_EXTENSION.includes(fileExtension)) {
      e.target.value = "";
      setCv(void 0);
      const errorEl = errorRef.current;
      if (errorEl) {
        errorEl.innerHTML = `Allowed file extensions ${ALLOWED_EXTENSION.join(", ")}`;
      }
      return;
    }
    setCv(file);
  };
  const filenameRender = () => {
    return cv ? cv.name : "No file Choosen";
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Helmet, { children: [
      /* @__PURE__ */ jsxs("title", { children: [
        (_a = actualRoute.article) == null ? void 0 : _a.title,
        " - essentialbali"
      ] }),
      /* @__PURE__ */ jsx("meta", { name: "description", content: (_b = actualRoute.article) == null ? void 0 : _b.sub_title }),
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
    /* @__PURE__ */ jsx("div", { className: "content pb-12 bg-white transition", style: transition ? { transform: "translateY(100%)" } : { transform: "translateY(0%)" }, children: /* @__PURE__ */ jsxs("article", { children: [
      /* @__PURE__ */ jsxs("div", { className: "container border-b pt-16 border-front-black", children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-end mb-2", children: /* @__PURE__ */ jsx("div", { className: "icon-close cursor-pointer", children: /* @__PURE__ */ jsx(Link, { to: toBack, relative: "path", viewTransition: true, children: /* @__PURE__ */ jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "30", height: "30", viewBox: "0 0 30 30", fill: "none", children: [
          /* @__PURE__ */ jsx("g", { clipPath: "url(#clip0_649_3708)", children: /* @__PURE__ */ jsx("path", { d: "M23.75 8.0125L21.9875 6.25L15 13.2375L8.0125 6.25L6.25 8.0125L13.2375 15L6.25 21.9875L8.0125 23.75L15 16.7625L21.9875 23.75L23.75 21.9875L16.7625 15L23.75 8.0125Z", fill: "#646464" }) }),
          /* @__PURE__ */ jsx("defs", { children: /* @__PURE__ */ jsx("clipPath", { id: "clip0_649_3708", children: /* @__PURE__ */ jsx("rect", { width: "30", height: "30", fill: "white" }) }) })
        ] }) }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-end py-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "item flex gap-x-6", children: [
            /* @__PURE__ */ jsx("div", { className: "image-wrapper w-[150px]", children: /* @__PURE__ */ jsx(Image, { ratio: "150px", url: (metadata == null ? void 0 : metadata.company_logo) ?? "/logo.png" }) }),
            /* @__PURE__ */ jsx("div", { className: "item", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col justify-between h-full", children: [
              /* @__PURE__ */ jsxs("div", { className: "items", children: [
                /* @__PURE__ */ jsx("div", { className: "title-wrapper mb-2", children: /* @__PURE__ */ jsx("h1", { className: "font-bold text-front-main-title", children: content == null ? void 0 : content.title }) }),
                /* @__PURE__ */ jsx("div", { className: "meta-wrapp", children: /* @__PURE__ */ jsxs("p", { className: "text-front-body-big text-[#767676]", children: [
                  (metadata == null ? void 0 : metadata.company_name) ?? "Company A",
                  " | ",
                  (metadata == null ? void 0 : metadata.company_location) ?? "Bali, Uluwatu"
                ] }) })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "meta", children: /* @__PURE__ */ jsxs("div", { className: "tags-wrapper flex gap-x-2.5 mb-2.5", children: [
                /* @__PURE__ */ jsx(TagsBox, { text: (metadata == null ? void 0 : metadata.job_type) ?? "Fulltime" }),
                /* @__PURE__ */ jsx(TagsBox, { text: (metadata == null ? void 0 : metadata.experience) ? `${metadata.experience} Years` : "1 Years" })
              ] }) })
            ] }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "item flex h-full justify-end items-end", children: /* @__PURE__ */ jsxs("p", { className: "", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-[22px] text-front-red font-bold", children: [
              getCurrencySymbol((metadata == null ? void 0 : metadata.salary_currency) ?? "USD"),
              (metadata == null ? void 0 : metadata.salary_range) ?? "1000"
            ] }),
            /* @__PURE__ */ jsxs("span", { className: "text-front-small", children: [
              "/",
              salaryTime()
            ] })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsx("div", { className: "outer", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 md:gap-x-10", children: [
        /* @__PURE__ */ jsx("div", { className: "col-span-12 md:col-span-9", children: /* @__PURE__ */ jsx("div", { className: "inner py-8 min-h-[80vh]", children: /* @__PURE__ */ jsx("div", { className: "content-wrapper", dangerouslySetInnerHTML: { __html: (content == null ? void 0 : content.article_post) ?? "" } }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "col-span-12 md:col-span-3 md:border-l md:border-l-front-black", children: [
          /* @__PURE__ */ jsxs("div", { className: "inner mb-2 md:pl-8 py-8", children: [
            /* @__PURE__ */ jsxs("div", { className: "input-wrapper mb-4", children: [
              /* @__PURE__ */ jsx("div", { className: "more-inner mb-4", children: /* @__PURE__ */ jsx(Input, { placeholder: "Enter Your Email", onChange: (e) => {
                setEmail(e.target.value);
              }, className: "rounded-none !text-front-small" }) }),
              /* @__PURE__ */ jsx("div", { className: "more-inner", children: /* @__PURE__ */ jsx(PhoneInput, { placeholder: "Phone Number", className: "border border-gray-300 py-2.5 px-4 text-front-small placeholder:text-gray-400", onChange: (e) => {
                setPhone(e);
              }, value: phone }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "input-wrapper", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex gap-x-4 items-center cursor-pointer", onClick: () => {
                cvRef.current ? cvRef.current.click() : null;
              }, children: [
                /* @__PURE__ */ jsx("div", { className: "button text-front-small px-4 bg-front-red text-front-white py-4", children: "Enter CV" }),
                /* @__PURE__ */ jsx("div", { className: "filename text-[14px]", children: filenameRender() })
              ] }),
              /* @__PURE__ */ jsx("input", { type: "file", className: "pt-2 hidden", id: "cv", ref: cvRef, onChange: cvHandler, placeholder: "Enter your CV" })
            ] }),
            /* @__PURE__ */ jsx("div", { ref: errorRef, className: "error-warning-wrapper text-front-red text-front-body" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "button-wrapper text-end", children: /* @__PURE__ */ jsx(Button, { borderOnly: true, onClick: applyHandler, text: "APPLY NOW" }) })
        ] })
      ] }) }) })
    ] }) })
  ] });
};
export {
  SingleJob as default
};
