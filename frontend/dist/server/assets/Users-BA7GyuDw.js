import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { C as ComponentCard } from "./ComponentCard-Bt28DbRh.js";
import { P as PageBreadcrumb } from "./PageBreadCrumb-CVUrKnRj.js";
import { P as PageMeta } from "./PageMeta-CUwyhzue.js";
import { B as Button } from "./Button-Cvygc_ZJ.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableCell, d as TableBody } from "./index-Csm6Oz-R.js";
import { S as SvgPencil } from "./pencil-hqMKlMyc.js";
import { z as getAllUser, g as getDataDetailUser, B as updateUserStatus } from "./TimeContext-B5j8j_GZ.js";
import { B as Badge } from "./Badge-Djb8EXb-.js";
import { S as Switch } from "./Switch-dGTxNxM2.js";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { P as PaginationWithButton } from "./PaginationWithButton-Bd_Dw6AX.js";
import "react-router";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
function Users() {
  const [dataUsers, setDataUsers] = useState([]);
  const [whoAmI, setWhoAmI] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const initials = (s) => s.trim().split(/\s+/).map((w) => {
    var _a;
    return ((_a = w[0]) == null ? void 0 : _a.toUpperCase()) || "";
  }).join("");
  const formatUserLevel = (level) => {
    if (level === "admin_country") return "admin bali area";
    if (level === "admin_city") return "admin sub area";
    return level.replace("_", " ");
  };
  useEffect(() => {
    const fetchAllUser = async () => {
      try {
        const vaData = await getAllUser();
        const vaDataUser = vaData.data;
        setDataUsers(vaDataUser);
      } catch (error) {
        console.error("Failed to fetch all user:", error);
      } finally {
      }
    };
    fetchAllUser();
  }, []);
  useEffect(() => {
    const getWhoAmI = async () => {
      try {
        const vaData = await getDataDetailUser();
        if (vaData) {
          setWhoAmI(vaData.data[0].email ?? "");
        } else {
          setWhoAmI("");
        }
      } catch (error) {
        console.error("Failed to fetch all user:", error);
      } finally {
      }
    };
    getWhoAmI();
  }, []);
  const filteredAndSortedData = useMemo(() => {
    return dataUsers.filter(
      (item) => [item.name, item.email].some(
        (value) => value == null ? void 0 : value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [dataUsers, searchTerm]);
  const handleAddUserButton = () => {
    window.location.href = "/admin/registration";
  };
  const handleSwitchChange = async (id, checked) => {
    try {
      await updateUserStatus(id, { status: checked });
      setDataUsers(
        (prev) => prev.map(
          (user) => user.id === id ? { ...user, isActive: checked } : user
        )
      );
      withReactContent(Swal).fire({
        title: `User ${checked ? "Activated" : "Deactivated"}`,
        icon: `${checked ? "success" : "info"}`
      });
    } catch (error) {
      withReactContent(Swal).fire({
        title: `Error`,
        text: "Failed to update user status",
        icon: "error"
      }).then(() => {
        location.reload();
      });
      console.error("Error updating user status:", error);
    }
  };
  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(
      PageMeta,
      {
        title: "essentialbali Admin Dashboard | User List",
        description: "This is User List Page for essentialbali Admin Dashboard Template"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-6 xl:grid-cols-1", children: /* @__PURE__ */ jsxs("div", { className: "space-y-12", children: [
      /* @__PURE__ */ jsx(PageBreadcrumb, { pageTitle: "User List" }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-start", children: /* @__PURE__ */ jsx(
        Button,
        {
          size: "sm",
          variant: "primary",
          startIcon: /* @__PURE__ */ jsx(SvgPencil, { className: "size-5" }),
          onClick: handleAddUserButton,
          children: "Add User"
        }
      ) }),
      /* @__PURE__ */ jsx(ComponentCard, { title: "Data", children: /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 px-4 py-4 border border-b-1 border-gray-100 dark:border-white/[0.05] rounded-t-xl sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxs("span", { className: "text-gray-500 dark:text-gray-400", children: [
              " ",
              "Show ´"
            ] }),
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
          /* @__PURE__ */ jsx(TableHeader, { className: "border-b border-gray-100 dark:border-white/[0.05]", children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(
              TableCell,
              {
                isHeader: true,
                className: "px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400",
                children: "Name"
              }
            ),
            /* @__PURE__ */ jsx(
              TableCell,
              {
                isHeader: true,
                className: "px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400",
                children: "Email"
              }
            ),
            /* @__PURE__ */ jsx(
              TableCell,
              {
                isHeader: true,
                className: "px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400",
                children: "Bali Area"
              }
            ),
            /* @__PURE__ */ jsx(
              TableCell,
              {
                isHeader: true,
                className: "px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400",
                children: "Status"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { className: "divide-y divide-gray-100 dark:divide-white/[0.05]", children: currentData.map((user) => /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { className: "px-5 py-4 sm:px-6 text-start", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsx("div", { className: "w-10 h-10 overflow-hidden rounded-full bg-blue-200 text-blue-600 flex items-center justify-center", children: /* @__PURE__ */ jsx("h4", { children: initials(user.name.split(" ")[0]) }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("span", { className: "block font-medium text-gray-800 text-theme-sm dark:text-white/90", children: [
                  user.name,
                  " ",
                  whoAmI === user.email && /* @__PURE__ */ jsx("span", { className: "ml-1", children: /* @__PURE__ */ jsx(Badge, { size: "sm", color: "info", children: "You" }) })
                ] }),
                /* @__PURE__ */ jsx("span", { className: "block text-gray-500 text-theme-xs dark:text-gray-400", children: formatUserLevel(user.user_level) })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400", children: user.email }),
            /* @__PURE__ */ jsxs(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400", children: [
              /* @__PURE__ */ jsx("span", { className: "block text-gray-950 text-theme-sm dark:text-gray-400", children: user.name_city }),
              /* @__PURE__ */ jsx("span", { className: "block text-gray-500 text-theme-xs dark:text-gray-400", children: user.name_country })
            ] }),
            /* @__PURE__ */ jsx(TableCell, { className: "px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400", children: /* @__PURE__ */ jsx(
              Switch,
              {
                label: user.isActive ? "Active" : "Suspended",
                defaultChecked: user.isActive,
                disabled: whoAmI === user.email,
                onChange: (checked) => handleSwitchChange(user.id, checked)
              }
            ) })
          ] }, user.id)) })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "border border-t-1 rounded-b-xl border-gray-100 py-4 pl-[18px] pr-4 dark:border-white/[0.05]", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col xl:flex-row xl:items-center xl:justify-between", children: [
          /* @__PURE__ */ jsx(
            PaginationWithButton,
            {
              totalPages,
              initialPage: currentPage,
              onPageChange: handlePageChange
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "pt-3 xl:pt-0", children: /* @__PURE__ */ jsxs("p", { className: "pt-3 text-sm font-medium text-center text-gray-500 border-t border-gray-100 dark:border-gray-800 dark:text-gray-400 xl:border-t-0 xl:pt-0 xl:text-left", children: [
            "Showing ",
            startIndex + 1,
            " to ",
            endIndex,
            " of ",
            totalItems,
            " ",
            "entries"
          ] }) })
        ] }) })
      ] }) })
    ] }) })
  ] }) });
}
export {
  Users as default
};
