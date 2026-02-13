import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { P as PageMeta } from "./PageMeta-CUwyhzue.js";
import { G as GridShape } from "./GridShape-CcNVP__V.js";
import { Link } from "react-router";
import { useState } from "react";
import { S as SvgEye, a as SvgEyeClose } from "./eye-close-BNNg4ZyA.js";
import { L as Label } from "./Label-BrqX8kIQ.js";
import { I as Input } from "./InputField-CcQ93cDN.js";
import { B as Button } from "./Button-Cvygc_ZJ.js";
import { l as login } from "./TimeContext-B5j8j_GZ.js";
import { A as Alert } from "./Alert-BmVQb4Hv.js";
import "tailwind-merge";
import "clsx";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
function AuthLayout({
  children
}) {
  return /* @__PURE__ */ jsx("div", { className: "relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0", children: /* @__PURE__ */ jsxs("div", { className: "relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0", children: [
    children,
    /* @__PURE__ */ jsx("div", { className: "items-center hidden w-full h-full lg:w-1/2 bg-[#b56576] dark:bg-white/5 lg:grid", children: /* @__PURE__ */ jsxs("div", { className: "relative flex items-center justify-center z-1", children: [
      /* @__PURE__ */ jsx(GridShape, {}),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center max-w-xs", children: [
        /* @__PURE__ */ jsx(Link, { to: "/", className: "block mb-4", children: /* @__PURE__ */ jsx(
          "img",
          {
            width: 220,
            height: 92,
            src: "/logo.png",
            alt: "essentialbali logo"
          }
        ) }),
        /* @__PURE__ */ jsx("p", { className: "text-center text-white dark:text-white/60", children: "essentialbali Content Management Dashboard" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "fixed z-50 hidden bottom-6 right-6 sm:block" })
  ] }) });
}
function SignInForm() {
  const BASE_PATH = "/essentialbali/".replace(/\/$/, "");
  const adminUrl = `${BASE_PATH}/admin`;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const handleLogin = async (e) => {
    var _a, _b;
    e.preventDefault();
    try {
      const credentials = { email, password };
      await login(credentials);
      window.location.replace(adminUrl);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err;
        setError(((_b = (_a = errorObj.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) ?? "Something went wrong");
      }
    } finally {
    }
  };
  const [showPassword, setShowPassword] = useState(false);
  return /* @__PURE__ */ jsx("div", { className: "flex flex-col flex-1", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col justify-center flex-1 w-full max-w-md mx-auto", children: /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-5 sm:mb-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md", children: "Sign In" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "Enter your email and password to sign in!" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mb-5", children: error && /* @__PURE__ */ jsx(Alert, { variant: "error", title: "Error", message: error }) }),
    /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("form", { onSubmit: handleLogin, children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(Label, { children: [
          "Email ",
          /* @__PURE__ */ jsx("span", { className: "text-error-500", children: "*" }),
          " "
        ] }),
        /* @__PURE__ */ jsx(
          Input,
          {
            type: "email",
            onChange: (e) => setEmail(e.target.value),
            value: email,
            placeholder: "info@gmail.com"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs(Label, { children: [
          "Password ",
          /* @__PURE__ */ jsx("span", { className: "text-error-500", children: "*" }),
          " "
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              type: showPassword ? "text" : "password",
              onChange: (e) => setPassword(e.target.value),
              value: password,
              placeholder: "Enter your password"
            }
          ),
          /* @__PURE__ */ jsx(
            "span",
            {
              onClick: () => setShowPassword(!showPassword),
              className: "absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2",
              children: showPassword ? /* @__PURE__ */ jsx(SvgEye, { className: "fill-gray-500 dark:fill-gray-400 size-5" }) : /* @__PURE__ */ jsx(SvgEyeClose, { className: "fill-gray-500 dark:fill-gray-400 size-5" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between" }),
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Button, { className: "w-full", size: "sm", children: "Sign in" }) })
    ] }) }) })
  ] }) }) });
}
function SignIn() {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      PageMeta,
      {
        title: "Sign In | essentialbali",
        description: "Sign in to essentialbali admin."
      }
    ),
    /* @__PURE__ */ jsx(AuthLayout, { children: /* @__PURE__ */ jsx(SignInForm, {}) })
  ] });
}
export {
  SignIn as default
};
