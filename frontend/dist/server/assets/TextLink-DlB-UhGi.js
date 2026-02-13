import { jsx } from "react/jsx-runtime";
import { Link } from "react-router";
const TextLink = ({ text = "Read More", link = null, color = "black", uppercase = false }) => {
  const colorClass = () => {
    if (color == "black") {
      return "text-front-black decoration-front-black";
    }
    if (color == "gray") {
      return "text-front-soft-gray decoration-front-soft-gray";
    }
    if (color == "white") {
      return "text-white decoration-white";
    }
  };
  const renderText = /* @__PURE__ */ jsx("p", { className: `inline-block text-front-small tracking-[.2em] transition hover:text-front-red hover:decoration-front-red decoration-solid underline ${colorClass()}${uppercase ? " uppercase" : ""}`, children: text });
  if (link) {
    return /* @__PURE__ */ jsx(Link, { to: link, children: renderText });
  }
  return renderText;
};
export {
  TextLink as T
};
