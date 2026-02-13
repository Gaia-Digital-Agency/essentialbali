import { j as apiClient } from "./TimeContext-B5j8j_GZ.js";
import { jsx, jsxs } from "react/jsx-runtime";
import { M as Modal } from "./index-CqfhKOI8.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableCell, d as TableBody } from "./index-Csm6Oz-R.js";
const getTimezones = async () => {
  try {
    const response = await apiClient.get("/timezone");
    return response.data;
  } catch (error) {
    console.error("Error fetching timezones:", error);
    throw error;
  }
};
function ModalTimezoneTable({
  isOpen,
  onCLose,
  timezonesData
}) {
  return /* @__PURE__ */ jsx(
    Modal,
    {
      isOpen,
      onClose: onCLose,
      showCloseButton: true,
      className: "max-w-[800px] m-4",
      children: /* @__PURE__ */ jsxs("div", { className: "relative w-full overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11", children: [
        /* @__PURE__ */ jsxs("div", { className: "px-2 pr-14", children: [
          /* @__PURE__ */ jsx("h4", { className: "mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90", children: "Timezone List" }),
          /* @__PURE__ */ jsx("p", { className: "mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7", children: "List of IANA Timezone Reference" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3", children: /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { className: "border-gray-100 border-y dark:border-white/[0.05] bg-blue-200", children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(
              TableCell,
              {
                isHeader: true,
                className: "px-4 py-3 font-medium text-blue-800 sm:px-6 text-start text-theme-sm dark:text-gray-400",
                children: "No"
              }
            ),
            /* @__PURE__ */ jsx(
              TableCell,
              {
                isHeader: true,
                className: "px-4 py-3 font-medium text-blue-800 sm:px-6 text-start text-theme-sm dark:text-gray-400",
                children: "Timezone Name"
              }
            ),
            /* @__PURE__ */ jsx(
              TableCell,
              {
                isHeader: true,
                className: "px-4 py-3 font-medium text-blue-800 sm:px-6 text-center text-theme-sm dark:text-gray-400 w-1/4",
                children: "UTC Offset"
              }
            ),
            /* @__PURE__ */ jsx(
              TableCell,
              {
                isHeader: true,
                className: "px-4 py-3 font-medium text-blue-800 sm:px-6 text-start text-theme-sm dark:text-gray-400",
                children: "Description"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: timezonesData.map((item, index) => /* @__PURE__ */ jsxs(TableRow, { className: "border-b-1 border-gray-200", children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-sm text-gray-500 sm:px-6 dark:text-gray-400", children: index + 1 }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-sm text-gray-500 sm:px-6 dark:text-gray-400", children: item.timezone_name }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-sm text-gray-500 sm:px-6 dark:text-gray-400 text-center ", children: item.utc_offset }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-sm text-gray-500 sm:px-6 dark:text-gray-400", children: item.description })
          ] }, index)) })
        ] }) })
      ] })
    }
  );
}
export {
  ModalTimezoneTable as M,
  getTimezones as g
};
