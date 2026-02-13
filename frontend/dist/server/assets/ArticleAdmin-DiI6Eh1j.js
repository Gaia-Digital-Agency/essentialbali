import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate, Outlet } from "react-router";
import { C as ComponentCard } from "./ComponentCard-Bt28DbRh.js";
import { P as PageAdminTitle } from "./PageAdminTitle-C4gWm7s9.js";
import "./Button-Cvygc_ZJ.js";
import "./PageBreadCrumb-CVUrKnRj.js";
const ArticleAdmin = () => {
  const navigate = useNavigate();
  const [pageAdminButtonText, setPageAdminButtonText] = useState("Add Article");
  const [pageAdminButtonOnClick, setPageAdminButtonOnClick] = useState(() => () => {
    navigate("/admin/mst_article/add");
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PageAdminTitle, { pageTitle: "Article", buttonText: pageAdminButtonText, onClick: pageAdminButtonOnClick }),
    /* @__PURE__ */ jsx(ComponentCard, { title: "", children: /* @__PURE__ */ jsx(Outlet, { context: { pageAdminButtonText, setPageAdminButtonText, pageAdminButtonOnClick, setPageAdminButtonOnClick } }) })
  ] });
};
export {
  ArticleAdmin as default
};
