/**
 * FrontApp — browser router for the public site.
 *
 * The legacy admin routes import (`./AdminApp`) was removed in cleanup-D
 * along with the admin pages themselves. The live route table now lives
 * entirely in router-config.tsx and is consumed by main.tsx + entry-server.tsx.
 *
 * This wrapper is kept for callers that import { default as FrontApp }.
 */
import { createBrowserRouter, RouterProvider } from "react-router";
import { routes } from "../router-config";

export { routes };

const FrontApp = () => {
  const router = createBrowserRouter(routes, {
    basename: import.meta.env.VITE_BASE_PATH || "/",
  });
  return <RouterProvider router={router} />;
};

export default FrontApp;
