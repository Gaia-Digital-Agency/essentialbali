import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { C as ComponentCard } from "./ComponentCard-Bt28DbRh.js";
import { I as Input } from "./InputField-CcQ93cDN.js";
import { L as Label } from "./Label-BrqX8kIQ.js";
import { S as SvgDownload } from "./download-DnjrKIYZ.js";
import { S as SvgEye, a as SvgEyeClose } from "./eye-close-BNNg4ZyA.js";
import { S as Select } from "./Select-BNFsiCfR.js";
import { D as registerUser, k as getAllLocationByType, y as getLocationsByParentID } from "./TimeContext-B5j8j_GZ.js";
import { B as Button } from "./Button-Cvygc_ZJ.js";
import { u as useAutoDismiss } from "./useTimedMessage-Dt1cSUu_.js";
import { A as Alert } from "./Alert-BmVQb4Hv.js";
import { M as ModalTimezoneTable, g as getTimezones } from "./ModalTimezoneTable-CguQiHA-.js";
import { B as Badge } from "./Badge-Djb8EXb-.js";
import { u as useModal } from "./useModal-C9BZm3Uo.js";
import "tailwind-merge";
import "clsx";
import "axios";
import "react-router";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "./index-CqfhKOI8.js";
import "./index-Csm6Oz-R.js";
function Registration() {
  const [isErrorEmail, setIsErrorEmail] = useState(false);
  const [errMessageEmail, setErrMessageEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isErrorPassword, setIsErrorPassword] = useState(false);
  const [errMessagePassword, setErrMessagePassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [userLevel, setUserLevel] = useState("admin_country");
  const [idCity, setIdCity] = useState(0);
  const [idCountry, setIdCountry] = useState(0);
  const [timezone, setTimezone] = useState("");
  const [vaDataCountry, setDataCountry] = useState([]);
  const [vaDataCity, setDataCity] = useState([]);
  const [vaDataTimezone, setDataTimezone] = useState([]);
  const [vaDataOptTimezone, setDataOptTimezone] = useState([]);
  useAutoDismiss(successMsg, setSuccessMsg);
  useAutoDismiss(errorMsg, setErrorMsg);
  const {
    isOpen: isOpenModalTimezone,
    openModal: openModalTimezone,
    closeModal: closeModalTimezone
  } = useModal();
  const validateEmail = (value) => {
    const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    setIsErrorEmail(false);
    setErrMessageEmail("");
    if (!isValidEmail) {
      setIsErrorEmail(true);
      setErrMessageEmail("Please input a valid email address");
    }
    return isValidEmail;
  };
  const validatePassword = (password2) => {
    setIsErrorPassword(false);
    setErrMessagePassword("");
    if (password2.length < 8) {
      setIsErrorPassword(true);
      setErrMessagePassword("Minimum Length 8 Character");
    }
    return password2;
  };
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };
  const optUserLevel = [
    { key: "admin_country", value: "admin_country", label: "Admin Bali Area" },
    { key: "admin_city", value: "admin_city", label: "Admin Sub Area" }
  ];
  const handleOptUserLevel = (value) => {
    setUserLevel(String(value));
  };
  const handleOptCountry = (value) => {
    setIdCountry(Number(value));
  };
  const handleOptCity = (value) => {
    setIdCity(Number(value));
  };
  const handleOptTimezone = (value) => {
    setTimezone(String(value));
  };
  const handleSubmit = async (e) => {
    var _a, _b;
    e.preventDefault();
    const vaData = {
      email,
      name,
      password,
      user_level: userLevel,
      id_country: idCountry,
      id_city: idCity,
      timezone
    };
    try {
      if (!validateEmail(email)) return;
      if (!name) {
        setErrorMsg("Please Input Name");
        return;
      }
      if (!validatePassword(password)) return;
      if (!idCountry) {
        setErrorMsg("Please Select Bali Area");
        return;
      }
      if (userLevel !== "admin_country" && !idCity) {
        setErrorMsg("Please Select Sub Area");
        return;
      }
      await registerUser(vaData);
      setSuccessMsg("Register Success");
      initForm();
    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      }
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err;
        setErrorMsg(((_b = (_a = errorObj.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) ?? "Something went wrong");
      }
      throw err;
    }
  };
  const showModalTimezone = () => {
    openModalTimezone();
  };
  const initForm = () => {
    setEmail("");
    setName("");
    setPassword("");
    setUserLevel("");
    setIdCountry(0);
    setIdCity(0);
    setTimezone("");
  };
  useEffect(() => {
    const fetchDataCountry = async () => {
      var _a;
      try {
        const vaData = await getAllLocationByType("country");
        const begin = { key: 0, value: 0, label: "Select Bali Area" };
        const optDataCountry = ((_a = vaData.data) == null ? void 0 : _a.map((loc) => ({
          key: loc.id,
          value: loc.id,
          label: loc.name
        }))) ?? [];
        setDataCountry([begin, ...optDataCountry]);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDataCountry();
  }, []);
  useEffect(() => {
    const fetchDataTimezone = async () => {
      try {
        const vaData = await getTimezones();
        const vaTimezones = vaData.data;
        const begin = { key: 0, value: 0, label: "Select Timezone" };
        const optDataTimezone = (vaTimezones == null ? void 0 : vaTimezones.map((timezone2) => ({
          key: timezone2.id,
          value: timezone2.timezone_name,
          label: timezone2.timezone_name + " - [" + timezone2.utc_offset + "]"
        }))) ?? [];
        setDataOptTimezone([begin, ...optDataTimezone]);
        setDataTimezone(vaTimezones);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDataTimezone();
  }, []);
  useEffect(() => {
    const fetchDataCity = async () => {
      var _a;
      try {
        const vaData = await getLocationsByParentID("city", idCountry);
        const begin = { key: 0, value: 0, label: "Select Sub Area" };
        const optDataCity = ((_a = vaData.data) == null ? void 0 : _a.map((loc) => ({
          key: loc.id,
          value: loc.id,
          label: loc.name
        }))) ?? [];
        setDataCity([begin, ...optDataCity]);
      } catch (error) {
        console.error(error);
      }
    };
    fetchDataCity();
  }, [idCountry]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(ComponentCard, { title: "Register New User", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-5", children: errorMsg && /* @__PURE__ */ jsx(Alert, { variant: "error", title: "Error", message: errorMsg }) }),
      /* @__PURE__ */ jsx("div", { className: "mb-5", children: successMsg && /* @__PURE__ */ jsx(Alert, { variant: "success", title: "Success", message: successMsg }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-5 space-x-6 grid grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Name" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "text",
                value: name,
                placeholder: "John Doe",
                onChange: (e) => setName(e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Email" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "email",
                value: email,
                error: isErrorEmail,
                onChange: handleEmailChange,
                placeholder: "Enter your email",
                hint: isErrorEmail ? errMessageEmail : ""
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
          /* @__PURE__ */ jsx(Label, { children: "Password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                type: showPassword ? "text" : "password",
                placeholder: "Enter your password",
                value: password,
                onChange: handlePasswordChange,
                error: isErrorPassword,
                hint: isErrorPassword ? errMessagePassword : ""
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
        /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
          /* @__PURE__ */ jsx(Label, { children: "Select Input" }),
          /* @__PURE__ */ jsx(
            Select,
            {
              options: optUserLevel,
              value: userLevel,
              placeholder: "Select Option",
              onChange: handleOptUserLevel,
              className: "dark:bg-dark-900"
            },
            userLevel
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-5 mb-5", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Bali Area" }),
            /* @__PURE__ */ jsx(
              Select,
              {
                options: vaDataCountry,
                value: idCountry,
                placeholder: "Select Bali Area...",
                onChange: handleOptCountry,
                className: "dark:bg-dark-900"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Sub Area" }),
            /* @__PURE__ */ jsx(
              Select,
              {
                options: vaDataCity,
                value: idCity,
                placeholder: "Select Sub Area...",
                onChange: handleOptCity,
                className: "dark:bg-dark-900"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-5 mb-5", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs(Label, { children: [
            /* @__PURE__ */ jsx("span", { className: "mr-2", children: "Time Zone" }),
            /* @__PURE__ */ jsx(Badge, { color: "info", onClick: showModalTimezone, children: "?" })
          ] }),
          /* @__PURE__ */ jsx(
            Select,
            {
              options: vaDataOptTimezone,
              value: timezone,
              placeholder: "Select Timezone...",
              onChange: handleOptTimezone,
              className: "dark:bg-dark-900"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(
          Button,
          {
            startIcon: /* @__PURE__ */ jsx(SvgDownload, { className: "size-5" }),
            className: "w-1/4",
            children: "Save"
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      ModalTimezoneTable,
      {
        isOpen: isOpenModalTimezone,
        onCLose: closeModalTimezone,
        timezonesData: vaDataTimezone
      }
    )
  ] });
}
export {
  Registration as default
};
