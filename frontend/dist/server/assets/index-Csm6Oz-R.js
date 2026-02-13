import { jsx } from "react/jsx-runtime";
const Table = ({ children, className }) => {
  return /* @__PURE__ */ jsx("table", { className: `min-w-full  ${className}`, children });
};
const TableHeader = ({ children, className }) => {
  return /* @__PURE__ */ jsx("thead", { className, children });
};
const TableBody = ({ children, className }) => {
  return /* @__PURE__ */ jsx("tbody", { className, children });
};
const TableRow = ({ children, className }) => {
  return /* @__PURE__ */ jsx("tr", { className, children });
};
const TableCell = ({
  children,
  isHeader = false,
  className
}) => {
  const CellTag = isHeader ? "th" : "td";
  return /* @__PURE__ */ jsx(CellTag, { className: ` ${className}`, children });
};
export {
  Table as T,
  TableHeader as a,
  TableRow as b,
  TableCell as c,
  TableBody as d
};
