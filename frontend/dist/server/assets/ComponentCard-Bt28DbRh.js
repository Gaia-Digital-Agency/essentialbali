import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { B as Button } from "./Button-Cvygc_ZJ.js";
const ComponentCard = ({
  title = "",
  children,
  className = "",
  desc = "",
  buttonText = "",
  buttonOnClick
}) => {
  const renderTitle = () => {
    if (title || desc) {
      return /* @__PURE__ */ jsxs("div", { className: "px-6 py-5", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-base font-medium text-gray-800 dark:text-white/90", children: title }),
        desc && /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-gray-500 dark:text-gray-400", children: desc }),
        buttonText && buttonOnClick && /* @__PURE__ */ jsx(Button, { onClick: () => buttonOnClick(), children: buttonText })
      ] });
    }
    return /* @__PURE__ */ jsx(Fragment, {});
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] ${className}`,
      children: [
        renderTitle(),
        /* @__PURE__ */ jsx("div", { className: "p-4 border-t border-gray-100 dark:border-gray-800 sm:p-6", children: /* @__PURE__ */ jsx("div", { className: "space-y-6", children }) })
      ]
    }
  );
};
export {
  ComponentCard as C
};
