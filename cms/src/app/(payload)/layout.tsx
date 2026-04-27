import "@payloadcms/next/css";
import { RootLayout } from "@payloadcms/next/layouts";
import config from "@payload-config";
import { importMap } from "./admin/importMap.js";

import type { ServerFunctionClient } from "payload";
import React from "react";

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  const { handleServerFunctions } = await import("@payloadcms/next/layouts");
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
);

export default Layout;
