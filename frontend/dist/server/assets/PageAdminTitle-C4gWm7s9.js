import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { P as PageBreadcrumb } from "./PageBreadCrumb-CVUrKnRj.js";
import { B as Button } from "./Button-Cvygc_ZJ.js";
const PageAdminTitle = ({ pageTitle, buttonText, onClick }) => {
  const renderButton = () => {
    if (buttonText) {
      const onClickHandler = onClick ?? (() => {
        return;
      });
      return /* @__PURE__ */ jsx(Button, { onClick: onClickHandler, children: buttonText });
    }
    return /* @__PURE__ */ jsx(Fragment, {});
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3 mb-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "title-wrapper flex items-center gap-x-6", children: [
      /* @__PURE__ */ jsx(
        "h2",
        {
          className: "text-xl font-semibold text-gray-800 dark:text-white/90",
          "x-text": "pageName",
          children: pageTitle
        }
      ),
      renderButton()
    ] }),
    /* @__PURE__ */ jsx(PageBreadcrumb, { pageTitle })
  ] });
};
export {
  PageAdminTitle as P
};
