import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { P as PageBreadcrumb } from "./PageBreadCrumb-CVUrKnRj.js";
import { P as PageMeta } from "./PageMeta-CUwyhzue.js";
import { B as Badge } from "./Badge-Djb8EXb-.js";
import { B as Button } from "./Button-Cvygc_ZJ.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableCell, d as TableBody } from "./index-Csm6Oz-R.js";
import { C as ComponentCard } from "./ComponentCard-Bt28DbRh.js";
import { j as apiClient } from "./TimeContext-B5j8j_GZ.js";
import { P as PaginationWithButton } from "./PaginationWithButton-Bd_Dw6AX.js";
import "react-router";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
const getAllSubscriber = async (page, limit) => {
  try {
    if (!page) page = 1;
    if (!limit) limit = 5;
    const response = await apiClient.get("/newsletter/admin/subscriber?page=" + page + "&limit=" + limit);
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};
const BE_HOST_URL = "http://34.124.244.233/essentialbali";
function Subscribers() {
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataSubscriber, setDataSubscriber] = useState();
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1
  });
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, (pagination == null ? void 0 : pagination.total) || 0);
  const fetchSubscribers = async (page = 1, limit = 5) => {
    try {
      const vaData = await getAllSubscriber(page, limit);
      const vaDataDetail = vaData.data;
      const vaDataSubscriber = vaDataDetail == null ? void 0 : vaDataDetail.subscribers;
      const vaDataPagination = vaDataDetail == null ? void 0 : vaDataDetail.pagination;
      setDataSubscriber(vaDataSubscriber ?? []);
      setPagination(vaDataPagination ?? {});
    } catch (error) {
      console.error("Error fetching subscribers:", error);
    } finally {
    }
  };
  useEffect(() => {
    fetchSubscribers(currentPage, rowsPerPage);
  }, [currentPage, rowsPerPage]);
  const handlePageChange = (newPage) => {
    if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };
  const handleRowsPerPageChange = (e) => {
    const newRowsPerPage = parseInt(e.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    fetchSubscribers(1, newRowsPerPage);
  };
  const handleDonwload = async () => {
    const response = await fetch(
      `${BE_HOST_URL}/api/newsletter/admin/export`,
      {
        method: "GET",
        headers: {
          "Content-Type": "text/csv"
        }
      }
    );
    if (!response.ok) {
      throw new Error("Failed to download file");
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      PageMeta,
      {
        title: "essentialbali Admin Dashboard | Newsletter Subscribers",
        description: "This is Bali Areas Dashboard page for essentialbali Admin Dashboard Template"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6 xl:grid-cols-1", children: /* @__PURE__ */ jsxs("div", { className: "space-y-12", children: [
      /* @__PURE__ */ jsx(PageBreadcrumb, { pageTitle: "Newsletter Subscribers" }),
      /* @__PURE__ */ jsx(ComponentCard, { title: "Subscribers", children: /* @__PURE__ */ jsxs("div", { className: "overflow-hidden  rounded-xl  bg-white  dark:bg-white/[0.03]", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 px-4 py-4 border border-b-0 border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-gray-500 dark:text-gray-400", children: [
              " ",
              "Show",
              " "
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative z-20 bg-transparent", children: [
              /* @__PURE__ */ jsxs(
                "select",
                {
                  className: "w-full py-2 pl-3 pr-8 text-sm text-gray-800 bg-transparent border border-gray-300 rounded-lg appearance-none dark:bg-dark-900 h-9 bg-none shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800",
                  value: rowsPerPage,
                  onChange: handleRowsPerPageChange,
                  children: [
                    /* @__PURE__ */ jsx(
                      "option",
                      {
                        value: "10",
                        className: "text-gray-500 dark:bg-gray-900 dark:text-gray-400",
                        children: "10"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "option",
                      {
                        value: "8",
                        className: "text-gray-500 dark:bg-gray-900 dark:text-gray-400",
                        children: "8"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "option",
                      {
                        value: "5",
                        className: "text-gray-500 dark:bg-gray-900 dark:text-gray-400",
                        children: "5"
                      }
                    )
                  ]
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
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center", children: [
            /* @__PURE__ */ jsx("div", { className: "relative" }),
            /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: handleDonwload, children: [
              "Download",
              /* @__PURE__ */ jsx(
                "svg",
                {
                  className: "fill-current",
                  width: "20",
                  height: "20",
                  viewBox: "0 0 20 20",
                  fill: "none",
                  xmlns: "http://www.w3.org/2000/svg",
                  children: /* @__PURE__ */ jsx(
                    "path",
                    {
                      fillRule: "evenodd",
                      clipRule: "evenodd",
                      d: "M10.0018 14.083C9.7866 14.083 9.59255 13.9924 9.45578 13.8472L5.61586 10.0097C5.32288 9.71688 5.32272 9.242 5.61552 8.94902C5.90832 8.65603 6.3832 8.65588 6.67618 8.94868L9.25182 11.5227L9.25182 3.33301C9.25182 2.91879 9.5876 2.58301 10.0018 2.58301C10.416 2.58301 10.7518 2.91879 10.7518 3.33301L10.7518 11.5193L13.3242 8.94866C13.6172 8.65587 14.0921 8.65604 14.3849 8.94903C14.6777 9.24203 14.6775 9.7169 14.3845 10.0097L10.5761 13.8154C10.4385 13.979 10.2323 14.083 10.0018 14.083ZM4.0835 13.333C4.0835 12.9188 3.74771 12.583 3.3335 12.583C2.91928 12.583 2.5835 12.9188 2.5835 13.333V15.1663C2.5835 16.409 3.59086 17.4163 4.8335 17.4163H15.1676C16.4102 17.4163 17.4176 16.409 17.4176 15.1663V13.333C17.4176 12.9188 17.0818 12.583 16.6676 12.583C16.2533 12.583 15.9176 12.9188 15.9176 13.333V15.1663C15.9176 15.5806 15.5818 15.9163 15.1676 15.9163H4.8335C4.41928 15.9163 4.0835 15.5806 4.0835 15.1663V13.333Z",
                      fill: "currentColor"
                    }
                  )
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "max-w-full overflow-x-auto custom-scrollbar", children: /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(
              TableCell,
              {
                isHeader: true,
                className: "px-4 py-3 border border-gray-100 dark:border-white/[0.05]",
                children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between cursor-pointer", children: /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-500 text-theme-xs dark:text-gray-400", children: "#" }) })
              }
            ),
            /* @__PURE__ */ jsx(
              TableCell,
              {
                isHeader: true,
                className: "px-4 py-3 border border-gray-100 dark:border-white/[0.05]",
                children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between cursor-pointer", children: /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-500 text-theme-xs dark:text-gray-400", children: "e-Mail" }) })
              }
            ),
            /* @__PURE__ */ jsx(
              TableCell,
              {
                isHeader: true,
                className: "px-4 py-3 border border-gray-100 dark:border-white/[0.05]",
                children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between cursor-pointer", children: /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-500 text-theme-xs dark:text-gray-400", children: "User Agent" }) })
              }
            ),
            /* @__PURE__ */ jsx(
              TableCell,
              {
                isHeader: true,
                className: "px-4 py-3 border border-gray-100 dark:border-white/[0.05]",
                children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between cursor-pointer", children: /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-500 text-theme-xs dark:text-gray-400", children: "Source" }) })
              }
            ),
            /* @__PURE__ */ jsx(
              TableCell,
              {
                isHeader: true,
                className: "px-4 py-3 border border-gray-100 dark:border-white/[0.05]",
                children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between cursor-pointer", children: /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-500 text-theme-xs dark:text-gray-400", children: "Status" }) })
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: dataSubscriber == null ? void 0 : dataSubscriber.map((item, index) => {
            var _a, _b;
            return /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-4 border border-gray-100 dark:border-white/[0.05] dark:text-white/90 whitespace-nowrap", children: /* @__PURE__ */ jsx("div", { className: "flex gap-3", children: /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("p", { className: "block font-medium text-gray-800 text-theme-sm dark:text-white/90", children: startIndex + index + 1 }) }) }) }),
              /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-4 border border-gray-100 dark:border-white/[0.05] dark:text-white/90 whitespace-nowrap", children: /* @__PURE__ */ jsx("div", { className: "flex gap-3", children: /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("p", { className: "block font-medium text-gray-800 text-theme-sm dark:text-white/90", children: item.email }) }) }) }),
              /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm dark:text-gray-400 whitespace-nowrap", children: /* @__PURE__ */ jsxs("span", { children: [
                " ",
                item.user_agent
              ] }) }),
              /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm dark:text-white/90 whitespace-nowrap", children: item.source }),
              /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm dark:text-white/90 whitespace-nowrap", children: /* @__PURE__ */ jsx(
                Badge,
                {
                  size: "sm",
                  color: ((_a = item.status_subscription) == null ? void 0 : _a.status) === 1 ? "success" : "warning",
                  children: ((_b = item.status_subscription) == null ? void 0 : _b.description) ?? "Unknown"
                }
              ) })
            ] }, item.id);
          }) })
        ] }) }) }),
        /* @__PURE__ */ jsx("div", { className: "border border-t-0 rounded-b-xl border-gray-100 py-4 pl-[18px] pr-4 dark:border-white/[0.05]", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col xl:flex-row xl:items-center xl:justify-between", children: [
          /* @__PURE__ */ jsx("div", { className: "pb-3 xl:pb-0", children: /* @__PURE__ */ jsxs("p", { className: "pb-3 text-sm font-medium text-center text-gray-500 border-b border-gray-100 dark:border-gray-800 dark:text-gray-400 xl:border-b-0 xl:pb-0 xl:text-left", children: [
            "Showing ",
            startIndex + 1,
            " to ",
            endIndex,
            " of",
            " ",
            pagination.total,
            " entries"
          ] }) }),
          /* @__PURE__ */ jsx(
            PaginationWithButton,
            {
              initialPage: currentPage,
              totalPages: pagination.totalPages,
              onPageChange: handlePageChange
            }
          )
        ] }) })
      ] }) })
    ] }) })
  ] });
}
export {
  Subscribers as default
};
