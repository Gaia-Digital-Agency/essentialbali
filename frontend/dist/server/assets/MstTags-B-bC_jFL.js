import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { P as PageBreadcrumb } from "./PageBreadCrumb-CVUrKnRj.js";
import { P as PageMeta } from "./PageMeta-CUwyhzue.js";
import { I as Input } from "./InputField-CcQ93cDN.js";
import { L as Label } from "./Label-BrqX8kIQ.js";
import { B as Button } from "./Button-Cvygc_ZJ.js";
import { A as Alert } from "./Alert-BmVQb4Hv.js";
import { S as SvgDownload } from "./download-DnjrKIYZ.js";
import { c as createTag, e as editTag, g as getAllTags, a as getTagByID, d as deleteTag } from "./tags.service-D334lDpz.js";
import { u as useAutoDismiss } from "./useTimedMessage-Dt1cSUu_.js";
import { t as toSlug } from "./slugify-Cun7DOoN.js";
import { A as AdminFeaturedImage } from "./FeaturedImage-756EfM0U.js";
import { u as useModal } from "./useModal-C9BZm3Uo.js";
import { u as useNavigationPrompt } from "./useNavigationPrompt-DiFBqK8C.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableCell, d as TableBody } from "./index-Csm6Oz-R.js";
import { B as Badge } from "./Badge-Djb8EXb-.js";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { P as PaginationWithButton } from "./PaginationWithButton-Bd_Dw6AX.js";
import { C as ComponentCard } from "./ComponentCard-Bt28DbRh.js";
import { S as SvgPencil } from "./pencil-hqMKlMyc.js";
import { S as SvgList } from "./list-DrJX9KeS.js";
import "react-router";
import "tailwind-merge";
import "clsx";
import "./TimeContext-B5j8j_GZ.js";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "slugify";
import "./index-CqfhKOI8.js";
import "./media.service-Bg8ZwuBl.js";
import "./MediaForm-pn_2Hilv.js";
import "react-dropzone";
import "lucide-react";
import "react-router-dom";
const API_URL = "http://34.124.244.233/essentialbali";
function FormTags({ selectedTags, onRefresh }) {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [tagTitle, setTagTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [idToEdit, setIdToEdit] = useState(0);
  const [featuredImage, setFeaturedImage] = useState();
  const { closeModal, openModal } = useModal(false);
  const { setBlock } = useNavigationPrompt();
  useEffect(() => {
    var _a;
    if ((_a = selectedTags == null ? void 0 : selectedTags.data) == null ? void 0 : _a.length) {
      const vaData = selectedTags.data[0];
      setTagTitle(vaData.name ?? "");
      setSlug(vaData.slug ?? "");
      setFeaturedImage({ url: `${API_URL}/${vaData.icon}`, id: vaData.id });
      setIdToEdit(vaData.id ?? 0);
      setIsEdit(true);
    }
  }, [selectedTags]);
  useAutoDismiss(success, setSuccess);
  useAutoDismiss(error, setError);
  const initForm = () => {
    setTagTitle("");
    setSlug("");
    setFeaturedImage({ url: "", id: void 0 });
  };
  const handleSubmit = async (e) => {
    var _a, _b;
    e.preventDefault();
    const vaData = {
      name: tagTitle,
      slug: toSlug(slug),
      icon: featuredImage == null ? void 0 : featuredImage.id
    };
    try {
      console.log(vaData);
      console.log(featuredImage);
      if (!isEdit) {
        await createTag(vaData);
        setSuccess(tagTitle + " is Created Successfully");
      } else {
        await editTag(idToEdit, vaData);
        setSuccess(tagTitle + " is Created Successfully");
      }
      initForm();
      onRefresh();
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
  const handleTagTitle = (e) => {
    const cTitle = e.target.value;
    const cSlug = isEdit ? slug : toSlug(cTitle);
    setTagTitle(cTitle);
    setSlug(cSlug);
  };
  const InputWrapper = ({
    label,
    children
  }) => {
    return /* @__PURE__ */ jsxs("div", { className: "input-wrapper", children: [
      /* @__PURE__ */ jsx(Label, { children: label }),
      children
    ] });
  };
  const featuredImageHandler = (file) => {
    setFeaturedImage({ url: `${API_URL}/${file.path}`, id: file.id });
    closeModal();
    setBlock(true);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "mb-5", children: error && /* @__PURE__ */ jsx(Alert, { variant: "error", title: "Error", message: error }) }),
    /* @__PURE__ */ jsx("div", { className: "mb-5", children: success && /* @__PURE__ */ jsx(Alert, { variant: "success", title: "Success", message: success }) }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-6 space-x-6 grid grid-cols-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "cTagTitle", children: "Tag Title" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "text",
              id: "cTagTitle",
              onChange: handleTagTitle,
              value: tagTitle,
              placeholder: "Dog Friendly"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "cTagTitle", children: "Slug" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "text",
              id: "cTagTitle",
              onChange: (e) => setSlug(e.target.value),
              value: slug,
              placeholder: "dog-friendly"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "w-50 h-50", children: /* @__PURE__ */ jsx(InputWrapper, { label: "Icon", children: /* @__PURE__ */ jsx(
        AdminFeaturedImage,
        {
          url: (featuredImage == null ? void 0 : featuredImage.url) ? `${featuredImage == null ? void 0 : featuredImage.url}` : "#",
          onClick: openModal,
          onSave: featuredImageHandler
        }
      ) }) }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(
        Button,
        {
          startIcon: /* @__PURE__ */ jsx(SvgDownload, { className: "size-5" }),
          className: "w-1/4",
          children: "Save"
        }
      ) })
    ] })
  ] });
}
function TableTags({
  onEditTags,
  refreshKey,
  onRefresh
}) {
  const [dataTags, setDataTags] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    const fetchIDParent = async () => {
      try {
        const response = await getAllTags();
        setDataTags(response.data ?? []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchIDParent();
  }, [refreshKey]);
  const filteredAndSortedData = useMemo(() => {
    return dataTags.filter(
      (item) => [item.name, item.slug].some(
        (value) => value == null ? void 0 : value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [dataTags, searchTerm]);
  const handleEditButtonClick = async (id) => {
    try {
      const vaData = await getTagByID(id);
      onEditTags(vaData);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  const handleDeleteButtonClick = async (id) => {
    try {
      await deleteTag(id);
      onRefresh();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  const showSwal = (tagTitle, id) => {
    withReactContent(Swal).fire({
      title: `Are you sure to Delete ${tagTitle}?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteButtonClick(id);
        withReactContent(Swal).fire({
          title: "Deleted!",
          text: "Tag has been deleted.",
          icon: "success"
        });
      }
    });
  };
  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]", children: [
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
        /* @__PURE__ */ jsx("span", { className: "text-gray-500 dark:text-gray-400", children: " entries " })
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
            children: "#"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "px-5 py-3 font-medium text-gray-500 text-start text-theme-sm dark:text-gray-400 max-w-[10px]",
            children: "Name"
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
      /* @__PURE__ */ jsx(TableBody, { className: "divide-y divide-gray-100 dark:divide-white/[0.05]", children: currentData.map((cat, index) => /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-xl dark:text-gray-400", children: startIndex + index + 1 }),
        /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-xl dark:text-gray-400", children: cat.name }),
        /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-xl dark:text-gray-400", children: /* @__PURE__ */ jsx(Badge, { variant: "light", color: "info", children: cat.slug }) }),
        /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-xl dark:text-gray-400", children: /* @__PURE__ */ jsx(
          Button,
          {
            onClick: () => handleEditButtonClick(cat.id),
            size: "sm",
            className: "bg-green-600 hover:bg-green-700",
            children: "Edit"
          }
        ) }),
        /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-xl dark:text-gray-400", children: /* @__PURE__ */ jsx(
          Button,
          {
            onClick: () => showSwal(cat.name, cat.id),
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
  ] }) });
}
function MstTags() {
  const [selectedTab, setSelectedTab] = useState("datas");
  const [selectedTags, setSelectedTags] = useState();
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };
  const handleOnEditTags = (tag) => {
    setSelectedTags(tag);
    setSelectedTab("form");
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      PageMeta,
      {
        title: "essentialbali Admin Dashboard | Master Tags",
        description: "This is Master Tags Dashboard page for essentialbali Admin Dashboard Template"
      }
    ),
    /* @__PURE__ */ jsx(PageBreadcrumb, { pageTitle: "Tags" }),
    /* @__PURE__ */ jsx(ComponentCard, { title: "", className: "mt-12", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6 xl:grid-cols-1", children: /* @__PURE__ */ jsxs("div", { className: "space-y-12", children: [
      /* @__PURE__ */ jsxs("nav", { className: "flex space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setSelectedTab("datas"),
            className: `inline-flex items-center gap-2 border-b-2 px-2.5 py-2 text-sm font-medium transition-colors duration-200 ${selectedTab === "datas" ? "text-brand-500 border-brand-500 dark:text-brand-400 dark:border-brand-400" : "text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`,
            children: [
              /* @__PURE__ */ jsx(SvgList, { className: "size-5" }),
              "Data Tags"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setSelectedTab("form"),
            className: `inline-flex items-center gap-2 border-b-2 px-2.5 py-2 text-sm font-medium transition-colors duration-200 ${selectedTab === "form" ? "text-brand-500 border-brand-500 dark:text-brand-400 dark:border-brand-400" : "text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`,
            children: [
              /* @__PURE__ */ jsx(SvgPencil, { className: "size-5" }),
              "Form"
            ]
          }
        )
      ] }),
      selectedTab === "datas" && /* @__PURE__ */ jsx(
        TableTags,
        {
          onEditTags: handleOnEditTags,
          refreshKey,
          onRefresh: handleRefresh
        }
      ),
      selectedTab === "form" && /* @__PURE__ */ jsx(FormTags, { selectedTags, onRefresh: handleRefresh })
    ] }) }) })
  ] });
}
export {
  MstTags as default
};
