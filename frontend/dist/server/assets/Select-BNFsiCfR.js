import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
const Select = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  value,
  defaultValue = "",
  required = false
}) => {
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const [hintState, setHintState] = useState("");
  useEffect(() => {
    if (value !== void 0) {
      setSelectedValue(value);
    }
  }, [value]);
  const handleChange = (e) => {
    e.preventDefault();
    const value2 = e.target.value;
    setSelectedValue(value2);
    if (!value2 && required) {
      setHintState("This field is required");
    }
    onChange(value2);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "select",
      {
        className: `h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-base shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 ${selectedValue ? "text-gray-800 dark:text-white/90" : "text-gray-400 dark:text-gray-400"} ${className}`,
        value: selectedValue,
        required,
        onChange: handleChange,
        children: [
          /* @__PURE__ */ jsx(
            "option",
            {
              value: "",
              className: "text-gray-700 dark:bg-gray-900 dark:text-gray-400",
              children: placeholder
            }
          ),
          options.map((option) => /* @__PURE__ */ jsx(
            "option",
            {
              value: option.value,
              className: "text-gray-700 dark:bg-gray-900 dark:text-gray-400",
              children: option.label
            },
            option.value
          ))
        ]
      }
    ),
    hintState && /* @__PURE__ */ jsx(
      "p",
      {
        className: `mt-1.5 text-xs text-error-500`,
        children: hintState
      }
    )
  ] });
};
export {
  Select as S
};
