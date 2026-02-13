import { jsxs, Fragment, jsx } from "react/jsx-runtime";
function GridShape() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px]", children: /* @__PURE__ */ jsx("img", { src: "/images/shape/grid-01.svg", alt: "grid" }) }),
    /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px]", children: /* @__PURE__ */ jsx("img", { src: "/images/shape/grid-01.svg", alt: "grid" }) })
  ] });
}
export {
  GridShape as G
};
