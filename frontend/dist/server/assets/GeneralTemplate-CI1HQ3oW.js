import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { g as getTemplateByUrl, e as editTemplateByUrl, c as createTemplate } from "./template.service-BkOXTsSh.js";
import { B as Button } from "./Button-Cvygc_ZJ.js";
import { u as useNavigationPrompt } from "./useNavigationPrompt-DiFBqK8C.js";
import { C as ComponentCard } from "./ComponentCard-Bt28DbRh.js";
import { i as useNotification, m as getAllCategory, c as useTaxonomies } from "./TimeContext-B5j8j_GZ.js";
import { S as SvgTrash } from "./trash-Bt7_4fA6.js";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ReactSelect from "react-select";
import "react-router-dom";
import "axios";
import "react-router";
import "react-fast-compare";
import "invariant";
import "shallowequal";
const transformCategories = (categories) => {
  if (!categories) return;
  const map = /* @__PURE__ */ new Map();
  const roots = [];
  for (const cat of categories) {
    map.set(cat.id, { label: cat.title, value: cat.id, children: [] });
  }
  for (const cat of categories) {
    const node = map.get(cat.id);
    if (cat.id_parent === 0 || cat.id_parent === null) {
      roots.push(node);
    } else {
      const parent = map.get(cat.id_parent);
      if (parent) parent.children.push(node);
    }
  }
  return roots.map((cat) => {
    if (cat.children.length > 0) {
      return {
        label: cat.label,
        options: [
          { label: cat.label, value: cat.value, level: 0 },
          ...cat.children.map((c) => ({
            label: c.label,
            value: c.value,
            level: 1
          }))
        ]
      };
    }
    return { label: cat.label, value: cat.value, level: 0 };
  });
};
const MenuRender = ({ id, menu, onChange, onDelete }) => {
  var _a, _b, _c, _d;
  const { taxonomies } = useTaxonomies();
  const changeHandler = (type, val) => {
    if (val) {
      onChange(id, type, val);
    }
  };
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "menu-edit flex items-center", children: [
    /* @__PURE__ */ jsx("div", { className: "input-wrapper", children: /* @__PURE__ */ jsx(ReactSelect, { className: "w-100", required: true, options: transformCategories(taxonomies.categories), placeholder: "Select Category", value: { value: menu.linkCategory, label: (_b = (_a = taxonomies.categories) == null ? void 0 : _a.find((cat) => cat.id == menu.linkCategory)) == null ? void 0 : _b.title, level: ((_d = (_c = taxonomies.categories) == null ? void 0 : _c.find((cat) => cat.id == menu.linkCategory)) == null ? void 0 : _d.id_parent) ? 1 : 0 }, onChange: (newValue) => {
      changeHandler("linkCategory", newValue == null ? void 0 : newValue.value);
    }, classNames: {
      option: (props) => {
        var _a2;
        if (((_a2 = props.data) == null ? void 0 : _a2.level) == 1) {
          return "text-front-small ml-2 before-dash";
        }
        return "";
      }
    } }) }),
    /* @__PURE__ */ jsx("div", { className: "input-wrapper", children: /* @__PURE__ */ jsx("div", { className: "icon-delete pl-4", children: /* @__PURE__ */ jsx("div", { onClick: () => {
      onDelete(id);
    }, className: "delete cursor-pointer w-[32px] h-[32px] flex justify-center items-center border border-black rounded-full", children: /* @__PURE__ */ jsx(SvgTrash, { className: "" }) }) }) })
  ] }) });
};
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};
const grid = 8;
const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  // userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  // change background colour if dragging
  background: isDragging ? "lightgreen" : "#f1f1f1",
  // styles we need to apply on draggables
  ...draggableStyle
});
const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "lightblue" : "white",
  padding: grid,
  width: 800
});
const GeneralTemplate = () => {
  const { setNotification } = useNotification();
  const [menuHeaderTemplate, setMenuHeaderTemplate] = useState([]);
  const [isTemplateAvailable, setIsTemplateAvailable] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const { setBlock } = useNavigationPrompt();
  const TEMPLATE_URL = "/header";
  const TEMPLATE_TYPE = "Header";
  const defaultMenuProps = {
    label: "",
    url: "",
    linkCategory: 0
  };
  useEffect(() => {
    (async () => {
      var _a;
      try {
        const getTemplate = await getTemplateByUrl(TEMPLATE_URL);
        if (((_a = getTemplate == null ? void 0 : getTemplate.data) == null ? void 0 : _a.content) && getTemplate.status_code == 200) {
          let temp = [];
          const content = JSON.parse(getTemplate.data.content);
          Object.keys(content).forEach((key) => {
            var _a2, _b, _c;
            const ke = key;
            temp.push({ label: (_a2 = content[ke]) == null ? void 0 : _a2.label, url: (_b = content[ke]) == null ? void 0 : _b.url, linkCategory: (_c = content[ke]) == null ? void 0 : _c.linkCategory });
          });
          setMenuHeaderTemplate(temp);
          setIsTemplateAvailable(true);
        } else {
          setMenuHeaderTemplate([defaultMenuProps]);
        }
      } catch (e) {
        console.log(e);
      }
      try {
        const getCategories = await getAllCategory();
        if (getCategories.data) {
          setAvailableCategories(getCategories.data.map((val) => {
            return { value: val.id, label: val.title };
          }));
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }, []);
  const menuChangeHandler = (index, type, value) => {
    const newArr = [...menuHeaderTemplate];
    newArr[index] = { ...newArr[index], [type]: value };
    if (type == "linkCategory") {
      newArr[index] = { ...newArr[index], url: "" };
    }
    setMenuHeaderTemplate(newArr);
    setBlock(true);
  };
  const deleteHandler = (index) => {
    const newArr = [...menuHeaderTemplate].filter((val, i) => {
      console.log(index);
      if (i != index) return val;
    });
    setMenuHeaderTemplate(newArr);
  };
  const saveHandler = async () => {
    if (isTemplateAvailable) {
      const edit = await editTemplateByUrl(TEMPLATE_URL, TEMPLATE_TYPE, JSON.stringify(menuHeaderTemplate));
      if (edit) {
        setNotification({ message: "Header menu saved", type: "neutral" });
        setBlock(false);
      } else {
        setNotification({ message: "cant save the changes", type: "fail" });
      }
    } else {
      const create = await createTemplate(TEMPLATE_URL, TEMPLATE_TYPE, JSON.stringify(menuHeaderTemplate));
      if (create) {
        setNotification({ message: "Success save header menu", type: "neutral" });
        setIsTemplateAvailable(true);
        setBlock(false);
      }
    }
  };
  const addMenuHandler = () => {
    setMenuHeaderTemplate((prev) => {
      return [...prev, defaultMenuProps];
    });
    setBlock(true);
  };
  const onDragEnd = (result) => {
    console.log(result);
    if (!result.destination) {
      return;
    }
    const items = reorder(
      menuHeaderTemplate,
      result.source.index,
      result.destination.index
    );
    console.log(items);
    setMenuHeaderTemplate(items);
  };
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12 gap-x-4", children: [
    /* @__PURE__ */ jsx("div", { className: "col-span-10", children: /* @__PURE__ */ jsxs(ComponentCard, { title: "Header Navigation", children: [
      /* @__PURE__ */ jsx(DragDropContext, { onDragEnd, children: /* @__PURE__ */ jsx(Droppable, { droppableId: "droppable", children: (provided, snapshot) => /* @__PURE__ */ jsx(
        "div",
        {
          ...provided.droppableProps,
          ref: provided.innerRef,
          style: getListStyle(snapshot.isDraggingOver),
          children: menuHeaderTemplate.map((menu, i) => {
            if (menu) {
              return /* @__PURE__ */ jsx(Draggable, { draggableId: `draggable-${i}`, index: i, children: (provided2, snapshot2) => /* @__PURE__ */ jsx(
                "div",
                {
                  ref: provided2.innerRef,
                  ...provided2.draggableProps,
                  ...provided2.dragHandleProps,
                  style: { ...getItemStyle(
                    snapshot2.isDragging,
                    provided2.draggableProps.style ?? {}
                  ), marginBottom: "1rem" },
                  children: /* @__PURE__ */ jsx(MenuRender, { id: i, menu, onDelete: deleteHandler, onChange: menuChangeHandler, availableCategories })
                }
              ) }, `draggable-${i}`);
            }
          })
        }
      ) }) }),
      /* @__PURE__ */ jsx(Button, { onClick: addMenuHandler, children: "Add Menu" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "col-span-2", children: /* @__PURE__ */ jsx(ComponentCard, { children: /* @__PURE__ */ jsx("div", { className: "text-center", children: /* @__PURE__ */ jsx(Button, { onClick: saveHandler, children: "Save" }) }) }) })
  ] }) });
};
export {
  GeneralTemplate as default
};
