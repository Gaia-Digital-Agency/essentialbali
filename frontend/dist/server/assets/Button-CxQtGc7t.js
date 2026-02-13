import { jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Link } from "react-router";
const SvgButtonChevron = (props) => /* @__PURE__ */ React.createElement("svg", { width: "1em", height: "1em", viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("path", { d: "M8.33154 1.6543L14.6772 7.99995L8.33154 14.3456", stroke: "#ffffff", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" }), /* @__PURE__ */ React.createElement("path", { d: "M14.6771 8L1.17712 8", stroke: "#ffffff", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" }));
const SvgButtonChevronBorder = (props) => /* @__PURE__ */ React.createElement("svg", { width: "1em", height: "1em", viewBox: "0 0 16 16", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("path", { d: "M8.33154 1.6543L14.6772 7.99995L8.33154 14.3456", stroke: "#b56576", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" }), /* @__PURE__ */ React.createElement("path", { d: "M14.6771 8L1.17712 8", stroke: "#b56576", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" }));
const Button = ({ text, link, bigger = false, onClick = () => {
}, borderOnly = false, uppercase = false }) => {
  const buttonRef = useRef(null);
  const { contextSafe } = useGSAP({ scope: buttonRef });
  const mouseEnterHandler = contextSafe(() => {
    if (!buttonRef.current) return;
    const icon = buttonRef.current.querySelector(".icon");
    gsap.to(icon, {
      width: "auto",
      duration: 0.2
    });
  });
  const mouseLeaveHandler = contextSafe(() => {
    if (!buttonRef.current) return;
    const icon = buttonRef.current.querySelector(".icon");
    gsap.to(icon, {
      width: "0px",
      duration: 0.2
    });
  });
  const renderSVG = () => {
    if (borderOnly) return /* @__PURE__ */ jsx(SvgButtonChevronBorder, {});
    return /* @__PURE__ */ jsx(SvgButtonChevron, {});
  };
  const ButtonElement = () => {
    return /* @__PURE__ */ jsxs("div", { className: `button md:px-8 px-4 inline-flex text-front-body font-medium cursor-pointer ${uppercase ? "uppercase " : ""}${bigger ? "py-4" : "py-3"} ${borderOnly ? "border border-front-red text-front-red" : "bg-front-red text-white"}`, onMouseEnter: mouseEnterHandler, onMouseLeave: mouseLeaveHandler, ref: buttonRef, onClick, children: [
      text,
      /* @__PURE__ */ jsx("div", { className: "icon overflow-hidden", style: { width: "0" }, children: /* @__PURE__ */ jsx("div", { className: "inner pl-2", children: renderSVG() }) })
    ] });
  };
  if (link) {
    return /* @__PURE__ */ jsx(Link, { to: link, children: /* @__PURE__ */ jsx(ButtonElement, {}) });
  }
  return /* @__PURE__ */ jsx(ButtonElement, {});
};
export {
  Button as B
};
