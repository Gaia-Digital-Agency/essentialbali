import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { P as PageMeta } from "./PageMeta-CUwyhzue.js";
import { C as ComponentCard } from "./ComponentCard-Bt28DbRh.js";
import { I as Input } from "./InputField-CcQ93cDN.js";
import { L as Label } from "./Label-BrqX8kIQ.js";
import { B as Button } from "./Button-Cvygc_ZJ.js";
import { S as Select } from "./Select-BNFsiCfR.js";
import { T as TextArea } from "./TextArea-DQuRajx9.js";
import { R as Radio } from "./Radio-_SrLUrGa.js";
import { k as getAllLocationByType, m as getAllCategory, n as editCategory, o as createCategory, q as getCategoryDescByLocation, r as getCategoryByID, s as deleteCategory } from "./TimeContext-B5j8j_GZ.js";
import { A as Alert } from "./Alert-BmVQb4Hv.js";
import { t as toSlug } from "./slugify-Cun7DOoN.js";
import { u as useAutoDismiss } from "./useTimedMessage-Dt1cSUu_.js";
import { InfoIcon } from "lucide-react";
import ReactSelect from "react-select";
import { g as getAllTags } from "./tags.service-D334lDpz.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableCell, d as TableBody } from "./index-Csm6Oz-R.js";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { P as PaginationWithButton } from "./PaginationWithButton-Bd_Dw6AX.js";
import { P as PageBreadcrumb } from "./PageBreadCrumb-CVUrKnRj.js";
import "tailwind-merge";
import "clsx";
import "axios";
import "react-router";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "slugify";
const DefaultTooltip = ({ message }) => {
  return /* @__PURE__ */ jsxs("div", { className: "relative inline-block group", children: [
    /* @__PURE__ */ jsx(InfoIcon, {}),
    /* @__PURE__ */ jsx("div", { className: "invisible absolute w-48 text-wrap z-50 bottom-full left-1/2 mb-2.5 border border-black -translate-x-1/2 opacity-0 transition-opacity duration-300 group-hover:visible group-hover:opacity-100", children: /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx("div", { className: "drop-shadow-4xl whitespace-nowrap rounded-lg bg-white px-3 py-2 text-md font-medium text-gray-700 dark:bg-[#1E2634] dark:text-white", children: message }),
      /* @__PURE__ */ jsx("div", { className: "absolute -bottom-1 left-1/2 h-3 w-4 -translate-x-1/2 rotate-45 bg-white dark:bg-[#1E2634]" })
    ] }) })
  ] });
};
const InputWrapper = ({
  label,
  children,
  tooltip
}) => {
  return /* @__PURE__ */ jsxs("div", { className: "input-wrapper", children: [
    /* @__PURE__ */ jsxs("div", { className: "label-wrapper mb-4 flex gap-x-2 items-center", children: [
      /* @__PURE__ */ jsx("p", { children: label }),
      tooltip && /* @__PURE__ */ jsx(DefaultTooltip, { message: tooltip })
    ] }),
    children
  ] });
};
function FormCategories({
  selectedCategory,
  clearSelected,
  onSaveSuccess,
  refreshKey
}) {
  const [categoryTitle, setCategoryTitle] = useState("");
  const [categorySubTitle, setCategorySubTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [optIDParent, setOptIDParent] = useState([]);
  const [idParent, setIDParent] = useState(0);
  const [templateName, setTemplateName] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedLocationType, setSelectedLocationType] = useState("global");
  const [vaDataLocation, setDataLocation] = useState([]);
  const [idLocation, setIdLocation] = useState(0);
  const [isChild, setIsChild] = useState(false);
  useEffect(() => {
    if (selectedCategory) {
      console.log("selectedCategory", typeof selectedCategory.is_child);
      setCategoryTitle(selectedCategory.title);
      setCategorySubTitle(selectedCategory.sub_title);
      setSlug(selectedCategory.slug_title);
      setDescription(selectedCategory.description);
      setIDParent(selectedCategory.id_parent);
      setTemplateName(selectedCategory.template_name);
      setTags(selectedCategory.tag ?? []);
      setIsChild(selectedCategory.is_child);
    }
  }, [selectedCategory]);
  useEffect(() => {
    const fetchDataLocation = async () => {
      var _a;
      try {
        const vaLocBegin = { key: 0, value: 0, label: "Select Bali Scope" };
        let vaData;
        if (selectedLocationType !== "global") {
          vaData = await getAllLocationByType(selectedLocationType);
          const optDataLocation = ((_a = vaData.data) == null ? void 0 : _a.map((loc) => ({
            key: loc.id,
            value: loc.id,
            label: loc.name
          }))) ?? [];
          setDataLocation([vaLocBegin, ...optDataLocation]);
        } else {
          setDataLocation([vaLocBegin]);
        }
      } catch (error2) {
        console.error(error2);
        throw error2;
      }
    };
    fetchDataLocation();
  }, [selectedLocationType]);
  useEffect(() => {
    const fetchIDParent = async () => {
      try {
        const response = await getAllCategory();
        const vaOption = response.data.map((item) => ({
          value: item.id,
          label: item.title
        }));
        setOptIDParent(vaOption);
      } catch (error2) {
        console.error("Error fetching data:", error2);
      }
    };
    fetchIDParent();
  }, [refreshKey]);
  const handleSubmit = async (e) => {
    var _a, _b;
    e.preventDefault();
    try {
      const vaData = {
        title: categoryTitle,
        sub_title: categorySubTitle,
        slug_title: toSlug(slug),
        description,
        id_parent: idParent,
        template_name: templateName,
        tag: tags
      };
      if (selectedLocationType !== "global") {
        if (!idLocation) {
          setError("Please Select Bali Scope");
          return;
        }
        if (selectedLocationType === "country") {
          vaData.id_country = idLocation;
        } else if (selectedLocationType === "city") {
          vaData.id_city = idLocation;
        } else if (selectedLocationType === "region") {
          vaData.id_region = idLocation;
        }
      }
      if (selectedCategory) {
        await editCategory(selectedCategory.id, vaData);
        setSuccess(categoryTitle + " is Updated Successfully");
      } else {
        await createCategory(vaData);
        setSuccess(categoryTitle + " is Created Successfully");
      }
      clearSelected();
      setSuccess(categoryTitle + " is Created Successfully");
      setCategoryTitle("");
      setCategorySubTitle("");
      setSlug("");
      setDescription("");
      setIDParent(0);
      setTemplateName("");
      setIdLocation(0);
      setSelectedLocationType("global");
      setTags([]);
      onSaveSuccess();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err;
        setError(((_b = (_a = errorObj.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) ?? "Something went wrong");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const handleCategoryTitle = (e) => {
    const cTitle = e.target.value;
    const cSlug = selectedCategory ? selectedCategory.slug_title : toSlug(cTitle);
    setCategoryTitle(cTitle);
    setSlug(cSlug);
  };
  const handleSelectLocation = async (value) => {
    setIdLocation(Number(value));
    if (selectedCategory) {
      try {
        const vaResponse = await getCategoryDescByLocation(
          selectedLocationType,
          Number(value),
          selectedCategory.id
        );
        const vaDataDesc = vaResponse.data;
        setDescription(vaDataDesc.description);
        setCategorySubTitle(vaDataDesc.sub_title);
      } catch (error2) {
        console.error(error2);
        throw error2;
      }
    }
  };
  const handleSelectIDParent = (value) => {
    setIDParent(Number(value));
  };
  const handleRadioChange = async (value) => {
    setSelectedLocationType(value);
    setIdLocation(0);
    await handleSelectLocation(0);
  };
  useAutoDismiss(success, setSuccess);
  useAutoDismiss(error, setError);
  const [availableTags, setAvailableTags] = useState([]);
  const [tags, setTags] = useState([]);
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const getTags = await getAllTags();
        setAvailableTags(getTags.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchTags();
  }, []);
  const tagsChangeHandler = (e) => {
    setTags(
      e.map((tag) => tag.value)
    );
  };
  const renderTags = () => {
    if (!availableTags.length || isChild) return;
    return /* @__PURE__ */ jsx(InputWrapper, { label: "Related Tags", children: /* @__PURE__ */ jsx(
      ReactSelect,
      {
        options: availableTags.map((tag) => ({
          label: tag.name,
          value: tag.id
        })),
        isMulti: true,
        onChange: tagsChangeHandler,
        value: availableTags.filter((tag) => tags.includes(tag.id)).map((tag) => ({ value: tag.id, label: tag.name }))
      }
    ) });
  };
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs(
    ComponentCard,
    {
      title: selectedCategory ? "Edit Category" : "Add Category",
      children: [
        /* @__PURE__ */ jsx("div", { className: "mb-5", children: error && /* @__PURE__ */ jsx(Alert, { variant: "error", title: "Error", message: error }) }),
        /* @__PURE__ */ jsx("div", { className: "mb-5", children: success && /* @__PURE__ */ jsx(Alert, { variant: "success", title: "Success", message: success }) }),
        /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "cCategoryTitle", children: "Category Title" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "text",
                id: "cCategoryTitle",
                onChange: handleCategoryTitle,
                value: categoryTitle,
                placeholder: "Acme"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "cSlug", children: "Slug" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "text",
                id: "cSlug",
                onChange: (e) => setSlug(e.target.value),
                value: slug,
                placeholder: "slug-category"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Bali Scope" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-8", children: [
              /* @__PURE__ */ jsx(
                Radio,
                {
                  id: "optLocationType_global",
                  name: "group1",
                  value: "global",
                  checked: selectedLocationType === "global",
                  onChange: handleRadioChange,
                  label: "All Bali"
                }
              ),
              /* @__PURE__ */ jsx(
                Radio,
                {
                  id: "optLocationType_country",
                  name: "group1",
                  value: "country",
                  checked: selectedLocationType === "country",
                  onChange: handleRadioChange,
                  label: "Bali Area"
                }
              ),
              /* @__PURE__ */ jsx(
                Radio,
                {
                  id: "optLocationType_city",
                  name: "group1",
                  value: "city",
                  checked: selectedLocationType === "city",
                  onChange: handleRadioChange,
                  label: "Sub Area"
                }
              ),
              /* @__PURE__ */ jsx(
                Radio,
                {
                  id: "optLocationType_region",
                  name: "group1",
                  value: "region",
                  checked: selectedLocationType === "region",
                  onChange: handleRadioChange,
                  label: "Local Zone"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Bali Scope" }),
            /* @__PURE__ */ jsx(
              Select,
              {
                options: vaDataLocation,
                value: idLocation,
                placeholder: "Select Bali Scope",
                onChange: handleSelectLocation,
                className: "h-lg dark:bg-dark-900"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "cCategorySubTitle", children: "Category Sub Title" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "text",
                id: "cCategorySubTitle",
                onChange: (e) => setCategorySubTitle(e.target.value),
                value: categorySubTitle,
                placeholder: "Sub Title..."
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Description" }),
            /* @__PURE__ */ jsx(
              TextArea,
              {
                value: description,
                onChange: (value) => setDescription(value),
                rows: 6,
                placeholder: "Enter Description..."
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "ID Parent" }),
            /* @__PURE__ */ jsx(
              Select,
              {
                options: [{ value: 0, label: "-" }, ...optIDParent],
                value: idParent,
                placeholder: "Select an option",
                onChange: handleSelectIDParent,
                className: "h-lg dark:bg-dark-900"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { children: "Template Name" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "text",
                id: "cTemplateName",
                onChange: (e) => setTemplateName(e.target.value),
                value: templateName,
                placeholder: "Template Name..."
              }
            )
          ] }),
          renderTags(),
          /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { className: "w-1/3", children: "Save" }) })
        ] }) })
      ]
    }
  ) });
}
function TableCategories({
  refreshKey,
  onEditCategory,
  onSaveSuccess
}) {
  const [dataCategories, setDataCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    const fetchIDParent = async () => {
      try {
        const response = await getAllCategory();
        setDataCategories(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchIDParent();
  }, [refreshKey]);
  async function handleEditButtonClick(id) {
    try {
      const response = await getCategoryByID(id);
      onEditCategory(response.data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
  async function handleDeleteButtonClick(id) {
    var _a, _b;
    try {
      await deleteCategory(id);
      onSaveSuccess();
      withReactContent(Swal).fire({
        title: "Deleted!",
        text: "Category has been deleted.",
        icon: "success"
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      let message = "Failed to delete category";
      if ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      withReactContent(Swal).fire({
        title: "Error",
        text: message,
        icon: "error"
      });
    }
  }
  const showSwal = (categoryTitle, id) => {
    withReactContent(Swal).fire({
      title: `Are you sure to Delete ${categoryTitle}?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteButtonClick(id);
      }
    });
  };
  const filteredAndSortedData = useMemo(() => {
    return dataCategories.filter(
      (item) => [item.title, item.slug_title, item.sub_title].some(
        (value) => value == null ? void 0 : value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [dataCategories, searchTerm]);
  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(ComponentCard, { title: "Category Datas", children: /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 px-4 py-4 border border-b-1 border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("span", { className: "text-gray-500 dark:text-gray-400", children: " Show " }),
        /* @__PURE__ */ jsxs("div", { className: "relative z-20 bg-transparent", children: [
          /* @__PURE__ */ jsx(
            "select",
            {
              className: "w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800",
              value: itemsPerPage,
              onChange: (e) => setItemsPerPage(Number(e.target.value)),
              children: [5, 10].map((value) => /* @__PURE__ */ jsx(
                "option",
                {
                  value,
                  className: "text-gray-500 dark:bg-gray-900 dark:text-gray-400",
                  children: value
                },
                value
              ))
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "absolute z-30 text-gray-500 -translate-y-1/2 right-2 top-1/2 dark:text-gray-400", children: /* @__PURE__ */ jsx(
            "svg",
            {
              className: "stroke-current",
              width: "16",
              height: "16",
              viewBox: "0 0 16 16",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M3.8335 5.9165L8.00016 10.0832L12.1668 5.9165",
                  stroke: "",
                  strokeWidth: "1.2",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              )
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-gray-500 dark:text-gray-400", children: [
          " ",
          "entries",
          " "
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          type: "text",
          placeholder: "Search...",
          className: "px-3 py-2 text-sm border rounded-lg dark:bg-gray-800 dark:text-white",
          value: searchTerm,
          onChange: (e) => setSearchTerm(e.target.value)
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "max-w-full overflow-x-auto", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { className: "border-b border-l-amber-800 dark:border-white/[0.05]", children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400 max-w-[10px]",
            children: "Title"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400",
            children: "Sub Title"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400",
            children: "Slug"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400",
            children: "Parent Category"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400",
            children: "Edit?"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400",
            children: "Delete"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { className: "divide-y divide-gray-100 dark:divide-white/[0.05]", children: currentData.map((cat) => /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-lg dark:text-gray-400", children: cat.title }),
        /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-lg dark:text-gray-400", children: cat.sub_title }),
        /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-lg dark:text-gray-400", children: cat.slug_title }),
        /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-lg dark:text-gray-400", children: cat.parent }),
        /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-lg dark:text-gray-400", children: /* @__PURE__ */ jsx(
          Button,
          {
            onClick: () => handleEditButtonClick(cat.id),
            size: "sm",
            className: "bg-green-600 hover:bg-green-700",
            children: "Edit"
          }
        ) }),
        /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-lg dark:text-gray-400", children: /* @__PURE__ */ jsx(
          Button,
          {
            onClick: () => showSwal(cat.title, cat.id),
            size: "sm",
            className: "bg-red-400 hover:bg-red-700",
            children: "Delete"
          }
        ) })
      ] }, cat.id)) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "border border-t-1 rounded-b-xl border-gray-100 py-4 pl-[18px] pr-4 dark:border-white/[0.05]", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col xl:flex-row xl:items-center xl:justify-between", children: [
      /* @__PURE__ */ jsx("div", { className: "pt-3 xl:pt-0", children: /* @__PURE__ */ jsxs("p", { className: "pt-3 text-sm font-medium text-center text-gray-500 border-t border-gray-100 dark:border-gray-800 dark:text-gray-400 xl:border-t-0 xl:pt-0 xl:text-left", children: [
        "Showing ",
        startIndex + 1,
        " to ",
        endIndex,
        " of ",
        totalItems,
        " entries"
      ] }) }),
      /* @__PURE__ */ jsx(
        PaginationWithButton,
        {
          totalPages,
          initialPage: currentPage,
          onPageChange: handlePageChange
        }
      )
    ] }) })
  ] }) }) });
}
function MstCategories() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(
    null
  );
  function handleSaveSuccess() {
    setRefreshKey((prev) => prev + 1);
    setSelectedCategory(null);
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      PageMeta,
      {
        title: "essentialbali Admin Dashboard | Master Categories",
        description: "This is Master Categories Dashboard page for essentialbali Admin Dashboard Template"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6 xl:grid-cols-1", children: /* @__PURE__ */ jsxs("div", { className: "space-y-12", children: [
      /* @__PURE__ */ jsx(PageBreadcrumb, { pageTitle: "Master Categories" }),
      /* @__PURE__ */ jsx(
        FormCategories,
        {
          selectedCategory,
          onSaveSuccess: handleSaveSuccess,
          clearSelected: () => setSelectedCategory(null),
          refreshKey
        }
      ),
      /* @__PURE__ */ jsx(
        TableCategories,
        {
          refreshKey,
          onEditCategory: setSelectedCategory,
          onSaveSuccess: handleSaveSuccess
        }
      )
    ] }) })
  ] });
}
export {
  MstCategories as default
};
