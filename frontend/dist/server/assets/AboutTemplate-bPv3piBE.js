import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { g as getTemplateByUrl, a as editTemplate, c as createTemplate } from "./template.service-BkOXTsSh.js";
import { C as ComponentCard } from "./ComponentCard-Bt28DbRh.js";
import { I as Input } from "./InputField-CcQ93cDN.js";
import { T as TextArea } from "./TextArea-DQuRajx9.js";
import { L as Label } from "./Label-BrqX8kIQ.js";
import { A as AdminFeaturedImage } from "./FeaturedImage-756EfM0U.js";
import { B as Button } from "./Button-Cvygc_ZJ.js";
import { i as useNotification } from "./TimeContext-B5j8j_GZ.js";
import "tailwind-merge";
import "clsx";
import "./index-CqfhKOI8.js";
import "./media.service-Bg8ZwuBl.js";
import "./MediaForm-pn_2Hilv.js";
import "react-dropzone";
import "./PageBreadCrumb-CVUrKnRj.js";
import "react-router";
import "./PageMeta-CUwyhzue.js";
import "./Alert-BmVQb4Hv.js";
import "./useTimedMessage-Dt1cSUu_.js";
import "axios";
import "./useModal-C9BZm3Uo.js";
import "./Badge-Djb8EXb-.js";
import "lucide-react";
import "react-fast-compare";
import "invariant";
import "shallowequal";
const AboutTemplate = () => {
  const [content, setContent] = useState({ title: "", description: "", link: "", image: { url: "", alt: "" } });
  const [isTemplateAvailable, setIsTemplateAvailable] = useState(false);
  const { setNotification } = useNotification();
  const TEMPLATE_SLUG = "/about";
  useEffect(() => {
    (async () => {
      var _a;
      const getTemplate = await getTemplateByUrl(TEMPLATE_SLUG);
      if (((_a = getTemplate == null ? void 0 : getTemplate.data) == null ? void 0 : _a.content) && getTemplate.status_code == 200) {
        setContent(JSON.parse(getTemplate.data.content));
        setIsTemplateAvailable(true);
      }
    })();
  }, []);
  const titleChangeHandler = (e) => {
    setContent((prev) => ({ ...prev, title: e.target.value }));
  };
  const descriptionChangeHandler = (e) => {
    console.log(e);
    setContent((prev) => ({ ...prev, description: e }));
  };
  const linkChangeHandler = (e) => {
    setContent((prev) => ({ ...prev, link: e.target.value }));
  };
  const imageSaveHandler = (file) => {
    if (!file) return;
    setContent((prev) => ({ ...prev, image: { url: file.path, alt: content.image.alt } }));
  };
  const renderImage = () => {
    return /* @__PURE__ */ jsx(AdminFeaturedImage, { onSave: imageSaveHandler, url: content.image.url ?? "" });
  };
  const setNotificationHandler = (_message = "Action Success", _type = "neutral") => {
    setNotification({ type: _type, message: _message, isClosed: false });
  };
  const saveTemplateHandler = async () => {
    try {
      if (isTemplateAvailable) {
        const edit = await editTemplate(TEMPLATE_SLUG, "About", JSON.stringify(content));
        if (edit) {
          setNotificationHandler();
          return;
        }
        setNotificationHandler("Failed", "fail");
      } else {
        const create = await createTemplate(TEMPLATE_SLUG, "About", JSON.stringify(content));
        if (create) {
          setNotificationHandler();
          return;
        }
        setNotificationHandler("Failed", "fail");
      }
    } catch (e) {
      console.log(e);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(ComponentCard, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 items-center gap-x-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "col-span-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "input-wrapper mb-8", children: [
          /* @__PURE__ */ jsx(Label, { children: "Title" }),
          /* @__PURE__ */ jsx(Input, { onChange: titleChangeHandler, value: content.title, placeholder: "Title" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-wrapper mb-8", children: [
          /* @__PURE__ */ jsx(Label, { children: "Description" }),
          /* @__PURE__ */ jsx(TextArea, { onChange: descriptionChangeHandler, value: content.description, placeholder: "Description" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "input-wrapper mb-8", children: [
          /* @__PURE__ */ jsx(Label, { children: "Link" }),
          /* @__PURE__ */ jsx(Input, { onChange: linkChangeHandler, value: content.link, placeholder: "Link" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "col-span-6", children: /* @__PURE__ */ jsxs("div", { className: "input-wrapper mb-8", children: [
        /* @__PURE__ */ jsx(Label, { children: "Image" }),
        renderImage()
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsx(Button, { onClick: saveTemplateHandler, children: "Save" })
  ] });
};
export {
  AboutTemplate as default
};
