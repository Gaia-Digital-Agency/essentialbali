import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { C as ComponentCard } from "./ComponentCard-Bt28DbRh.js";
import { P as PageBreadcrumb } from "./PageBreadCrumb-CVUrKnRj.js";
import { a as updateAssetMedia, g as getAllMedia } from "./media.service-Bg8ZwuBl.js";
import { M as Modal } from "./index-CqfhKOI8.js";
import { L as Label } from "./Label-BrqX8kIQ.js";
import { I as Input } from "./InputField-CcQ93cDN.js";
import { B as Button } from "./Button-Cvygc_ZJ.js";
import { T as TextArea } from "./TextArea-DQuRajx9.js";
import { B as Badge } from "./Badge-Djb8EXb-.js";
import { P as PageMeta } from "./PageMeta-CUwyhzue.js";
import "react-router";
import "./TimeContext-B5j8j_GZ.js";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "tailwind-merge";
import "clsx";
const API_URL$1 = "http://34.124.244.233/essentialbali";
function AssetModal({
  asset,
  isOpen,
  onClose,
  onUpdated
}) {
  const [form, setForm] = useState(null);
  useEffect(() => {
    if (asset) {
      setForm(asset);
    }
  }, [asset]);
  if (!isOpen) return null;
  const handleChange = (e) => {
    if (!form) return;
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  function normalizePayload(asset2) {
    return {
      // ...asset,
      title: asset2.title ?? void 0,
      alt_text: asset2.alt_text ?? void 0,
      caption: asset2.caption ?? void 0,
      description: asset2.description ?? void 0,
      filename: asset2.filename ?? void 0
    };
  }
  const handleSave = async () => {
    if (!form) return;
    const updated = await updateAssetMedia(form.id, normalizePayload(form));
    console.log("updated", updated.data);
    onUpdated(updated.data);
    onClose();
  };
  const handleTextChange = (name, value) => {
    setForm((prev) => prev ? { ...prev, [name]: value } : prev);
  };
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(ComponentCard, { title: "Edit Asset", children: /* @__PURE__ */ jsx(
    Modal,
    {
      isOpen,
      onClose,
      className: "max-w-[584px] p-5 lg:p-10",
      children: form && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h5", { className: "mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6", children: "Edit Asset Metadata" }),
          /* @__PURE__ */ jsxs("div", { className: "custom-scrollbar overflow-y-auto h-[600px] px-2 pb-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center pt-5", children: [
              /* @__PURE__ */ jsx("div", { className: "inline-flex rounded border border-gray-300 mb-2 mr-2 w-max-full h-50 p-1 box-border", children: /* @__PURE__ */ jsx(
                "img",
                {
                  src: API_URL$1 + "/" + form.path,
                  alt: form.alt_text || "",
                  className: "w-full h-full object-cover"
                }
              ) }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-gray-500", children: [
                "Uploaded at :",
                " ",
                /* @__PURE__ */ jsx(Badge, { size: "sm", color: "success", children: form.createdAt })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "col-span-1 pb-5", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "title", children: "Title" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  name: "title",
                  value: form.title || "",
                  onChange: handleChange
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "col-span-1 pb-5", children: [
              /* @__PURE__ */ jsx(Label, { children: "Filename" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  name: "filename",
                  value: form.filename || "",
                  onChange: handleChange
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "col-span-1 pb-5", children: [
              /* @__PURE__ */ jsx(Label, { children: "Alt Text" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  name: "alt_text",
                  value: form.alt_text || "",
                  onChange: handleChange
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "col-span-1 pb-5", children: [
              /* @__PURE__ */ jsx(Label, { children: "Caption" }),
              /* @__PURE__ */ jsx(
                TextArea,
                {
                  name: "caption",
                  value: form.caption || "",
                  onChange: (value) => handleTextChange("caption", value),
                  rows: 4
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "col-span-1 pb-5", children: [
              /* @__PURE__ */ jsx(Label, { children: "Description" }),
              /* @__PURE__ */ jsx(
                TextArea,
                {
                  name: "description",
                  value: form.description || "",
                  onChange: (value) => handleTextChange("description", value),
                  rows: 4
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 px-2 mt-2 lg:justify-end", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-2 mt-4", children: [
          /* @__PURE__ */ jsx(Button, { onClick: onClose, children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { onClick: handleSave, children: "Save" })
        ] }) })
      ] })
    }
  ) }) }) });
}
const API_URL = "http://34.124.244.233/essentialbali";
function MediaLibrary() {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    const fetchAllAssetMedia = async () => {
      try {
        const response = await getAllMedia();
        if (response) {
          const vaData = response.data;
          setAssets(vaData);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchAllAssetMedia();
  }, []);
  const handleClick = (asset) => {
    setSelectedAsset(asset);
    setIsModalOpen(true);
  };
  const handleUpdated = (updated) => {
    console.log("update handled =>", updated);
    setAssets((prev) => prev.map((a) => a.id === updated.id ? updated : a));
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      PageMeta,
      {
        title: "essentialbali Admin Dashboard | Media Library",
        description: "This is Media Library Dashboard page for essentialbali Admin Dashboard Template"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "pb-5 grid grid-cols-1 gap-6 xl:grid-cols-1", children: /* @__PURE__ */ jsx("div", { className: "space-y-12", children: /* @__PURE__ */ jsx(PageBreadcrumb, { pageTitle: "Media Library" }) }) }),
    /* @__PURE__ */ jsx(ComponentCard, { title: "Media Library", children: assets.map((file) => /* @__PURE__ */ jsx(
      "div",
      {
        onClick: () => handleClick(file),
        className: "inline-flex rounded border border-gray-300 mb-2 mr-2 w-45 h-45 p-1 box-border",
        children: /* @__PURE__ */ jsx("div", { className: "flex min-w-0 overflow-hidden items-center justify-center align-middle", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: API_URL + `/${file.path}`,
            className: "block w-auto h-full object-cover hover:scale-110 transition duration-500 ease-in-out",
            onLoad: () => {
              URL.revokeObjectURL(API_URL + "/" + file.path);
            }
          }
        ) })
      },
      file.id
    )) }),
    /* @__PURE__ */ jsx(
      AssetModal,
      {
        asset: selectedAsset,
        isOpen: isModalOpen,
        onClose: () => setIsModalOpen(false),
        onUpdated: handleUpdated
      }
    )
  ] });
}
export {
  MediaLibrary as default
};
