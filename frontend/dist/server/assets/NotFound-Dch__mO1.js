import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { G as GridShape } from "./GridShape-CcNVP__V.js";
import { Link } from "react-router";
import { P as PageMeta } from "./PageMeta-CUwyhzue.js";
function NotFound() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      PageMeta,
      {
        title: "essentialbali 404",
        description: "We can’t seem to find the page you are looking for!"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1", children: [
      /* @__PURE__ */ jsx(GridShape, {}),
      /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-[242px] text-center sm:max-w-[472px]", children: [
        /* @__PURE__ */ jsx("h1", { className: "mb-8 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl", children: "404" }),
        /* @__PURE__ */ jsx("p", { className: "mt-10 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg", children: "We can’t seem to find the page you are looking for!" }),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: "/",
            className: "inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200",
            children: "Back to Home Page"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "absolute text-sm text-center text-gray-500 -translate-x-1/2 bottom-6 left-1/2 dark:text-gray-400", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " - essentialbali"
      ] })
    ] })
  ] });
}
export {
  NotFound as default
};
