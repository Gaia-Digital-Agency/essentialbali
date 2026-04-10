import React from "react";
import GridShape from "../../components/common/GridShape";
import AdminLogo from "../../components/common/AdminLogo";
// import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-front-icewhite dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
              <AdminLogo className="block mb-4" width={220} height={92} to="/" />
              <p className="text-center text-front-charcoal-grey dark:text-white/60">
                Essential Bali Content Management Dashboard
              </p>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          {/* <ThemeTogglerTwo /> */}
        </div>
      </div>
    </div>
  );
}
