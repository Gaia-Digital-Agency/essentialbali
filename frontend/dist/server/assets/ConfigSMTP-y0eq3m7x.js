import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { C as ComponentCard } from "./ComponentCard-Bt28DbRh.js";
import { P as PageBreadcrumb } from "./PageBreadCrumb-CVUrKnRj.js";
import { P as PageMeta } from "./PageMeta-CUwyhzue.js";
import { I as Input } from "./InputField-CcQ93cDN.js";
import { L as Label } from "./Label-BrqX8kIQ.js";
import { S as Select } from "./Select-BNFsiCfR.js";
import { j as apiClient } from "./TimeContext-B5j8j_GZ.js";
import { S as Switch } from "./Switch-dGTxNxM2.js";
import { DownloadIcon } from "lucide-react";
import { B as Button } from "./Button-Cvygc_ZJ.js";
import { A as Alert } from "./Alert-BmVQb4Hv.js";
import { u as useAutoDismiss } from "./useTimedMessage-Dt1cSUu_.js";
import "react-router";
import "tailwind-merge";
import "clsx";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
const getDataSMTPProvider = async () => {
  try {
    const response = await apiClient.get("setting/admin/smtp/providers");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const getDataSMTPConfig = async () => {
  try {
    const response = await apiClient.get("/setting/admin/smtp?view=1");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const updateSMTPConfig = async (payload) => {
  try {
    const response = await apiClient.post("/setting/admin/smtp", payload);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const getDataSMTPProviderByID = async (id) => {
  try {
    const response = await apiClient.get(`setting/admin/smtp/provider/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
function maskSecret(str, showStart = 4, showEnd = 4) {
  if (!str) return "";
  if (showStart + showEnd >= str.length) return "*".repeat(str.length);
  return str.slice(0, showStart) + "*".repeat(str.length - showStart - showEnd) + str.slice(-showEnd);
}
function ConfigSMTP() {
  const [provider, setProvider] = useState("");
  const [dataProvider, setDataProvider] = useState([]);
  const [host, setHost] = useState("");
  const [port, setPort] = useState(0);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [secureLabel, setSecureLabel] = useState("");
  const [isSecure, setIsSecure] = useState(false);
  useAutoDismiss(success, setSuccess);
  useAutoDismiss(error, setError);
  useEffect(() => {
    const fetchSMTPConfig = async () => {
      try {
        const response = await getDataSMTPConfig();
        const data = response == null ? void 0 : response.data;
        if (data) {
          const cPassword = maskSecret(data.password ?? "");
          setProvider(data.provider_name ?? "");
          setHost(data.host);
          setPort(data.port);
          setUsername(data.username);
          setPassword(cPassword);
          setFromName(data.from_name);
          setFromEmail(data.from_email);
          setSecureLabel(data.secure ? "Yes" : "No");
          setIsSecure(data.secure);
        }
      } catch (error2) {
        console.error(error2);
        throw error2;
      }
    };
    fetchSMTPConfig();
  }, []);
  useEffect(() => {
    const fetchSMTPProvider = async () => {
      try {
        const response = await getDataSMTPProvider();
        const data = response == null ? void 0 : response.data;
        if (data) {
          const vaData = data.map((item) => ({
            key: item.id,
            value: item.id,
            //item.provider_name,
            label: item.provider_name
          }));
          setDataProvider(vaData);
        }
      } catch (error2) {
        console.error(error2);
        setDataProvider([]);
      }
    };
    fetchSMTPProvider();
  }, []);
  const handleSMTPProviders = async (value) => {
    setProvider(String(value));
    const dataDetailProvider = await getDataSMTPProviderByID(Number(value));
    const data = dataDetailProvider == null ? void 0 : dataDetailProvider.data;
    setHost((data == null ? void 0 : data.host) ?? "");
  };
  const handleSwitchChange = (checked) => {
    setSecureLabel(checked ? "Yes" : "No");
    setIsSecure(checked);
  };
  const handleSubmit = async (e) => {
    var _a, _b;
    e.preventDefault();
    const vaData = {
      host,
      port,
      secure: isSecure,
      username,
      from_name: fromName,
      from_email: fromEmail,
      is_active: true
    };
    if (password && !password.includes("*")) {
      vaData.password = password;
    }
    if (provider) {
      vaData.provider_name = Number(provider);
    }
    try {
      const doUpsert = await updateSMTPConfig(vaData);
      const status_code = doUpsert == null ? void 0 : doUpsert.status_code;
      if (status_code == 200) {
        setSuccess("SMTP Configuration updated successfully");
        location.reload();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err;
        setError(((_b = (_a = errorObj.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) ?? "Something went wrong");
      }
    }
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      PageMeta,
      {
        title: "essentialbali Admin Dashboard | SMTP Configuration",
        description: "This is SMTP Configuration Dashboard page for essentialbali Admin Dashboard Template"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6 xl:grid-cols-1", children: /* @__PURE__ */ jsxs("div", { className: "space-y-12", children: [
      /* @__PURE__ */ jsx(PageBreadcrumb, { pageTitle: "SMTP Configuration" }),
      /* @__PURE__ */ jsxs(ComponentCard, { title: "SMTP Configuration", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-5", children: error && /* @__PURE__ */ jsx(Alert, { variant: "error", title: "Error", message: error }) }),
        /* @__PURE__ */ jsx("div", { className: "mb-5", children: success && /* @__PURE__ */ jsx(Alert, { variant: "success", title: "Success", message: success }) }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-3 space-x-6 grid grid-cols-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "SMTP Providers" }),
              /* @__PURE__ */ jsx(
                Select,
                {
                  options: dataProvider,
                  placeholder: provider,
                  onChange: (value) => {
                    void handleSMTPProviders(String(value));
                  },
                  className: "dark:bg-dark-900"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Host" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "text",
                  onChange: (e) => setHost(e.target.value),
                  placeholder: host
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Port" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "text",
                  onChange: (e) => setPort(Number(e.target.value)),
                  placeholder: port
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Secure" }),
              /* @__PURE__ */ jsx(
                Switch,
                {
                  label: secureLabel,
                  checked: isSecure,
                  onChange: handleSwitchChange
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-3 space-x-6 grid grid-cols-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Username" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "text",
                  onChange: (e) => setUsername(e.target.value),
                  placeholder: username
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "Password" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "text",
                  onChange: (e) => setPassword(e.target.value),
                  placeholder: password
                }
              ),
              /* @__PURE__ */ jsx("small", { className: "text-red-500 text-xs", children: "* Leave this field empty to keep your current password." })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "From Name" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "text",
                  onChange: (e) => setFromName(e.target.value),
                  placeholder: fromName
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { children: "From Email" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "text",
                  onChange: (e) => setFromEmail(e.target.value),
                  placeholder: fromEmail
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-6 space-x-6 flex justify-end", children: /* @__PURE__ */ jsx(
            Button,
            {
              startIcon: /* @__PURE__ */ jsx(DownloadIcon, { className: "size-5" }),
              className: "w-1/8",
              children: "Save"
            }
          ) })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  ConfigSMTP as default
};
