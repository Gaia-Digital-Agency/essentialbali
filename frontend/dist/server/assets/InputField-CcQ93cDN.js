import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
const Input = ({
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
  required = false
}) => {
  const [hintState, setHintState] = useState(hint ?? "");
  const [errorState, setErrorState] = useState(error);
  let inputClasses = ` h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-base shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${className}`;
  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 opacity-40`;
  } else if (error) {
    inputClasses += `  border-error-500 focus:border-error-300 focus:ring-error-500/20 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800`;
  } else if (success) {
    inputClasses += `  border-success-500 focus:border-success-300 focus:ring-success-500/20 dark:text-success-400 dark:border-success-500 dark:focus:border-success-800`;
  } else {
    inputClasses += ` bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90  dark:focus:border-brand-800`;
  }
  const blurHandler = () => {
    if (!required || value) {
      setHintState("");
      setErrorState(false);
      return;
    }
    setHintState("This field is required");
    setErrorState(true);
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        type,
        id,
        name,
        placeholder: placeholder ? String(placeholder) : void 0,
        value,
        onChange,
        min,
        max,
        step,
        disabled,
        className: inputClasses,
        required,
        onBlur: blurHandler
      }
    ),
    hintState && /* @__PURE__ */ jsx(
      "p",
      {
        className: `mt-1.5 text-xs ${errorState ? "text-error-500" : success ? "text-success-500" : "text-gray-500"}`,
        children: hintState
      }
    )
  ] });
};
export {
  Input as I
};
