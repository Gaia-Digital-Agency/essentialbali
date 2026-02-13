import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
const Switch = ({
  label,
  checked,
  defaultChecked = false,
  disabled = false,
  onChange,
  color = "blue"
}) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = typeof checked === "boolean";
  const currentChecked = isControlled ? checked : internalChecked;
  useEffect(() => {
    if (!isControlled) setInternalChecked(defaultChecked);
  }, [defaultChecked, isControlled]);
  const handleToggle = () => {
    if (disabled) return;
    const newValue = !currentChecked;
    if (!isControlled) setInternalChecked(newValue);
    if (onChange) onChange(newValue);
  };
  const switchColors = color === "blue" ? {
    background: currentChecked ? "bg-brand-500" : "bg-gray-200 dark:bg-white/10",
    knob: currentChecked ? "translate-x-full bg-white" : "translate-x-0 bg-white"
  } : {
    background: currentChecked ? "bg-gray-800 dark:bg-white/10" : "bg-gray-200 dark:bg-white/10",
    knob: currentChecked ? "translate-x-full bg-white" : "translate-x-0 bg-white"
  };
  return /* @__PURE__ */ jsxs(
    "label",
    {
      className: `flex cursor-pointer select-none items-center gap-3 text-sm font-medium ${disabled ? "text-gray-400" : "text-gray-700 dark:text-gray-400"}`,
      onClick: handleToggle,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            "div",
            {
              className: `block transition duration-150 ease-linear h-6 w-11 rounded-full ${disabled ? "bg-gray-100 dark:bg-gray-800" : switchColors.background}`
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              className: `absolute left-0.5 top-0.5 h-5 w-5 rounded-full shadow-theme-sm duration-150 ease-linear transform ${switchColors.knob}`
            }
          )
        ] }),
        label
      ]
    }
  );
};
export {
  Switch as S
};
