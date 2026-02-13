import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { C as ComponentCard } from "./ComponentCard-Bt28DbRh.js";
import { P as PageBreadcrumb } from "./PageBreadCrumb-CVUrKnRj.js";
import { P as PageMeta } from "./PageMeta-CUwyhzue.js";
import { g as getAllApplicant } from "./job.service-BirsFooS.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableCell, d as TableBody } from "./index-Csm6Oz-R.js";
import { P as PaginationWithButton } from "./PaginationWithButton-Bd_Dw6AX.js";
import "./Button-Cvygc_ZJ.js";
import "react-router";
import "./TimeContext-B5j8j_GZ.js";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
function JobApplicant() {
  const [dataApplicant, setDataApplicant] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1
  });
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, (pagination == null ? void 0 : pagination.total) || 0);
  const fetchDataApplicant = async (page = 1, limit = 5) => {
    try {
      const response = await getAllApplicant(page, limit);
      const vaDataDetail = response == null ? void 0 : response.data;
      const vaDataApplicant = vaDataDetail == null ? void 0 : vaDataDetail.applicant;
      const vaDataPagination = vaDataDetail == null ? void 0 : vaDataDetail.pagination;
      setDataApplicant(vaDataApplicant ?? []);
      setPagination(vaDataPagination ?? {});
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  useEffect(() => {
    fetchDataApplicant();
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
    fetchDataApplicant(1, newRowsPerPage);
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      PageMeta,
      {
        title: "essentialbali Admin Dashboard | Job Applicant",
        description: "This is Bali Areas Dashboard page for essentialbali Admin Dashboard Template"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6 xl:grid-cols-1", children: /* @__PURE__ */ jsxs("div", { className: "space-y-12", children: [
      /* @__PURE__ */ jsx(PageBreadcrumb, { pageTitle: "Job Applicant" }),
      /* @__PURE__ */ jsx(ComponentCard, { title: "Job Applicant", children: /* @__PURE__ */ jsxs("div", { className: "overflow-hidden  rounded-xl  bg-white  dark:bg-white/[0.03]", children: [
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
          /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center" })
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
                children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between cursor-pointer", children: /* @__PURE__ */ jsx("p", { className: "font-medium text-gray-500 text-theme-xs dark:text-gray-400", children: "Phone Number" }) })
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: dataApplicant == null ? void 0 : dataApplicant.map((item, index) => /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-4 border border-gray-100 dark:border-white/[0.05] dark:text-white/90 whitespace-nowrap", children: /* @__PURE__ */ jsx("div", { className: "flex gap-3", children: /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("p", { className: "block font-medium text-gray-800 text-theme-sm dark:text-white/90", children: startIndex + index + 1 }) }) }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-4 border border-gray-100 dark:border-white/[0.05] dark:text-white/90 whitespace-nowrap", children: /* @__PURE__ */ jsx("div", { className: "flex gap-3", children: /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("p", { className: "block font-medium text-gray-800 text-theme-sm dark:text-white/90", children: item.applicant_email }) }) }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-4 font-normal text-gray-800 border border-gray-100 dark:border-white/[0.05] text-theme-sm dark:text-gray-400 whitespace-nowrap", children: /* @__PURE__ */ jsxs("span", { children: [
              " ",
              item.phone
            ] }) })
          ] }, item.id)) })
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
  JobApplicant as default
};
