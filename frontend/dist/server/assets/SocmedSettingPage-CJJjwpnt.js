import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { C as ComponentCard } from "./ComponentCard-Bt28DbRh.js";
import { P as PageBreadcrumb } from "./PageBreadCrumb-CVUrKnRj.js";
import { P as PageMeta } from "./PageMeta-CUwyhzue.js";
import { S as SvgPencil } from "./pencil-hqMKlMyc.js";
import { S as SvgList } from "./list-DrJX9KeS.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableCell, d as TableBody } from "./index-Csm6Oz-R.js";
import { B as Badge } from "./Badge-Djb8EXb-.js";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { P as PaginationWithButton } from "./PaginationWithButton-Bd_Dw6AX.js";
import { j as apiClient } from "./TimeContext-B5j8j_GZ.js";
import { S as SvgTrash } from "./trash-Bt7_4fA6.js";
import { I as Input } from "./InputField-CcQ93cDN.js";
import { L as Label } from "./Label-BrqX8kIQ.js";
import { B as Button } from "./Button-Cvygc_ZJ.js";
import { A as Alert } from "./Alert-BmVQb4Hv.js";
import { S as SvgDownload } from "./download-DnjrKIYZ.js";
import { u as useAutoDismiss } from "./useTimedMessage-Dt1cSUu_.js";
import { A as AdminFeaturedImage } from "./FeaturedImage-756EfM0U.js";
import { u as useModal } from "./useModal-C9BZm3Uo.js";
import { u as useNavigationPrompt } from "./useNavigationPrompt-DiFBqK8C.js";
import "react-router";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
import "tailwind-merge";
import "clsx";
import "./index-CqfhKOI8.js";
import "./media.service-Bg8ZwuBl.js";
import "./MediaForm-pn_2Hilv.js";
import "react-dropzone";
import "lucide-react";
import "react-router-dom";
const getAllSocmed = async () => {
  try {
    const response = await apiClient.get("socmed");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const getSocmedByID = async (id) => {
  try {
    const response = await apiClient.get(`socmed/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const createSocmed = async (payload) => {
  try {
    const response = await apiClient.post(
      `socmed`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("BADSIBA => ", error);
    throw error;
  }
};
const editSocmed = async (id, payload) => {
  try {
    const response = await apiClient.put(
      `socmed/${id}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
const deleteSocmed = async (id) => {
  try {
    const response = await apiClient.delete(
      `socmed/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
function SocmedTable({
  onEditSocmed,
  refreshKey,
  onRefresh
}) {
  const [dataSocmed, setdataSocmed] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    const fetchIDParent = async () => {
      try {
        const response = await getAllSocmed();
        setdataSocmed((response == null ? void 0 : response.data) ?? []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchIDParent();
  }, [refreshKey]);
  const filteredAndSortedData = useMemo(() => {
    return dataSocmed.filter(
      (item) => [item.platform, item.url].some(
        (value) => value == null ? void 0 : value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [dataSocmed, searchTerm]);
  const handleEditButtonClick = async (id) => {
    try {
      const vaData = await getSocmedByID(id);
      onEditSocmed(vaData == null ? void 0 : vaData.data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  const handleDeleteButtonClick = async (id) => {
    try {
      await deleteSocmed(id);
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
          text: "Data has been deleted.",
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
            className: "px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 max-w-[10px]",
            children: "#"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 max-w-[10px]",
            children: "Platform Name"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400",
            children: "Url"
          }
        ),
        /* @__PURE__ */ jsx(
          TableCell,
          {
            isHeader: true,
            className: "px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400",
            children: "Action"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { className: "divide-y divide-gray-100 dark:divide-white/[0.05]", children: currentData.map((item, index) => /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400", children: startIndex + index + 1 }),
        /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400", children: item.platform }),
        /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400", children: /* @__PURE__ */ jsx(Badge, { variant: "light", color: "info", children: item.url }) }),
        /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm dark:text-white/90 whitespace-nowrap ", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center w-full gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => showSwal(item.platform, item.id),
              className: "text-gray-500 hover:text-error-500 dark:text-gray-400 dark:hover:text-error-500",
              children: /* @__PURE__ */ jsx(SvgTrash, { className: "size-5" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleEditButtonClick(item.id),
              className: "text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-white/90",
              children: /* @__PURE__ */ jsx(SvgPencil, { className: "size-5" })
            }
          )
        ] }) })
      ] }, item.id)) })
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
const API_URL = "http://34.124.244.233/essentialbali";
function FormSocmed({ selectedSocmed, onRefresh }) {
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [platformName, setPlatformName] = useState("");
  const [url, setUrl] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [idToEdit, setIdToEdit] = useState(0);
  const [featuredImage, setFeaturedImage] = useState();
  const { closeModal, openModal } = useModal(false);
  const { setBlock } = useNavigationPrompt();
  useEffect(() => {
    if (selectedSocmed) {
      const vaData = selectedSocmed[0];
      setPlatformName(vaData.platform ?? "");
      setUrl(vaData.url ?? "");
      setFeaturedImage({ url: `${API_URL}/${vaData.icon}`, id: vaData.id });
      setIdToEdit(vaData.id ?? 0);
      setIsEdit(true);
    }
  }, [selectedSocmed]);
  useAutoDismiss(success, setSuccess);
  useAutoDismiss(error, setError);
  const initForm = () => {
    setPlatformName("");
    setUrl("");
    setFeaturedImage({ url: "", id: void 0 });
  };
  const handleSubmit = async (e) => {
    var _a, _b;
    e.preventDefault();
    const vaData = {
      platform_name: platformName,
      icon: featuredImage == null ? void 0 : featuredImage.id,
      url
    };
    try {
      if (!isEdit) {
        await createSocmed(vaData);
        setSuccess(platformName + " is Created Successfully");
      } else {
        await editSocmed(idToEdit, vaData);
        setSuccess(platformName + " is Created Successfully");
      }
      initForm();
      onRefresh();
    } catch (err) {
      console.error("OPO IKI ??", err);
      if (err instanceof Error) {
        setError(err.message);
      }
      if (typeof err === "object" && err !== null && "response" in err) {
        const errorObj = err;
        setError(((_b = (_a = errorObj.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) ?? "Something went wrong");
      }
    }
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
          /* @__PURE__ */ jsx(Label, { htmlFor: "cPlatformName", children: "Platform Name" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "text",
              id: "cPlatformName",
              onChange: (e) => setPlatformName(e.target.value),
              value: platformName,
              placeholder: "Acme"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "cSocmedUrl", children: "Url" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              type: "url",
              id: "cSocmedUrl",
              onChange: (e) => setUrl(e.target.value),
              value: url,
              placeholder: "https://www.example.com/username"
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
function SocmedSettingPage() {
  const [selectedTab, setSelectedTab] = useState("datas");
  const [selectedSocmed, setSelectedSocmed] = useState();
  const [refreshKey, setRefreshKey] = useState(0);
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };
  const handleOnEditTags = (data) => {
    setSelectedSocmed(data);
    setSelectedTab("form");
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      PageMeta,
      {
        title: "essentialbali Admin Dashboard | Social Media Settings",
        description: "This is Social Media Setting Page for essentialbali Admin Dashboard Template"
      }
    ),
    /* @__PURE__ */ jsx(PageBreadcrumb, { pageTitle: "Social Media" }),
    /* @__PURE__ */ jsx(ComponentCard, { title: "", className: "mt-12", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6 xl:grid-cols-1", children: /* @__PURE__ */ jsxs("div", { className: "space-y-12", children: [
      /* @__PURE__ */ jsxs("nav", { className: "flex space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600", children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setSelectedTab("datas"),
            className: `inline-flex items-center gap-2 border-b-2 px-2.5 py-2 text-sm font-medium transition-colors duration-200 ${selectedTab === "datas" ? "text-brand-500 border-brand-500 dark:text-brand-400 dark:border-brand-400" : "text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"}`,
            children: [
              /* @__PURE__ */ jsx(SvgList, { className: "size-5" }),
              "Data Social Media"
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
        SocmedTable,
        {
          onEditSocmed: handleOnEditTags,
          refreshKey,
          onRefresh: handleRefresh
        }
      ),
      selectedTab === "form" && /* @__PURE__ */ jsx(FormSocmed, { selectedSocmed, onRefresh: handleRefresh })
    ] }) }) })
  ] });
}
export {
  SocmedSettingPage as default
};
