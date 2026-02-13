import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { g as getTemplateByUrl, e as editTemplateByUrl, c as createTemplate } from "./template.service-BkOXTsSh.js";
import { useSearchParams, useNavigate } from "react-router";
import ReactSelect from "react-select";
import { H as HomeTemplate, A as AdminHeroImage, a as AdminTrending, b as AdminMostPopular, c as AdminEventsHome, d as AdminUltimateGuide } from "./Trending-BuZDUftN.js";
import { C as ComponentCard } from "./ComponentCard-Bt28DbRh.js";
import { u as useSidebar } from "./SidebarContext-CGWfWy5i.js";
import { b as getArticleByFields } from "./article.service-DlhMD6VX.js";
import { i as useNotification, c as useTaxonomies } from "./TimeContext-B5j8j_GZ.js";
import { u as useModal } from "./useModal-C9BZm3Uo.js";
import { M as Modal } from "./index-CqfhKOI8.js";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { B as Button } from "./Button-Cvygc_ZJ.js";
import { S as SvgTrash } from "./trash-Bt7_4fA6.js";
import { u as useNavigationPrompt } from "./useNavigationPrompt-DiFBqK8C.js";
import "./Button-CxQtGc7t.js";
import "@gsap/react";
import "gsap";
import "./useArticle-m4fjTi_P.js";
import "./Image-Dgi2d_09.js";
import "react-router-dom";
import "react-loading-skeleton";
import "./TextLink-DlB-UhGi.js";
import "swiper/react";
/* empty css                       */
import "swiper/modules";
import "./Newsletter-BG-n68FY.js";
import "./newsletter.service-BbHT4ENG.js";
import "./format-ChXytroW.js";
import "date-fns";
import "./Advertisement-CxJIGt1g.js";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
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
const ArticleSelector = ({ modalKey, onSave, preContent }) => {
  const [selectedArticle, setSelectedArticle] = useState([]);
  const [availableArticles, setAvailableArticles] = useState([]);
  const [render, setRender] = useState([]);
  const [searchParams] = useSearchParams();
  const { setNotification } = useNotification();
  const { adminTaxonomies, taxonomies } = useTaxonomies();
  const url = searchParams.get("url");
  if (!url) {
    setNotification({ message: "url is not set", type: "fail" });
    return;
  }
  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
    const items = reorder(
      selectedArticle,
      result.source.index,
      result.destination.index
    );
    setSelectedArticle(items);
  };
  useEffect(() => {
    const locations = url == null ? void 0 : url.split("/").filter(Boolean);
    (async () => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      const get = await getArticleByFields({
        id_country: ((_b = (_a = adminTaxonomies.countries) == null ? void 0 : _a.find((coun) => coun.slug == locations[0])) == null ? void 0 : _b.id) ?? void 0,
        id_city: ((_d = (_c = adminTaxonomies.cities) == null ? void 0 : _c.find((coun) => coun.slug == locations[1])) == null ? void 0 : _d.id) ?? void 0,
        id_region: ((_f = (_e = adminTaxonomies.regions) == null ? void 0 : _e.find((coun) => coun.slug == locations[1])) == null ? void 0 : _f.id) ?? void 0,
        category: ((_h = (_g = taxonomies.categories) == null ? void 0 : _g.find((cat) => {
          var _a2, _b2;
          return ((_b2 = (_a2 = HomeTemplate[modalKey].query) == null ? void 0 : _a2.category) == null ? void 0 : _b2.slug) == cat.slug_title;
        })) == null ? void 0 : _h.id) ?? void 0
      });
      if (get == null ? void 0 : get.articles) {
        setAvailableArticles(get.articles);
      } else {
        setNotification({ message: "something is wrong, cannot get the articles from server", type: "fail" });
      }
    })();
  }, []);
  const deleteHandler = (id, i) => {
    setSelectedArticle(() => {
      const copySelected = [...selectedArticle];
      return copySelected.map((select) => {
        if (select === 0 || (select == null ? void 0 : select.id) == id) return 0;
        return select;
      });
    });
    setRender(() => {
      const copyRender = [...render];
      copyRender[i] = 0;
      return copyRender;
    });
  };
  const renderArticle = (article, index) => {
    const articleItem = () => {
      if (!article) return;
      return /* @__PURE__ */ jsxs("div", { className: "flex justify-between", children: [
        /* @__PURE__ */ jsx("div", { className: "title", children: /* @__PURE__ */ jsx("p", { children: article.title }) }),
        /* @__PURE__ */ jsx("div", { className: "icon", onClick: () => {
          deleteHandler(article.id, index);
        }, children: /* @__PURE__ */ jsx(SvgTrash, {}) })
      ] });
    };
    const blankItem = () => {
      return /* @__PURE__ */ jsx("div", { className: "flex", children: /* @__PURE__ */ jsx("p", { children: "Select an article to fill here" }) });
    };
    const renderItem = () => {
      if (article) return articleItem();
      return blankItem();
    };
    return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(Draggable, { draggableId: `draggable-${index}`, index, children: (provided, snapshot) => /* @__PURE__ */ jsx(
      "div",
      {
        ref: provided.innerRef,
        ...provided.draggableProps,
        ...provided.dragHandleProps,
        style: { ...getItemStyle(
          snapshot.isDragging,
          provided.draggableProps.style ?? {}
        ), marginBottom: "1rem", backgroundColor: article ? "rgb(241, 241, 241)" : "transparent", border: article ? "" : "2px dashed #000" },
        children: renderItem()
      }
    ) }, `draggable-${index}`) });
  };
  const saveHandler = () => {
    onSave(selectedArticle, modalKey);
  };
  useEffect(() => {
    setSelectedArticle([]);
    setRender([]);
    preContent.forEach((content, i) => {
      setSelectedArticle((prev) => {
        return [...prev, content];
      });
      setRender((prev) => {
        return [...prev, renderArticle(content, i)];
      });
    });
  }, []);
  useEffect(() => {
    if (selectedArticle.length) {
      setRender(() => {
        const rowsRender = [];
        selectedArticle.forEach((article, i) => {
          rowsRender.push(renderArticle(article, i));
        });
        return rowsRender;
      });
    }
  }, [selectedArticle]);
  const selectHandler = (value) => {
    console.log(value);
    setSelectedArticle(() => {
      const copySelected = [...selectedArticle];
      const index = selectedArticle.findIndex((select) => select == 0);
      if (index > -1) {
        copySelected[index] = value;
      }
      return copySelected;
    });
  };
  const changeHandler = (value) => {
    if (!value) return;
    if (!selectedArticle.filter((art) => art == 0).length) {
      setNotification({ message: "Remove one of the selected article first before selecting", type: "fail" });
      return;
    }
    selectHandler(value);
  };
  if (!render.length) return;
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(ComponentCard, { title: modalKey, children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-12", children: [
    /* @__PURE__ */ jsxs("div", { className: "col-span-6", children: [
      /* @__PURE__ */ jsx(DragDropContext, { onDragEnd, children: /* @__PURE__ */ jsx(Droppable, { droppableId: "droppable", children: (provided, snapshot) => /* @__PURE__ */ jsx(
        "div",
        {
          ...provided.droppableProps,
          ref: provided.innerRef,
          style: getListStyle(snapshot.isDraggingOver),
          children: render
        }
      ) }) }),
      /* @__PURE__ */ jsx(Button, { onClick: saveHandler, children: "Save" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "col-span-6", children: /* @__PURE__ */ jsx(
      ReactSelect,
      {
        options: availableArticles.map((article) => {
          return { value: article, label: article.title };
        }),
        styles: {
          menu: () => {
            return { position: "relative" };
          }
        },
        menuIsOpen: true,
        onChange: (newValue) => {
          changeHandler(newValue == null ? void 0 : newValue.value);
        },
        value: void 0
      }
    ) })
  ] }) }) });
};
const LocationTemplateExp = () => {
  const [templateContent, setTemplateContent] = useState(HomeTemplate);
  const isAvailable = useRef(false);
  const [modalKey, setModalKey] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [searcParams] = useSearchParams();
  const navigate = useNavigate();
  const { isOpen, closeModal, openModal } = useModal(true);
  const { closeSidebar } = useSidebar();
  const { setBlock } = useNavigationPrompt();
  const { setNotification } = useNotification();
  useEffect(() => {
    closeSidebar();
    (async () => {
      var _a;
      const url = searcParams.get("url");
      if (!url) {
        navigate("/admin/mst_templates");
        return;
      }
      const get = await getTemplateByUrl(`/v2${url}`);
      if ((get == null ? void 0 : get.status_code) == 200 && ((_a = get.data) == null ? void 0 : _a.content)) {
        setTemplateContent(JSON.parse(get.data.content));
        isAvailable.current = true;
      } else {
        setTemplateContent(HomeTemplate);
        isAvailable.current = false;
      }
    })();
  }, []);
  useEffect(() => {
    setBlock(isDirty);
  }, [isDirty]);
  const saveHandler = (articles, key) => {
    setTemplateContent((prev) => {
      return { ...prev, [key]: { ...prev[key], articles } };
    });
    setIsDirty(true);
    setModalKey(false);
    closeModal();
  };
  const clickHandler = (key) => {
    setModalKey(key);
    openModal();
  };
  const closeHandler = () => {
    setModalKey(false);
    closeModal();
  };
  console.log(templateContent == null ? void 0 : templateContent.ultimateGuide.articles, "trending");
  const renderModal = () => {
    if (!modalKey) return /* @__PURE__ */ jsx(Fragment, {});
    return /* @__PURE__ */ jsx(Modal, { isOpen, onClose: closeHandler, children: /* @__PURE__ */ jsx(ArticleSelector, { modalKey, onSave: saveHandler, preContent: templateContent == null ? void 0 : templateContent[modalKey].articles }) });
  };
  const saveTemplateHandler = async () => {
    const url = searcParams.get("url");
    if (isAvailable.current && url) {
      const edit = await editTemplateByUrl(`/v2${url}`, "Home", JSON.stringify(templateContent));
      if (edit) {
        setNotification({ message: "Action Success", type: "neutral" });
      } else {
        setNotification({ message: "Action Failed", type: "fail" });
      }
    }
    if (!isAvailable.current && url) {
      const create = await createTemplate(`/v2${url}`, "Home", JSON.stringify(templateContent));
      if (create) {
        setNotification({ message: "Action Success", type: "neutral" });
      } else {
        setNotification({ message: "Action Failed", type: "fail" });
      }
    }
    setIsDirty(false);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Button, { onClick: saveTemplateHandler, children: "Save Template" }),
    /* @__PURE__ */ jsx("div", { className: "spacer py-6" }),
    /* @__PURE__ */ jsx(ComponentCard, { title: "Hero Image", buttonText: "Edit Articles", buttonOnClick: () => {
      clickHandler("heroImage");
    }, children: /* @__PURE__ */ jsx(AdminHeroImage, { preContent: templateContent == null ? void 0 : templateContent.heroImage.articles }) }),
    /* @__PURE__ */ jsx("div", { className: "spacer py-6" }),
    /* @__PURE__ */ jsx(ComponentCard, { title: "Trending", buttonText: "Edit Articles", buttonOnClick: () => {
      clickHandler("trending");
    }, children: /* @__PURE__ */ jsx(AdminTrending, { preContent: templateContent == null ? void 0 : templateContent.trending.articles }) }),
    /* @__PURE__ */ jsx("div", { className: "spacer py-6" }),
    /* @__PURE__ */ jsx(ComponentCard, { title: "Most Popular", buttonText: "Edit Articles", buttonOnClick: () => {
      clickHandler("mostPopular");
    }, children: /* @__PURE__ */ jsx(AdminMostPopular, { preContent: templateContent == null ? void 0 : templateContent.mostPopular.articles }) }),
    /* @__PURE__ */ jsx("div", { className: "spacer py-6" }),
    /* @__PURE__ */ jsx(ComponentCard, { title: "Events", buttonText: "Edit Articles", buttonOnClick: () => {
      clickHandler("events");
    }, children: /* @__PURE__ */ jsx(AdminEventsHome, { preContent: templateContent == null ? void 0 : templateContent.events.articles }) }),
    /* @__PURE__ */ jsx("div", { className: "spacer py-6" }),
    /* @__PURE__ */ jsx(ComponentCard, { title: "Ultimate Guide", buttonText: "Edit Articles", buttonOnClick: () => {
      clickHandler("ultimateGuide");
    }, children: /* @__PURE__ */ jsx(AdminUltimateGuide, { preContent: templateContent == null ? void 0 : templateContent.ultimateGuide.articles }) }),
    /* @__PURE__ */ jsx("div", { className: "spacer py-6" }),
    renderModal()
  ] });
};
export {
  LocationTemplateExp as default
};
