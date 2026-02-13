import { j as apiClient } from "./TimeContext-B5j8j_GZ.js";
const getTemplateByUrl = async (url) => {
  try {
    const getTemplate = await apiClient.get(`templating/query?url=${url}`);
    if (getTemplate.status == 200) {
      return getTemplate.data;
    }
  } catch (e) {
  }
};
const createTemplate = async (url, template, content) => {
  try {
    const create = await apiClient.post("templating", {
      url,
      content,
      template
    });
    if (create.data.status_code == 200) {
      return true;
    } else {
      throw Error();
    }
  } catch (e) {
    console.log(e);
  }
};
const editTemplate = async (url, template, content) => {
  var _a, _b;
  try {
    const getId = await getTemplateByUrl(url);
    if (((_a = getId == null ? void 0 : getId.data) == null ? void 0 : _a.id) && getId.status_code == 200) {
      const edit = await apiClient.put(`templating/${(_b = getId.data) == null ? void 0 : _b.id}`, {
        url,
        template,
        content
      });
      if (edit.data.status_code == 200) return true;
      return false;
    }
    return false;
  } catch (e) {
    console.log(e);
  }
};
const editTemplateByUrl = async (url, template, content) => {
  try {
    const urlParams = new URLSearchParams();
    urlParams.append("url", url);
    const edit = await apiClient.put("templating/edit/?" + urlParams.toString(), {
      url,
      content,
      template
    });
    if (edit.data.status_code == 200) {
      return true;
    }
  } catch (e) {
    console.log(e);
  }
};
const deleteTemplate = async (url) => {
  try {
    const urlParams = new URLSearchParams();
    urlParams.append("url", url);
    const deleteId = await apiClient.delete(`templating/?${urlParams.toString()}`);
    if (deleteId) {
      return true;
    }
  } catch (e) {
    console.log(e);
  }
};
export {
  editTemplate as a,
  createTemplate as c,
  deleteTemplate as d,
  editTemplateByUrl as e,
  getTemplateByUrl as g
};
