import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
function PaginationWithButton({
  totalPages,
  initialPage = 1,
  onPageChange
}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    onPageChange == null ? void 0 : onPageChange(page);
  };
  const renderPageNumbers = () => {
    const pagesToShow = 5;
    const startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(/* @__PURE__ */ jsx("li", { children: renderPageButton(i) }, i));
    }
    if (startPage > 1) {
      pages.unshift(/* @__PURE__ */ jsx("li", { children: renderEllipsis() }, "ellipsis-start"));
    }
    if (endPage < totalPages) {
      pages.push(/* @__PURE__ */ jsx("li", { children: renderEllipsis() }, "ellipsis-end"));
    }
    return pages;
  };
  const renderPageButton = (page) => {
    return /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => handlePageChange(page),
        className: `px-4 py-2 rounded ${currentPage === page ? "bg-brand-500 text-white" : "text-gray-700 dark:text-gray-400"} flex w-10 items-center justify-center h-10 rounded-lg text-sm font-medium hover:bg-blue-500/[0.08] hover:text-brand-500 dark:hover:text-brand-500`,
        children: page
      }
    );
  };
  const renderEllipsis = () => {
    return /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center w-10 h-10 text-sm font-medium text-gray-700 dark:text-gray-400", children: "..." });
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4 xl:justify-start", children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => handlePageChange(currentPage - 1),
        disabled: currentPage === 1,
        className: "flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 sm:p-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed",
        children: "Previous"
      }
    ),
    /* @__PURE__ */ jsx("ul", { className: "flex items-center gap-1", children: renderPageNumbers() }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => handlePageChange(currentPage + 1),
        disabled: currentPage === totalPages,
        className: "flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 sm:p-2.5 text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed",
        children: "Next"
      }
    )
  ] });
}
export {
  PaginationWithButton as P
};
