import { jsx } from "react/jsx-runtime";
import { useState, useEffect, useContext, createContext } from "react";
const SidebarContext = createContext(void 0);
const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};
const SidebarProvider = ({
  children
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
  };
  const closeSidebar = () => {
    setIsExpanded(false);
  };
  const toggleMobileSidebar = () => {
    setIsMobileOpen((prev) => !prev);
  };
  const toggleSubmenu = (item) => {
    setOpenSubmenu((prev) => prev === item ? null : item);
  };
  return /* @__PURE__ */ jsx(
    SidebarContext.Provider,
    {
      value: {
        isExpanded: isMobile ? false : isExpanded,
        isMobileOpen,
        isHovered,
        activeItem,
        openSubmenu,
        toggleSidebar,
        toggleMobileSidebar,
        setIsHovered,
        setActiveItem,
        toggleSubmenu,
        closeSidebar
      },
      children
    }
  );
};
export {
  SidebarProvider as S,
  useSidebar as u
};
