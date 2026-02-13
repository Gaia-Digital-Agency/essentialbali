import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { g as getTemplateByUrl, e as editTemplateByUrl, c as createTemplate } from "./template.service-BkOXTsSh.js";
import { C as ComponentCard } from "./ComponentCard-Bt28DbRh.js";
import { A as AdminFeaturedImage } from "./FeaturedImage-756EfM0U.js";
import { u as useNavigationPrompt } from "./useNavigationPrompt-DiFBqK8C.js";
import { B as Button } from "./Button-Cvygc_ZJ.js";
import { i as useNotification } from "./TimeContext-B5j8j_GZ.js";
import { T as TextArea } from "./TextArea-DQuRajx9.js";
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
import "react-router-dom";
import "react-fast-compare";
import "invariant";
import "shallowequal";
const API_URL = "http://34.124.244.233/essentialbali";
const SettingPage = () => {
  const defaultSettingProps = {
    isAvailable: false,
    isChanged: false
  };
  const { setNotification } = useNotification();
  const [logoImage, setLogoImage] = useState({
    content: {
      id: 0,
      url: ""
    },
    ...defaultSettingProps
  });
  const [headScript, setHeadScript] = useState({
    content: "",
    ...defaultSettingProps
  });
  const [preBodyScript, setPreBodyScript] = useState({
    content: "",
    ...defaultSettingProps
  });
  const [postBodyScript, setPostBodyScript] = useState({
    content: "",
    ...defaultSettingProps
  });
  const { setBlock, isDirty } = useNavigationPrompt();
  useEffect(() => {
    (async () => {
      try {
        const getTemplate = await getTemplateByUrl("/logo-header");
        if ((getTemplate == null ? void 0 : getTemplate.status_code) == 200 && getTemplate.data) {
          const data = JSON.parse(getTemplate.data.content);
          setLogoImage((prev) => ({ ...prev, content: data, isAvailable: true }));
        }
      } catch (e) {
        console.log(e);
      }
    })();
    (async () => {
      try {
        const getTemplate = await getTemplateByUrl("/script/head");
        if ((getTemplate == null ? void 0 : getTemplate.status_code) == 200 && getTemplate.data) {
          const data = JSON.parse(getTemplate.data.content);
          setHeadScript((prev) => ({ ...prev, content: data, isAvailable: true }));
        }
      } catch (e) {
        console.log(e);
      }
    })();
    (async () => {
      try {
        const getTemplate = await getTemplateByUrl("/script/prebody");
        if ((getTemplate == null ? void 0 : getTemplate.status_code) == 200 && getTemplate.data) {
          const data = JSON.parse(getTemplate.data.content);
          setPreBodyScript((prev) => ({ ...prev, content: data, isAvailable: true }));
        }
      } catch (e) {
        console.log(e);
      }
    })();
    (async () => {
      try {
        const getTemplate = await getTemplateByUrl("/script/postbody");
        if ((getTemplate == null ? void 0 : getTemplate.status_code) == 200 && getTemplate.data) {
          const data = JSON.parse(getTemplate.data.content);
          setPostBodyScript((prev) => ({ ...prev, content: data, isAvailable: true }));
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);
  const saveLogoImageHandler = (file) => {
    setLogoImage((prev) => ({ ...prev, content: { id: file.id, url: file.path } }));
    setBlock(true);
  };
  const failedSave = (message = "Unexpected Error") => {
    setNotification({ message, type: "fail", isClosed: false });
    return false;
  };
  const successSave = (message = "successfully change logo header") => {
    setNotification({ message, type: "neutral", isClosed: false });
    setBlock(false);
    return true;
  };
  const saveSettingHandler = async () => {
  };
  const saveLogoHandler = async () => {
    if (logoImage.isAvailable) {
      try {
        const edit = await editTemplateByUrl(
          "/logo-header",
          "Logo",
          JSON.stringify(logoImage.content)
        );
        if (edit) {
          return successSave();
        } else {
          return failedSave();
        }
      } catch (e) {
        console.log(e);
        return failedSave();
      }
    } else {
      try {
        const create = await createTemplate(
          "/logo-header",
          "Logo",
          JSON.stringify(logoImage.content)
        );
        if (create) {
          return successSave();
        }
        return failedSave();
      } catch (e) {
        console.log(e);
        return failedSave();
      }
    }
  };
  const saveScripts = async () => {
    (async () => {
      try {
        if (headScript.isAvailable) {
          const edit = await editTemplateByUrl(
            "/script/head",
            "Script",
            JSON.stringify(headScript.content)
          );
          if (edit) return successSave();
          return failedSave();
        } else {
          const create = await createTemplate(
            "/script/head",
            "Script",
            JSON.stringify(headScript.content)
          );
          if (create) return successSave();
          return failedSave();
        }
      } catch (e) {
        console.log(e);
        return failedSave();
      }
    })();
    (async () => {
      try {
        if (preBodyScript.isAvailable) {
          const edit = await editTemplateByUrl(
            "/script/prebody",
            "Script",
            JSON.stringify(preBodyScript.content)
          );
          if (edit) return successSave();
          return failedSave();
        } else {
          const create = await createTemplate(
            "/script/prebody",
            "Script",
            JSON.stringify(preBodyScript.content)
          );
          if (create) return successSave();
          return failedSave();
        }
      } catch (e) {
        console.log(e);
        return failedSave();
      }
    })();
    (async () => {
      try {
        if (postBodyScript.isAvailable) {
          const edit = await editTemplateByUrl(
            "/script/postbody",
            "Script",
            JSON.stringify(postBodyScript.content)
          );
          if (edit) return successSave();
          return failedSave();
        } else {
          const create = await createTemplate(
            "/script/postbody",
            "Script",
            JSON.stringify(postBodyScript.content)
          );
          if (create) return successSave();
          return failedSave();
        }
      } catch (e) {
        console.log(e);
        return failedSave();
      }
    })();
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-12", children: /* @__PURE__ */ jsxs("div", { className: "col-span-6", children: [
      /* @__PURE__ */ jsxs(ComponentCard, { title: "Logo Image", children: [
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
          AdminFeaturedImage,
          {
            url: `${API_URL}/${logoImage.content.url}`,
            onSave: saveLogoImageHandler
          }
        ) }),
        /* @__PURE__ */ jsx(Button, { onClick: saveLogoHandler, children: "Save Logo" })
      ] }),
      /* @__PURE__ */ jsxs(ComponentCard, { title: "Additional Scripts", children: [
        /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("p", { children: [
            "Insert scripts inside ",
            "<head>",
            " tag"
          ] }),
          /* @__PURE__ */ jsx(TextArea, { placeholder: "<script>", value: headScript.content, onChange: (e) => {
            setHeadScript((prev) => ({ ...prev, content: e, isChanged: true }));
            setBlock(true);
          } })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "spacer py-8" }),
        /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("p", { children: [
            "Insert scripts right after ",
            "<body>",
            " tag"
          ] }),
          /* @__PURE__ */ jsx(TextArea, { placeholder: "<script>", value: preBodyScript.content, onChange: (e) => {
            setPreBodyScript((prev) => ({ ...prev, content: e, isChanged: true }));
            setBlock(true);
          } })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "spacer py-8" }),
        /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs("p", { children: [
            "Insert scripts right before closing ",
            "</body>",
            " tag"
          ] }),
          /* @__PURE__ */ jsx(TextArea, { placeholder: "<script>", value: postBodyScript.content, onChange: (e) => {
            setPostBodyScript((prev) => ({ ...prev, content: e, isChanged: true }));
            setBlock(true);
          } })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "spacer py-8" }),
        /* @__PURE__ */ jsx(Button, { onClick: saveScripts, children: "Save Scripts" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "fixed bottom-6 right-6", children: isDirty && /* @__PURE__ */ jsx(Button, { onClick: saveSettingHandler, children: "Save all settings" }) })
  ] });
};
export {
  SettingPage as default
};
