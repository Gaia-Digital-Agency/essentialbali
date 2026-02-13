import { jsx } from "react/jsx-runtime";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
const Label = ({ htmlFor, children, className }) => {
  return /* @__PURE__ */ jsx(
    "label",
    {
      htmlFor,
      className: clsx(
        twMerge(
          "mb-1.5 block text-lg font-medium text-gray-700 dark:text-gray-400",
          className
        )
      ),
      children
    }
  );
};
export {
  Label as L
};
