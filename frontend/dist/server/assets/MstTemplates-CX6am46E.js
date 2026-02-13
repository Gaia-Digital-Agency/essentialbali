import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { P as PageAdminTitle } from "./PageAdminTitle-C4gWm7s9.js";
import { C as ComponentCard } from "./ComponentCard-Bt28DbRh.js";
import { B as Button } from "./Button-Cvygc_ZJ.js";
import { useOutletContext, Link } from "react-router";
import { e as useAuth } from "./TimeContext-B5j8j_GZ.js";
import "./PageBreadCrumb-CVUrKnRj.js";
import "react";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
const RenderLocations = ({ link, title, depth = 0, type = "" }) => {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: `article-post p-6 shadow rounded flex justify-between items-center ml-${4 * depth}`, children: [
    /* @__PURE__ */ jsx("div", { className: "inner", children: /* @__PURE__ */ jsxs("div", { className: "title-wrapper", children: [
      type && /* @__PURE__ */ jsx("p", { className: "text-xs opacity-[.4]", children: type }),
      /* @__PURE__ */ jsx("p", { className: "text-xl", children: title })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "action flex items-center gap-x-4", children: /* @__PURE__ */ jsx(Button, { children: /* @__PURE__ */ jsx(Link, { to: { pathname: `/admin/mst_templates/edit/`, search: `?url=${link}&template=Home` }, children: "Edit" }) }) })
  ] }) });
};
const RenderBaliHome = () => {
  const { userDetails } = useAuth();
  if (userDetails && userDetails.user_level == "super_admin") {
    return /* @__PURE__ */ jsx(ComponentCard, { children: /* @__PURE__ */ jsx(RenderLocations, { title: "Bali", link: "/" }) });
  }
  return /* @__PURE__ */ jsx(Fragment, {});
};
const MstTemplates = () => {
  const { locations } = useOutletContext();
  if (locations) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(PageAdminTitle, { pageTitle: "Templates" }),
      /* @__PURE__ */ jsx(ComponentCard, { title: "Bali Areas", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-6", children: [
        /* @__PURE__ */ jsx("div", { className: "col-span-12", children: /* @__PURE__ */ jsx(RenderBaliHome, {}) }),
        locations == null ? void 0 : locations.map((location) => {
          var _a;
          return /* @__PURE__ */ jsx(ComponentCard, { title: location.name, className: "col-span-6", children: /* @__PURE__ */ jsx("ul", { children: /* @__PURE__ */ jsxs("li", { children: [
            /* @__PURE__ */ jsx(RenderLocations, { title: location.name, link: `/${location.slug}`, type: "Area" }),
            /* @__PURE__ */ jsx("ul", { children: (_a = location.cities) == null ? void 0 : _a.map((city) => {
              var _a2;
              return /* @__PURE__ */ jsxs("li", { children: [
                /* @__PURE__ */ jsx(RenderLocations, { title: city.name, link: `/${location.slug}/${city.slug}`, depth: 1, type: "Sub Area" }),
                /* @__PURE__ */ jsx("ul", { children: (_a2 = city.regions) == null ? void 0 : _a2.map((region) => /* @__PURE__ */ jsx(RenderLocations, { title: region.name, link: `/${location.slug}/${city.slug}/${region.slug}`, depth: 2, type: "Local Zone" })) })
              ] }, city.id);
            }) })
          ] }) }) }, location.id);
        })
      ] }) })
    ] });
  }
};
export {
  MstTemplates as default
};
