import { jsxs, Fragment, jsx } from "react/jsx-runtime";
const PageMeta = ({
  title,
  description
}) => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx("title", { children: title }),
  /* @__PURE__ */ jsx("meta", { name: "description", content: description })
] });
export {
  PageMeta as P
};
