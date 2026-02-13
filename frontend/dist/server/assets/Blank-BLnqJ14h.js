import { jsxs, jsx } from "react/jsx-runtime";
import { P as PageBreadcrumb } from "./PageBreadCrumb-CVUrKnRj.js";
import { P as PageMeta } from "./PageMeta-CUwyhzue.js";
import "react-router";
function Blank() {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      PageMeta,
      {
        title: "React.js Blank Dashboard | TailAdmin - Next.js Admin Dashboard Template",
        description: "This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      }
    ),
    /* @__PURE__ */ jsx(PageBreadcrumb, { pageTitle: "Blank Page" }),
    /* @__PURE__ */ jsx("div", { className: "min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto w-full max-w-[630px] text-center", children: [
      /* @__PURE__ */ jsx("h3", { className: "mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl", children: "Card Title Here" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400 sm:text-base", children: "Start putting content on grids or panels, you can also use different combinations of grids.Please check out the dashboard and other pages" })
    ] }) })
  ] });
}
export {
  Blank as default
};
