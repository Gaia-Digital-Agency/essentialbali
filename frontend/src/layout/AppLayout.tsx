import React from "react";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";
import "react-quill-new/dist/quill.core.css"
// import "../index.css"
import "react-quill-new/dist/quill.snow.css";
// import { registerAllCustomFormats } from "../quill/quill.setup";
import { NotificationProvider } from "../context/NotificationContext";
import ProtectedRoute from "../components/ProtectedRoute";
import '@fortawesome/fontawesome-free/css/all.min.css';
// import '../non-critical.css'
// registerAllCustomFormats()

const LayoutContent: React.FC = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  // const setNotification = ({message, type, isClosed = false} : NotificationProps) => {
  //   setNotification(prev => {
  //     return [...prev, {message, type, isClosed}]
  //   })
  // }
  return (
    <div className="min-h-screen xl:flex">
      <div>
        <AppSidebar />
        <Backdrop />
      </div>
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
      <NotificationProvider>
        <ProtectedRoute>
            <SidebarProvider>
              <LayoutContent />
            </SidebarProvider>
        </ProtectedRoute>
      </NotificationProvider>
  );
};

export default AppLayout;
