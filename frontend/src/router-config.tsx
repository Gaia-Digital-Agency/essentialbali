/**
 * Live route table — public-site only.
 *
 * The legacy admin routes (/admin/* + /signin + /signup) and their
 * pages (Master/, AuthPages/, Dashboard/, Forms/, Charts/, etc.) were
 * removed in cleanup-D — /admin is now served by Payload at :4008.
 *
 * Imported by main.tsx (browser hydration) and entry-server.tsx (SSR).
 */
import { RouteObject } from "react-router";
import FrontLayout from "./layout/FrontLayout";
import PathResolver from "./pages/Front/PathResolver";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <FrontLayout />,
    children: [
      { index: true, element: <PathResolver /> },
      { path: "*", element: <PathResolver /> },
    ],
  },
];
