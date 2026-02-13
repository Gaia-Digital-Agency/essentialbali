import { jsxs, jsx } from "react/jsx-runtime";
import { P as PageBreadcrumb } from "./PageBreadCrumb-CVUrKnRj.js";
import * as React from "react";
import { useEffect, useState } from "react";
import { C as ComponentCard } from "./ComponentCard-Bt28DbRh.js";
import { L as Label } from "./Label-BrqX8kIQ.js";
import { I as Input } from "./InputField-CcQ93cDN.js";
import { S as Select } from "./Select-BNFsiCfR.js";
import { S as SvgEye, a as SvgEyeClose } from "./eye-close-BNNg4ZyA.js";
import flatpickr from "flatpickr";
import { useDropzone } from "react-dropzone";
import { R as Radio } from "./Radio-_SrLUrGa.js";
import { S as Switch } from "./Switch-dGTxNxM2.js";
import { F as FileInput } from "./FileInput-BU42CnHt.js";
import { T as TextArea } from "./TextArea-DQuRajx9.js";
import { P as PageMeta } from "./PageMeta-CUwyhzue.js";
import "react-router";
import "./Button-Cvygc_ZJ.js";
import "tailwind-merge";
import "clsx";
const SvgEnvelope = (props) => /* @__PURE__ */ React.createElement("svg", { width: "1em", height: "1em", viewBox: "0 0 20 20", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M3.0415 7.06206V14.375C3.0415 14.6511 3.26536 14.875 3.5415 14.875H16.4582C16.7343 14.875 16.9582 14.6511 16.9582 14.375V7.06245L11.1441 11.1168C10.4568 11.5961 9.54348 11.5961 8.85614 11.1168L3.0415 7.06206ZM16.9582 5.19262C16.9582 5.19341 16.9582 5.1942 16.9582 5.19498V5.20026C16.957 5.22216 16.9458 5.24239 16.9277 5.25501L10.2861 9.88638C10.1143 10.0062 9.88596 10.0062 9.71412 9.88638L3.0723 5.25485C3.05318 5.24151 3.04178 5.21967 3.04177 5.19636C3.04176 5.15695 3.0737 5.125 3.1131 5.125H16.8869C16.925 5.125 16.9562 5.15494 16.9582 5.19262ZM18.4582 5.21428V14.375C18.4582 15.4796 17.5627 16.375 16.4582 16.375H3.5415C2.43693 16.375 1.5415 15.4796 1.5415 14.375V5.19498C1.5415 5.1852 1.54169 5.17546 1.54206 5.16577C1.55834 4.31209 2.25546 3.625 3.1131 3.625H16.8869C17.7546 3.625 18.4582 4.32843 18.4583 5.19622C18.4583 5.20225 18.4582 5.20826 18.4582 5.21428Z", fill: "currentColor" }));
const SvgCalenderLine = (props) => /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "none", ...props }, /* @__PURE__ */ React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M8 2C8.41421 2 8.75 2.33579 8.75 2.75V3.75H15.25V2.75C15.25 2.33579 15.5858 2 16 2C16.4142 2 16.75 2.33579 16.75 2.75V3.75H18.5C19.7426 3.75 20.75 4.75736 20.75 6V9V19C20.75 20.2426 19.7426 21.25 18.5 21.25H5.5C4.25736 21.25 3.25 20.2426 3.25 19V9V6C3.25 4.75736 4.25736 3.75 5.5 3.75H7.25V2.75C7.25 2.33579 7.58579 2 8 2ZM8 5.25H5.5C5.08579 5.25 4.75 5.58579 4.75 6V8.25H19.25V6C19.25 5.58579 18.9142 5.25 18.5 5.25H16H8ZM19.25 9.75H4.75V19C4.75 19.4142 5.08579 19.75 5.5 19.75H18.5C18.9142 19.75 19.25 19.4142 19.25 19V9.75Z", fill: "currentColor" }));
const SvgTime = (props) => /* @__PURE__ */ React.createElement("svg", { width: "1em", height: "1em", viewBox: "0 0 20 20", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M3.04175 9.99984C3.04175 6.15686 6.1571 3.0415 10.0001 3.0415C13.8431 3.0415 16.9584 6.15686 16.9584 9.99984C16.9584 13.8428 13.8431 16.9582 10.0001 16.9582C6.1571 16.9582 3.04175 13.8428 3.04175 9.99984ZM10.0001 1.5415C5.32867 1.5415 1.54175 5.32843 1.54175 9.99984C1.54175 14.6712 5.32867 18.4582 10.0001 18.4582C14.6715 18.4582 18.4584 14.6712 18.4584 9.99984C18.4584 5.32843 14.6715 1.5415 10.0001 1.5415ZM9.99998 10.7498C9.58577 10.7498 9.24998 10.4141 9.24998 9.99984V5.4165C9.24998 5.00229 9.58577 4.6665 9.99998 4.6665C10.4142 4.6665 10.75 5.00229 10.75 5.4165V9.24984H13.3334C13.7476 9.24984 14.0834 9.58562 14.0834 9.99984C14.0834 10.4141 13.7476 10.7498 13.3334 10.7498H10.0001H9.99998Z", fill: "currentColor" }));
function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder
}) {
  useEffect(() => {
    const flatPickr = flatpickr(`#${id}`, {
      mode: mode || "single",
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      defaultDate,
      onChange
    });
    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [mode, onChange, id, defaultDate]);
  return /* @__PURE__ */ jsxs("div", { children: [
    label && /* @__PURE__ */ jsx(Label, { htmlFor: id, children: label }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(
        "input",
        {
          id,
          placeholder,
          className: "h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
        }
      ),
      /* @__PURE__ */ jsx("span", { className: "absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400", children: /* @__PURE__ */ jsx(SvgCalenderLine, { className: "size-6" }) })
    ] })
  ] });
}
function DefaultInputs() {
  const [showPassword, setShowPassword] = useState(false);
  const options = [
    { value: "marketing", label: "Marketing" },
    { value: "template", label: "Template" },
    { value: "development", label: "Development" }
  ];
  const handleSelectChange = (_value) => {
  };
  return /* @__PURE__ */ jsx(ComponentCard, { title: "Default Inputs", children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "input", children: "Input" }),
      /* @__PURE__ */ jsx(Input, { type: "text", id: "input" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "inputTwo", children: "Input with Placeholder" }),
      /* @__PURE__ */ jsx(Input, { type: "text", id: "inputTwo", placeholder: "info@gmail.com" })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { children: "Select Input" }),
      /* @__PURE__ */ jsx(
        Select,
        {
          options,
          placeholder: "Select an option",
          onChange: handleSelectChange,
          className: "dark:bg-dark-900"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { children: "Password Input" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            type: showPassword ? "text" : "password",
            placeholder: "Enter your password"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => setShowPassword(!showPassword),
            className: "absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2",
            children: showPassword ? /* @__PURE__ */ jsx(SvgEye, { className: "fill-gray-500 dark:fill-gray-400 size-5" }) : /* @__PURE__ */ jsx(SvgEyeClose, { className: "fill-gray-500 dark:fill-gray-400 size-5" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
      DatePicker,
      {
        id: "date-picker",
        label: "Date Picker Input",
        placeholder: "Select a date",
        onChange: (_dates, _currentDateString) => {
        }
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "tm", children: "Time Picker Input" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            type: "time",
            id: "tm",
            name: "tm",
            onChange: () => {
            }
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400", children: /* @__PURE__ */ jsx(SvgTime, { className: "size-6" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "tm", children: "Input with Payment" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            type: "text",
            placeholder: "Card number",
            className: "pl-[62px]"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "absolute left-0 top-1/2 flex h-11 w-[46px] -translate-y-1/2 items-center justify-center border-r border-gray-200 dark:border-gray-800", children: /* @__PURE__ */ jsxs(
          "svg",
          {
            width: "20",
            height: "20",
            viewBox: "0 0 20 20",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
            children: [
              /* @__PURE__ */ jsx("circle", { cx: "6.25", cy: "10", r: "5.625", fill: "#E80B26" }),
              /* @__PURE__ */ jsx("circle", { cx: "13.75", cy: "10", r: "5.625", fill: "#F59D31" }),
              /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M10 14.1924C11.1508 13.1625 11.875 11.6657 11.875 9.99979C11.875 8.33383 11.1508 6.8371 10 5.80713C8.84918 6.8371 8.125 8.33383 8.125 9.99979C8.125 11.6657 8.84918 13.1625 10 14.1924Z",
                  fill: "#FC6020"
                }
              )
            ]
          }
        ) })
      ] })
    ] })
  ] }) });
}
const PhoneInput = ({
  countries,
  placeholder = "+1 (555) 000-0000",
  onChange,
  selectPosition = "start"
  // Default position is 'start'
}) => {
  const [selectedCountry, setSelectedCountry] = useState("US");
  const [phoneNumber, setPhoneNumber] = useState("+1");
  const countryCodes = countries.reduce(
    (acc, { code, label }) => ({ ...acc, [code]: label }),
    {}
  );
  const handleCountryChange = (e) => {
    const newCountry = e.target.value;
    setSelectedCountry(newCountry);
    setPhoneNumber(countryCodes[newCountry]);
    if (onChange) {
      onChange(countryCodes[newCountry]);
    }
  };
  const handlePhoneNumberChange = (e) => {
    const newPhoneNumber = e.target.value;
    setPhoneNumber(newPhoneNumber);
    if (onChange) {
      onChange(newPhoneNumber);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative flex", children: [
    selectPosition === "start" && /* @__PURE__ */ jsxs("div", { className: "absolute", children: [
      /* @__PURE__ */ jsx(
        "select",
        {
          value: selectedCountry,
          onChange: handleCountryChange,
          className: "appearance-none bg-none rounded-l-lg border-0 border-r border-gray-200 bg-transparent py-3 pl-3.5 pr-8 leading-tight text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-gray-400",
          children: countries.map((country) => /* @__PURE__ */ jsx(
            "option",
            {
              value: country.code,
              className: "text-gray-700 dark:bg-gray-900 dark:text-gray-400",
              children: country.code
            },
            country.code
          ))
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 flex items-center text-gray-700 pointer-events-none bg-none right-3 dark:text-gray-400", children: /* @__PURE__ */ jsx(
        "svg",
        {
          className: "stroke-current",
          width: "20",
          height: "20",
          viewBox: "0 0 20 20",
          fill: "none",
          xmlns: "http://www.w3.org/2000/svg",
          children: /* @__PURE__ */ jsx(
            "path",
            {
              d: "M4.79175 7.396L10.0001 12.6043L15.2084 7.396",
              stroke: "currentColor",
              strokeWidth: "1.5",
              strokeLinecap: "round",
              strokeLinejoin: "round"
            }
          )
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "tel",
        value: phoneNumber,
        onChange: handlePhoneNumberChange,
        placeholder,
        className: `dark:bg-dark-900 h-11 w-full ${selectPosition === "start" ? "pl-[84px]" : "pr-[84px]"} rounded-lg border border-gray-300 bg-transparent py-3 px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`
      }
    ),
    selectPosition === "end" && /* @__PURE__ */ jsxs("div", { className: "absolute right-0", children: [
      /* @__PURE__ */ jsx(
        "select",
        {
          value: selectedCountry,
          onChange: handleCountryChange,
          className: "appearance-none bg-none rounded-r-lg border-0 border-l border-gray-200 bg-transparent py-3 pl-3.5 pr-8 leading-tight text-gray-700 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:text-gray-400",
          children: countries.map((country) => /* @__PURE__ */ jsx(
            "option",
            {
              value: country.code,
              className: "text-gray-700 dark:bg-gray-900 dark:text-gray-400",
              children: country.code
            },
            country.code
          ))
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-y-0 flex items-center text-gray-700 pointer-events-none right-3 dark:text-gray-400", children: /* @__PURE__ */ jsx(
        "svg",
        {
          className: "stroke-current",
          width: "20",
          height: "20",
          viewBox: "0 0 20 20",
          fill: "none",
          xmlns: "http://www.w3.org/2000/svg",
          children: /* @__PURE__ */ jsx(
            "path",
            {
              d: "M4.79175 7.396L10.0001 12.6043L15.2084 7.396",
              stroke: "currentColor",
              strokeWidth: "1.5",
              strokeLinecap: "round",
              strokeLinejoin: "round"
            }
          )
        }
      ) })
    ] })
  ] });
};
function InputGroup() {
  const countries = [
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" }
  ];
  const handlePhoneNumberChange = (_phoneNumber) => {
  };
  return /* @__PURE__ */ jsx(ComponentCard, { title: "Input Group", children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { children: "Email" }),
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: "info@gmail.com",
            type: "text",
            className: "pl-[62px]"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400", children: /* @__PURE__ */ jsx(SvgEnvelope, { className: "size-6" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { children: "Phone" }),
      /* @__PURE__ */ jsx(
        PhoneInput,
        {
          selectPosition: "start",
          countries,
          placeholder: "+1 (555) 000-0000",
          onChange: handlePhoneNumberChange
        }
      )
    ] }),
    " ",
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { children: "Phone" }),
      /* @__PURE__ */ jsx(
        PhoneInput,
        {
          selectPosition: "end",
          countries,
          placeholder: "+1 (555) 000-0000",
          onChange: handlePhoneNumberChange
        }
      )
    ] })
  ] }) });
}
const DropzoneComponent = () => {
  const onDrop = (_acceptedFiles) => {
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/webp": [],
      "image/svg+xml": []
    }
  });
  return /* @__PURE__ */ jsx(ComponentCard, { title: "Dropzone", children: /* @__PURE__ */ jsx("div", { className: "transition border border-gray-300 border-dashed cursor-pointer dark:hover:border-brand-500 dark:border-gray-700 rounded-xl hover:border-brand-500", children: /* @__PURE__ */ jsxs(
    "form",
    {
      ...getRootProps(),
      className: `dropzone rounded-xl   border-dashed border-gray-300 p-7 lg:p-10
        ${isDragActive ? "border-brand-500 bg-gray-100 dark:bg-gray-800" : "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"}
      `,
      id: "demo-upload",
      children: [
        /* @__PURE__ */ jsx("input", { ...getInputProps() }),
        /* @__PURE__ */ jsxs("div", { className: "dz-message flex flex-col items-center m-0!", children: [
          /* @__PURE__ */ jsx("div", { className: "mb-[22px] flex justify-center", children: /* @__PURE__ */ jsx("div", { className: "flex h-[68px] w-[68px]  items-center justify-center rounded-full bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400", children: /* @__PURE__ */ jsx(
            "svg",
            {
              className: "fill-current",
              width: "29",
              height: "28",
              viewBox: "0 0 29 28",
              xmlns: "http://www.w3.org/2000/svg",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  fillRule: "evenodd",
                  clipRule: "evenodd",
                  d: "M14.5019 3.91699C14.2852 3.91699 14.0899 4.00891 13.953 4.15589L8.57363 9.53186C8.28065 9.82466 8.2805 10.2995 8.5733 10.5925C8.8661 10.8855 9.34097 10.8857 9.63396 10.5929L13.7519 6.47752V18.667C13.7519 19.0812 14.0877 19.417 14.5019 19.417C14.9161 19.417 15.2519 19.0812 15.2519 18.667V6.48234L19.3653 10.5929C19.6583 10.8857 20.1332 10.8855 20.426 10.5925C20.7188 10.2995 20.7186 9.82463 20.4256 9.53184L15.0838 4.19378C14.9463 4.02488 14.7367 3.91699 14.5019 3.91699ZM5.91626 18.667C5.91626 18.2528 5.58047 17.917 5.16626 17.917C4.75205 17.917 4.41626 18.2528 4.41626 18.667V21.8337C4.41626 23.0763 5.42362 24.0837 6.66626 24.0837H22.3339C23.5766 24.0837 24.5839 23.0763 24.5839 21.8337V18.667C24.5839 18.2528 24.2482 17.917 23.8339 17.917C23.4197 17.917 23.0839 18.2528 23.0839 18.667V21.8337C23.0839 22.2479 22.7482 22.5837 22.3339 22.5837H6.66626C6.25205 22.5837 5.91626 22.2479 5.91626 21.8337V18.667Z"
                }
              )
            }
          ) }) }),
          /* @__PURE__ */ jsx("h4", { className: "mb-3 font-semibold text-gray-800 text-theme-xl dark:text-white/90", children: isDragActive ? "Drop Files Here" : "Drag & Drop Files Here" }),
          /* @__PURE__ */ jsx("span", { className: " text-center mb-5 block w-full max-w-[290px] text-sm text-gray-700 dark:text-gray-400", children: "Drag and drop your PNG, JPG, WebP, SVG images here or browse" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium underline text-theme-sm text-brand-500", children: "Browse File" })
        ] })
      ]
    }
  ) }) });
};
const Checkbox = ({
  label,
  checked,
  id,
  onChange,
  className = "",
  disabled = false
}) => {
  return /* @__PURE__ */ jsxs(
    "label",
    {
      className: `flex items-center space-x-3 group cursor-pointer ${disabled ? "cursor-not-allowed opacity-60" : ""}`,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "relative w-5 h-5", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              id,
              type: "checkbox",
              className: `w-5 h-5 appearance-none cursor-pointer dark:border-gray-700 border border-gray-300 checked:border-transparent rounded-md checked:bg-brand-500 disabled:opacity-60 
          ${className}`,
              checked,
              onChange: (e) => onChange(e.target.checked),
              disabled
            }
          ),
          checked && /* @__PURE__ */ jsx(
            "svg",
            {
              className: "absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none top-1/2 left-1/2",
              xmlns: "http://www.w3.org/2000/svg",
              width: "14",
              height: "14",
              viewBox: "0 0 14 14",
              fill: "none",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M11.6666 3.5L5.24992 9.91667L2.33325 7",
                  stroke: "white",
                  strokeWidth: "1.94437",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              )
            }
          ),
          disabled && /* @__PURE__ */ jsx(
            "svg",
            {
              className: "absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none top-1/2 left-1/2",
              xmlns: "http://www.w3.org/2000/svg",
              width: "14",
              height: "14",
              viewBox: "0 0 14 14",
              fill: "none",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M11.6666 3.5L5.24992 9.91667L2.33325 7",
                  stroke: "#E4E7EC",
                  strokeWidth: "2.33333",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              )
            }
          )
        ] }),
        label && /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-gray-800 dark:text-gray-200", children: label })
      ]
    }
  );
};
function CheckboxComponents() {
  const [isChecked, setIsChecked] = useState(false);
  const [isCheckedTwo, setIsCheckedTwo] = useState(true);
  const [isCheckedDisabled, setIsCheckedDisabled] = useState(false);
  return /* @__PURE__ */ jsx(ComponentCard, { title: "Checkbox", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(Checkbox, { checked: isChecked, onChange: setIsChecked }),
      /* @__PURE__ */ jsx("span", { className: "block text-sm font-medium text-gray-700 dark:text-gray-400", children: "Default" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsx(
      Checkbox,
      {
        checked: isCheckedTwo,
        onChange: setIsCheckedTwo,
        label: "Checked"
      }
    ) }),
    /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsx(
      Checkbox,
      {
        checked: isCheckedDisabled,
        onChange: setIsCheckedDisabled,
        disabled: true,
        label: "Disabled"
      }
    ) })
  ] }) });
}
function RadioButtons() {
  const [selectedValue, setSelectedValue] = useState("option2");
  const handleRadioChange = (value) => {
    setSelectedValue(value);
  };
  return /* @__PURE__ */ jsx(ComponentCard, { title: "Radio Buttons", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-8", children: [
    /* @__PURE__ */ jsx(
      Radio,
      {
        id: "radio1",
        name: "group1",
        value: "option1",
        checked: selectedValue === "option1",
        onChange: handleRadioChange,
        label: "Default"
      }
    ),
    /* @__PURE__ */ jsx(
      Radio,
      {
        id: "radio2",
        name: "group1",
        value: "option2",
        checked: selectedValue === "option2",
        onChange: handleRadioChange,
        label: "Selected"
      }
    ),
    /* @__PURE__ */ jsx(
      Radio,
      {
        id: "radio3",
        name: "group1",
        value: "option3",
        checked: selectedValue === "option3",
        onChange: handleRadioChange,
        label: "Disabled",
        disabled: true
      }
    )
  ] }) });
}
function ToggleSwitch() {
  const handleSwitchChange = (_checked) => {
  };
  return /* @__PURE__ */ jsxs(ComponentCard, { title: "Toggle switch input", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
      /* @__PURE__ */ jsx(
        Switch,
        {
          label: "Default",
          defaultChecked: true,
          onChange: handleSwitchChange
        }
      ),
      /* @__PURE__ */ jsx(
        Switch,
        {
          label: "Checked",
          defaultChecked: true,
          onChange: handleSwitchChange
        }
      ),
      /* @__PURE__ */ jsx(Switch, { label: "Disabled", disabled: true })
    ] }),
    " ",
    /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
      /* @__PURE__ */ jsx(
        Switch,
        {
          label: "Default",
          defaultChecked: true,
          onChange: handleSwitchChange,
          color: "gray"
        }
      ),
      /* @__PURE__ */ jsx(
        Switch,
        {
          label: "Checked",
          defaultChecked: true,
          onChange: handleSwitchChange,
          color: "gray"
        }
      ),
      /* @__PURE__ */ jsx(Switch, { label: "Disabled", disabled: true, color: "gray" })
    ] })
  ] });
}
function FileInputExample() {
  const handleFileChange = (_event) => {
  };
  return /* @__PURE__ */ jsx(ComponentCard, { title: "File Input", children: /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Label, { children: "Upload file" }),
    /* @__PURE__ */ jsx(FileInput, { onChange: handleFileChange, className: "custom-class" })
  ] }) });
}
const MultiSelect = ({
  label,
  options,
  defaultSelected = [],
  onChange,
  disabled = false
}) => {
  const [selectedOptions, setSelectedOptions] = useState(defaultSelected);
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => {
    if (!disabled) setIsOpen((prev) => !prev);
  };
  const handleSelect = (optionValue) => {
    const newSelectedOptions = selectedOptions.includes(optionValue) ? selectedOptions.filter((value) => value !== optionValue) : [...selectedOptions, optionValue];
    setSelectedOptions(newSelectedOptions);
    onChange == null ? void 0 : onChange(newSelectedOptions);
  };
  const removeOption = (value) => {
    const newSelectedOptions = selectedOptions.filter((opt) => opt !== value);
    setSelectedOptions(newSelectedOptions);
    onChange == null ? void 0 : onChange(newSelectedOptions);
  };
  const selectedValuesText = selectedOptions.map(
    (value) => {
      var _a;
      return ((_a = options.find((option) => option.value === value)) == null ? void 0 : _a.text) || "";
    }
  );
  return /* @__PURE__ */ jsxs("div", { className: "w-full", children: [
    /* @__PURE__ */ jsx("label", { className: "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400", children: label }),
    /* @__PURE__ */ jsx("div", { className: "relative z-20 inline-block w-full", children: /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col items-center", children: [
      /* @__PURE__ */ jsx("div", { onClick: toggleDropdown, className: "w-full", children: /* @__PURE__ */ jsxs("div", { className: "mb-2 flex h-11 rounded-lg border border-gray-300 py-1.5 pl-3 pr-3 shadow-theme-xs outline-hidden transition focus:border-brand-300 focus:shadow-focus-ring dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-300", children: [
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap flex-auto gap-2", children: selectedValuesText.length > 0 ? selectedValuesText.map((text, index) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "group flex items-center justify-center rounded-full border-[0.7px] border-transparent bg-gray-100 py-1 pl-2.5 pr-2 text-sm text-gray-800 hover:border-gray-200 dark:bg-gray-800 dark:text-white/90 dark:hover:border-gray-800",
            children: [
              /* @__PURE__ */ jsx("span", { className: "flex-initial max-w-full", children: text }),
              /* @__PURE__ */ jsx("div", { className: "flex flex-row-reverse flex-auto", children: /* @__PURE__ */ jsx(
                "div",
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    removeOption(selectedOptions[index]);
                  },
                  className: "pl-2 text-gray-500 cursor-pointer group-hover:text-gray-400 dark:text-gray-400",
                  children: /* @__PURE__ */ jsx(
                    "svg",
                    {
                      className: "fill-current",
                      role: "button",
                      width: "14",
                      height: "14",
                      viewBox: "0 0 14 14",
                      xmlns: "http://www.w3.org/2000/svg",
                      children: /* @__PURE__ */ jsx(
                        "path",
                        {
                          fillRule: "evenodd",
                          clipRule: "evenodd",
                          d: "M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z"
                        }
                      )
                    }
                  )
                }
              ) })
            ]
          },
          index
        )) : /* @__PURE__ */ jsx(
          "input",
          {
            placeholder: "Select option",
            className: "w-full h-full p-1 pr-2 text-sm bg-transparent border-0 outline-hidden appearance-none placeholder:text-gray-800 focus:border-0 focus:outline-hidden focus:ring-0 dark:placeholder:text-white/90",
            readOnly: true,
            value: "Select option"
          }
        ) }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center py-1 pl-1 pr-1 w-7", children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: toggleDropdown,
            className: "w-5 h-5 text-gray-700 outline-hidden cursor-pointer focus:outline-hidden dark:text-gray-400",
            children: /* @__PURE__ */ jsx(
              "svg",
              {
                className: `stroke-current ${isOpen ? "rotate-180" : ""}`,
                width: "20",
                height: "20",
                viewBox: "0 0 20 20",
                fill: "none",
                xmlns: "http://www.w3.org/2000/svg",
                children: /* @__PURE__ */ jsx(
                  "path",
                  {
                    d: "M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551",
                    stroke: "currentColor",
                    strokeWidth: "1.5",
                    strokeLinecap: "round",
                    strokeLinejoin: "round"
                  }
                )
              }
            )
          }
        ) })
      ] }) }),
      isOpen && /* @__PURE__ */ jsx(
        "div",
        {
          className: "absolute left-0 z-40 w-full overflow-y-auto bg-white rounded-lg shadow-sm top-full max-h-select dark:bg-gray-900",
          onClick: (e) => e.stopPropagation(),
          children: /* @__PURE__ */ jsx("div", { className: "flex flex-col", children: options.map((option, index) => /* @__PURE__ */ jsx(
            "div",
            {
              className: `hover:bg-primary/5 w-full cursor-pointer rounded-t border-b border-gray-200 dark:border-gray-800`,
              onClick: () => handleSelect(option.value),
              children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: `relative flex w-full items-center p-2 pl-2 ${selectedOptions.includes(option.value) ? "bg-primary/10" : ""}`,
                  children: /* @__PURE__ */ jsx("div", { className: "mx-2 leading-6 text-gray-800 dark:text-white/90", children: option.text })
                }
              )
            },
            index
          )) })
        }
      )
    ] }) })
  ] });
};
function SelectInputs() {
  const options = [
    { value: "marketing", label: "Marketing" },
    { value: "template", label: "Template" },
    { value: "development", label: "Development" }
  ];
  const handleSelectChange = (_value) => {
  };
  const [selectedValues, setSelectedValues] = useState([]);
  const multiOptions = [
    { value: "1", text: "Option 1", selected: false },
    { value: "2", text: "Option 2", selected: false },
    { value: "3", text: "Option 3", selected: false },
    { value: "4", text: "Option 4", selected: false },
    { value: "5", text: "Option 5", selected: false }
  ];
  return /* @__PURE__ */ jsx(ComponentCard, { title: "Select Inputs", children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { children: "Select Input" }),
      /* @__PURE__ */ jsx(
        Select,
        {
          options,
          placeholder: "Select Option",
          onChange: handleSelectChange,
          className: "dark:bg-dark-900"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(
        MultiSelect,
        {
          label: "Multiple Select Options",
          options: multiOptions,
          defaultSelected: ["1", "3"],
          onChange: (values) => setSelectedValues(values)
        }
      ),
      /* @__PURE__ */ jsxs("p", { className: "sr-only", children: [
        "Selected Values: ",
        selectedValues.join(", ")
      ] })
    ] })
  ] }) });
}
function TextAreaInput() {
  const [message, setMessage] = useState("");
  const [messageTwo, setMessageTwo] = useState("");
  return /* @__PURE__ */ jsx(ComponentCard, { title: "Textarea input field", children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { children: "Description" }),
      /* @__PURE__ */ jsx(
        TextArea,
        {
          value: message,
          onChange: (value) => setMessage(value),
          rows: 6
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { children: "Description" }),
      /* @__PURE__ */ jsx(TextArea, { rows: 6, disabled: true })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(Label, { children: "Description" }),
      /* @__PURE__ */ jsx(
        TextArea,
        {
          rows: 6,
          value: messageTwo,
          error: true,
          onChange: (value) => setMessageTwo(value),
          hint: "Please enter a valid message."
        }
      )
    ] })
  ] }) });
}
function InputStates() {
  const [email, setEmail] = useState("");
  const [emailTwo, setEmailTwo] = useState("");
  const [error, setError] = useState(false);
  const validateEmail = (value) => {
    const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    setError(!isValidEmail);
    return isValidEmail;
  };
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };
  const handleEmailTwoChange = (e) => {
    const value = e.target.value;
    setEmailTwo(value);
    validateEmail(value);
  };
  return /* @__PURE__ */ jsx(
    ComponentCard,
    {
      title: "Input States",
      desc: "Validation styles for error, success and disabled states on form controls.",
      children: /* @__PURE__ */ jsxs("div", { className: "space-y-5 sm:space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Email" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "email",
              value: email,
              error,
              onChange: handleEmailChange,
              placeholder: "Enter your email",
              hint: error ? "This is an invalid email address." : ""
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Email" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "email",
              value: emailTwo,
              success: !error,
              onChange: handleEmailTwoChange,
              placeholder: "Enter your email",
              hint: !error ? "This is an success message." : ""
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { children: "Email" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "text",
              value: "disabled@example.com",
              disabled: true,
              placeholder: "Disabled email"
            }
          )
        ] })
      ] })
    }
  );
}
function FormElements() {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      PageMeta,
      {
        title: "React.js Form Elements Dashboard | TailAdmin - React.js Admin Dashboard Template",
        description: "This is React.js Form Elements  Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      }
    ),
    /* @__PURE__ */ jsx(PageBreadcrumb, { pageTitle: "From Elements" }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-6 xl:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx(DefaultInputs, {}),
        /* @__PURE__ */ jsx(SelectInputs, {}),
        /* @__PURE__ */ jsx(TextAreaInput, {}),
        /* @__PURE__ */ jsx(InputStates, {})
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsx(InputGroup, {}),
        /* @__PURE__ */ jsx(FileInputExample, {}),
        /* @__PURE__ */ jsx(CheckboxComponents, {}),
        /* @__PURE__ */ jsx(RadioButtons, {}),
        /* @__PURE__ */ jsx(ToggleSwitch, {}),
        /* @__PURE__ */ jsx(DropzoneComponent, {})
      ] })
    ] })
  ] });
}
export {
  FormElements as default
};
