import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { u as useSidebar, S as SidebarProvider } from "./SidebarContext-CGWfWy5i.js";
import { Link, useLocation, Outlet } from "react-router";
import * as React from "react";
import { useRef, useEffect, useState, useCallback } from "react";
import { B as Button } from "./Button-Cvygc_ZJ.js";
import { f as logout, g as getDataDetailUser, h as getUserProfilePicture, e as useAuth, N as NotificationProvider, P as ProtectedRoute } from "./TimeContext-B5j8j_GZ.js";
import { LayoutGrid, ImagePlus, Rss, BriefcaseBusiness, UserCog, Cog, ChevronDown } from "lucide-react";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
const SvgTable = (props) => /* @__PURE__ */ React.createElement("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M3.25 5.5C3.25 4.25736 4.25736 3.25 5.5 3.25H18.5C19.7426 3.25 20.75 4.25736 20.75 5.5V18.5C20.75 19.7426 19.7426 20.75 18.5 20.75H5.5C4.25736 20.75 3.25 19.7426 3.25 18.5V5.5ZM5.5 4.75C5.08579 4.75 4.75 5.08579 4.75 5.5V8.58325L19.25 8.58325V5.5C19.25 5.08579 18.9142 4.75 18.5 4.75H5.5ZM19.25 10.0833H15.416V13.9165H19.25V10.0833ZM13.916 10.0833L10.083 10.0833V13.9165L13.916 13.9165V10.0833ZM8.58301 10.0833H4.75V13.9165H8.58301V10.0833ZM4.75 18.5V15.4165H8.58301V19.25H5.5C5.08579 19.25 4.75 18.9142 4.75 18.5ZM10.083 19.25V15.4165L13.916 15.4165V19.25H10.083ZM15.416 19.25V15.4165H19.25V18.5C19.25 18.9142 18.9142 19.25 18.5 19.25H15.416Z", fill: "currentColor" }));
const SvgHorizontalDots = (props) => /* @__PURE__ */ React.createElement("svg", { width: "1em", height: "1em", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", ...props }, /* @__PURE__ */ React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M5.99915 10.2451C6.96564 10.2451 7.74915 11.0286 7.74915 11.9951V12.0051C7.74915 12.9716 6.96564 13.7551 5.99915 13.7551C5.03265 13.7551 4.24915 12.9716 4.24915 12.0051V11.9951C4.24915 11.0286 5.03265 10.2451 5.99915 10.2451ZM17.9991 10.2451C18.9656 10.2451 19.7491 11.0286 19.7491 11.9951V12.0051C19.7491 12.9716 18.9656 13.7551 17.9991 13.7551C17.0326 13.7551 16.2491 12.9716 16.2491 12.0051V11.9951C16.2491 11.0286 17.0326 10.2451 17.9991 10.2451ZM13.7491 11.9951C13.7491 11.0286 12.9656 10.2451 11.9991 10.2451C11.0326 10.2451 10.2491 11.0286 10.2491 11.9951V12.0051C10.2491 12.9716 11.0326 13.7551 11.9991 13.7551C12.9656 13.7551 13.7491 12.9716 13.7491 12.0051V11.9951Z", fill: "currentColor" }));
const DropdownItem = ({
  tag = "button",
  to,
  onClick,
  onItemClick,
  baseClassName = "block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900",
  className = "",
  children
}) => {
  const combinedClasses = `${baseClassName} ${className}`.trim();
  const handleClick = (event) => {
    if (tag === "button") {
      event.preventDefault();
    }
    if (onClick) onClick();
    if (onItemClick) onItemClick();
  };
  if (tag === "a" && to) {
    return /* @__PURE__ */ jsx(Link, { to, className: combinedClasses, onClick: handleClick, children });
  }
  return /* @__PURE__ */ jsx("button", { onClick: handleClick, className: combinedClasses, children });
};
const Dropdown = ({
  isOpen,
  onClose,
  children,
  className = ""
}) => {
  const dropdownRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !event.target.closest(".dropdown-toggle")) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      ref: dropdownRef,
      className: `absolute z-40  right-0 mt-2  rounded-xl border border-gray-200 bg-white  shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark ${className}`,
      children
    }
  );
};
function UserDropdown() {
  const BASE_PATH = "/essentialbali/".replace(/\/$/, "");
  const signInUrl = `${BASE_PATH}/signin`;
  const [isOpen, setIsOpen] = useState(false);
  const [myProfilePicture, setMyProfilePicture] = useState("");
  const [myName, setMyName] = useState("");
  const [myEmail, setMyEmail] = useState("");
  function toggleDropdown() {
    setIsOpen(!isOpen);
  }
  function closeDropdown() {
    setIsOpen(false);
  }
  async function handleSignOut() {
    try {
      const credentials = {
        token: localStorage.getItem("authToken") ?? ""
      };
      await logout(credentials);
      window.location.replace(signInUrl);
    } catch (err) {
      console.error("Logout failed:", err);
      throw err;
    }
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const vaData = await getDataDetailUser();
        if (vaData) {
          setMyName(vaData.data[0].name ?? "");
          setMyEmail(vaData.data[0].email ?? "");
        } else {
          setMyName("");
          setMyEmail("");
        }
      } catch (error) {
        console.warn("Error decoding token:", error);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    const loadProfilePicture = async () => {
      try {
        const url = await getUserProfilePicture();
        setMyProfilePicture(url);
      } catch (err) {
        console.error(err);
      }
    };
    loadProfilePicture();
    return () => {
      if (myProfilePicture) URL.revokeObjectURL(myProfilePicture);
    };
  }, []);
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: toggleDropdown,
        className: "flex items-center text-gray-700 dropdown-toggle dark:text-gray-400",
        children: [
          myProfilePicture ? /* @__PURE__ */ jsx("span", { className: "mr-3 overflow-hidden rounded-full h-11 w-11 bg-gray-200 align-middle", children: /* @__PURE__ */ jsx(
            "img",
            {
              src: myProfilePicture,
              alt: "Avatar",
              className: "w-full h-full object-cover hover:cursor-pointer"
            }
          ) }) : /* @__PURE__ */ jsx("div", { className: "bg-blue-500 h-11 w-11 rounded-full flex items-center justify-center text-2xl text-white mr-3", children: /* @__PURE__ */ jsx("h1", { children: myName.charAt(0).toUpperCase() }) }),
          /* @__PURE__ */ jsx("span", { className: "block mr-1 font-medium text-theme-sm", children: myName }),
          /* @__PURE__ */ jsx(
            "svg",
            {
              className: `stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`,
              width: "18",
              height: "20",
              viewBox: "0 0 18 20",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  d: "M4.3125 8.65625L9 13.3437L13.6875 8.65625",
                  stroke: "currentColor",
                  strokeWidth: "1.5",
                  strokeLinecap: "round",
                  strokeLinejoin: "round"
                }
              )
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      Dropdown,
      {
        isOpen,
        onClose: closeDropdown,
        className: "absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark",
        children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("span", { className: "block font-medium text-gray-700 text-theme-sm dark:text-gray-400", children: myName }),
            /* @__PURE__ */ jsx("span", { className: "mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400", children: myEmail })
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800", children: /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
            DropdownItem,
            {
              onItemClick: closeDropdown,
              tag: "a",
              to: "/admin/profile",
              className: "flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300",
              children: [
                /* @__PURE__ */ jsx(
                  "svg",
                  {
                    className: "fill-gray-500 group-hover:fill-gray-700 dark:fill-gray-400 dark:group-hover:fill-gray-300",
                    width: "24",
                    height: "24",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    xmlns: "http://www.w3.org/2000/svg",
                    children: /* @__PURE__ */ jsx(
                      "path",
                      {
                        fillRule: "evenodd",
                        clipRule: "evenodd",
                        d: "M12 3.5C7.30558 3.5 3.5 7.30558 3.5 12C3.5 14.1526 4.3002 16.1184 5.61936 17.616C6.17279 15.3096 8.24852 13.5955 10.7246 13.5955H13.2746C15.7509 13.5955 17.8268 15.31 18.38 17.6167C19.6996 16.119 20.5 14.153 20.5 12C20.5 7.30558 16.6944 3.5 12 3.5ZM17.0246 18.8566V18.8455C17.0246 16.7744 15.3457 15.0955 13.2746 15.0955H10.7246C8.65354 15.0955 6.97461 16.7744 6.97461 18.8455V18.856C8.38223 19.8895 10.1198 20.5 12 20.5C13.8798 20.5 15.6171 19.8898 17.0246 18.8566ZM2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM11.9991 7.25C10.8847 7.25 9.98126 8.15342 9.98126 9.26784C9.98126 10.3823 10.8847 11.2857 11.9991 11.2857C13.1135 11.2857 14.0169 10.3823 14.0169 9.26784C14.0169 8.15342 13.1135 7.25 11.9991 7.25ZM8.48126 9.26784C8.48126 7.32499 10.0563 5.75 11.9991 5.75C13.9419 5.75 15.5169 7.32499 15.5169 9.26784C15.5169 11.2107 13.9419 12.7857 11.9991 12.7857C10.0563 12.7857 8.48126 11.2107 8.48126 9.26784Z",
                        fill: ""
                      }
                    )
                  }
                ),
                "Edit profile"
              ]
            }
          ) }) }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: handleSignOut,
              className: "flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300",
              children: [
                /* @__PURE__ */ jsx(
                  "svg",
                  {
                    className: "fill-white group-hover:fill-gray-700 dark:group-hover:fill-gray-300",
                    width: "24",
                    height: "24",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    xmlns: "http://www.w3.org/2000/svg",
                    children: /* @__PURE__ */ jsx(
                      "path",
                      {
                        fillRule: "evenodd",
                        clipRule: "evenodd",
                        d: "M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z",
                        fill: ""
                      }
                    )
                  }
                ),
                "Sign out"
              ]
            }
          )
        ]
      }
    )
  ] });
}
const AppHeader = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };
  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };
  const inputRef = useRef(null);
  useEffect(() => {
    const handleKeyDown = (event) => {
      var _a;
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        (_a = inputRef.current) == null ? void 0 : _a.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return /* @__PURE__ */ jsx("header", { className: "sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-between grow lg:flex-row lg:px-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border",
          onClick: handleToggle,
          "aria-label": "Toggle Sidebar",
          children: isMobileOpen ? /* @__PURE__ */ jsx(
            "svg",
            {
              width: "24",
              height: "24",
              viewBox: "0 0 24 24",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  fillRule: "evenodd",
                  clipRule: "evenodd",
                  d: "M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z",
                  fill: "currentColor"
                }
              )
            }
          ) : /* @__PURE__ */ jsx(
            "svg",
            {
              width: "16",
              height: "12",
              viewBox: "0 0 16 12",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  fillRule: "evenodd",
                  clipRule: "evenodd",
                  d: "M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z",
                  fill: "currentColor"
                }
              )
            }
          )
        }
      ),
      /* @__PURE__ */ jsxs(Link, { to: "/", className: "lg:hidden", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            className: "dark:hidden",
            src: "/logo.png",
            alt: "essentialbali logo",
            width: 120,
            height: 50
          }
        ),
        /* @__PURE__ */ jsx(
          "img",
          {
            className: "hidden dark:block",
            src: "/logo.png",
            alt: "essentialbali logo",
            width: 120,
            height: 50
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: toggleApplicationMenu,
          className: "flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-99999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden",
          children: /* @__PURE__ */ jsx(
            "svg",
            {
              width: "24",
              height: "24",
              viewBox: "0 0 24 24",
              fill: "none",
              xmlns: "http://www.w3.org/2000/svg",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  fillRule: "evenodd",
                  clipRule: "evenodd",
                  d: "M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z",
                  fill: "currentColor"
                }
              )
            }
          )
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "hidden lg:block" })
    ] }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: `${isApplicationMenuOpen ? "flex" : "hidden"} items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`,
        children: [
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 2xsm:gap-3" }),
          /* @__PURE__ */ jsx(UserDropdown, {})
        ]
      }
    )
  ] }) });
};
const Backdrop = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();
  if (!isMobileOpen) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 z-40 bg-gray-900/50 lg:hidden",
      onClick: toggleMobileSidebar
    }
  );
};
const navItems = [
  {
    icon: /* @__PURE__ */ jsx(LayoutGrid, {}),
    name: "Master",
    subItems: [
      { name: "Bali Areas", path: "mst_locations", pro: false },
      { name: "Categories", path: "mst_categories", pro: false, allowedUserLevel: ["super_admin"] },
      { name: "Tags", path: "mst_tags", pro: false, allowedUserLevel: ["super_admin"] },
      { name: "Articles", path: "mst_article", pro: false }
    ]
  },
  {
    icon: /* @__PURE__ */ jsx(SvgTable, {}),
    name: "Templates",
    subItems: [
      { name: "Header Navigation", path: "/admin/mst_templates/general", pro: false, allowedUserLevel: ["super_admin"] },
      { name: "Area Pages", path: "/admin/mst_templates", pro: false },
      { name: "About", path: "/admin/mst_templates/about", pro: false, allowedUserLevel: ["super_admin"] }
    ]
  },
  {
    name: "Media",
    icon: /* @__PURE__ */ jsx(ImagePlus, {}),
    subItems: [
      { name: "Add Media", path: "add_media" },
      { name: "Media Library", path: "media_library" }
    ]
  },
  {
    name: "Newsletter Subscriber",
    icon: /* @__PURE__ */ jsx(Rss, {}),
    allowedUserLevel: ["super_admin"],
    subItems: [
      { name: "Subscriber List", path: "subscriber_list", allowedUserLevel: ["super_admin"] }
    ]
  },
  {
    name: "Job Applicant",
    icon: /* @__PURE__ */ jsx(BriefcaseBusiness, {}),
    path: "job_applicant"
  }
];
const othersItems = [
  {
    name: "User Management",
    icon: /* @__PURE__ */ jsx(UserCog, {}),
    subItems: [
      { name: "Users", path: "users", allowedUserLevel: ["super_admin"] },
      { name: "Add User", path: "registration", allowedUserLevel: ["super_admin"] },
      { name: "Profile", path: "profile" }
    ]
  },
  {
    name: "Setting",
    icon: /* @__PURE__ */ jsx(Cog, {}),
    allowedUserLevel: ["super_admin"],
    subItems: [
      { name: "Setting", path: "setting" },
      { name: "Social Media", path: "socmed" },
      { name: "SMTP Configuration", path: "configSMTP" }
    ]
  }
];
const AppSidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const { userDetails } = useAuth();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState(
    {}
  );
  const subMenuRefs = useRef({});
  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );
  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType,
                index
              });
              submenuMatched = true;
            }
          });
        }
      });
    });
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => {
          var _a;
          return {
            ...prevHeights,
            [key]: ((_a = subMenuRefs.current[key]) == null ? void 0 : _a.scrollHeight) || 0
          };
        });
      }
    }
  }, [openSubmenu]);
  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu && prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === index) {
        return null;
      }
      return { type: menuType, index };
    });
  };
  const renderMenuItems = (items, menuType) => /* @__PURE__ */ jsx("ul", { className: "flex flex-col gap-4", children: items.map((nav, index) => {
    var _a;
    if (!nav.allowedUserLevel || userDetails && ((_a = nav.allowedUserLevel) == null ? void 0 : _a.includes(userDetails.user_level)))
      return /* @__PURE__ */ jsxs("li", { children: [
        nav.subItems ? /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => handleSubmenuToggle(index, menuType),
            className: `menu-item group ${(openSubmenu == null ? void 0 : openSubmenu.type) === menuType && (openSubmenu == null ? void 0 : openSubmenu.index) === index ? "menu-item-active" : "menu-item-inactive"} cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`,
            children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: `menu-item-icon-size  ${(openSubmenu == null ? void 0 : openSubmenu.type) === menuType && (openSubmenu == null ? void 0 : openSubmenu.index) === index ? "menu-item-icon-active" : "menu-item-icon-inactive"}`,
                  children: nav.icon
                }
              ),
              (isExpanded || isHovered || isMobileOpen) && /* @__PURE__ */ jsx("span", { className: "menu-item-text", children: nav.name }),
              (isExpanded || isHovered || isMobileOpen) && /* @__PURE__ */ jsx(
                ChevronDown,
                {
                  className: `ml-auto w-5 h-5 transition-transform duration-200 ${(openSubmenu == null ? void 0 : openSubmenu.type) === menuType && (openSubmenu == null ? void 0 : openSubmenu.index) === index ? "rotate-180 text-brand-500" : ""}`
                }
              )
            ]
          }
        ) : nav.path && /* @__PURE__ */ jsxs(
          Link,
          {
            to: nav.path,
            className: `menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`,
            children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: `menu-item-icon-size ${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`,
                  children: nav.icon
                }
              ),
              (isExpanded || isHovered || isMobileOpen) && /* @__PURE__ */ jsx("span", { className: "menu-item-text", children: nav.name })
            ]
          }
        ),
        nav.subItems && (isExpanded || isHovered || isMobileOpen) && /* @__PURE__ */ jsx(
          "div",
          {
            ref: (el) => {
              subMenuRefs.current[`${menuType}-${index}`] = el;
            },
            className: "overflow-hidden transition-all duration-300",
            style: {
              height: (openSubmenu == null ? void 0 : openSubmenu.type) === menuType && (openSubmenu == null ? void 0 : openSubmenu.index) === index ? `${subMenuHeight[`${menuType}-${index}`]}px` : "0px"
            },
            children: /* @__PURE__ */ jsx("ul", { className: "mt-2 space-y-1 ml-9", children: nav.subItems.map((subItem) => {
              var _a2;
              if (!subItem.allowedUserLevel || userDetails && ((_a2 = subItem.allowedUserLevel) == null ? void 0 : _a2.includes(userDetails.user_level)))
                return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(
                  Link,
                  {
                    to: subItem.path,
                    className: `menu-dropdown-item ${isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`,
                    children: [
                      subItem.name,
                      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 ml-auto", children: [
                        subItem.new && /* @__PURE__ */ jsx(
                          "span",
                          {
                            className: `ml-auto ${isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"} menu-dropdown-badge`,
                            children: "new"
                          }
                        ),
                        subItem.pro && /* @__PURE__ */ jsx(
                          "span",
                          {
                            className: `ml-auto ${isActive(subItem.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"} menu-dropdown-badge`,
                            children: "pro"
                          }
                        )
                      ] })
                    ]
                  }
                ) }, subItem.name);
            }) })
          }
        )
      ] }, nav.name);
  }) });
  return /* @__PURE__ */ jsxs(
    "aside",
    {
      className: `fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`,
      onMouseEnter: () => !isExpanded && setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: `py-8 px-4 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-center"}`,
            children: /* @__PURE__ */ jsx(Link, { to: "/admin", children: isExpanded || isHovered || isMobileOpen ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(
                "img",
                {
                  className: "dark:hidden",
                  src: "/logo.png",
                  alt: "essentialbali logo",
                  width: 180,
                  height: 75
                }
              ),
              /* @__PURE__ */ jsx(
                "img",
                {
                  className: "hidden dark:block",
                  src: "/logo.png",
                  alt: "essentialbali logo",
                  width: 180,
                  height: 75
                }
              )
            ] }) : /* @__PURE__ */ jsx(
              "img",
              {
                src: "/logo.png",
                alt: "essentialbali logo",
                width: 44,
                height: 44
              }
            ) })
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar", children: /* @__PURE__ */ jsx("nav", { className: "mb-6", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(
              "h2",
              {
                className: `mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`,
                children: isExpanded || isHovered || isMobileOpen ? "Menu" : /* @__PURE__ */ jsx(SvgHorizontalDots, { className: "size-6" })
              }
            ),
            renderMenuItems(navItems, "main")
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "", children: [
            /* @__PURE__ */ jsx(
              "h2",
              {
                className: `mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`,
                children: isExpanded || isHovered || isMobileOpen ? "Others" : /* @__PURE__ */ jsx(SvgHorizontalDots, {})
              }
            ),
            renderMenuItems(othersItems, "others")
          ] })
        ] }) }) })
      ]
    }
  );
};
const LayoutContent = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen xl:flex", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(AppSidebar, {}),
      /* @__PURE__ */ jsx(Backdrop, {})
    ] }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: `flex-1 transition-all duration-300 ease-in-out ${isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"} ${isMobileOpen ? "ml-0" : ""}`,
        children: [
          /* @__PURE__ */ jsx(AppHeader, {}),
          /* @__PURE__ */ jsx("div", { className: "p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6", children: /* @__PURE__ */ jsx(Outlet, {}) })
        ]
      }
    )
  ] });
};
const AppLayout = () => {
  return /* @__PURE__ */ jsx(NotificationProvider, { children: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(SidebarProvider, { children: /* @__PURE__ */ jsx(LayoutContent, {}) }) }) });
};
export {
  AppLayout as default
};
