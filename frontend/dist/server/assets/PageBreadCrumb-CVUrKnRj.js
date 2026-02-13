import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "react-router";
const PageBreadcrumb = ({ pageTitle }) => {
  return /* @__PURE__ */ jsx("nav", { children: /* @__PURE__ */ jsxs("ol", { className: "flex items-center gap-1.5", children: [
    /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
      Link,
      {
        className: "inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400",
        to: "/admin",
        children: [
          "Home",
          /* @__PURE__ */ jsx(
            "svg",
            {
              className: "stroke-current",
              width: "17",
              height: "16",
              viewBox: "0 0 17 16",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M6.0765 12.667L10.2432 8.50033L6.0765 4.33366",
                  stroke: "",
                  strokeWidth: "1.2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              )
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ jsx("li", { className: "text-sm text-gray-800 dark:text-white/90", children: pageTitle })
  ] }) });
};
export {
  PageBreadcrumb as P
};
