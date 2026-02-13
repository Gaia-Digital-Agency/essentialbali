import { jsx, Fragment } from "react/jsx-runtime";
import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router";
import { a as adminRoutes, T as TimeProvider, b as TaxonomyProvider, R as RouteProvider, C as ContentProvider, H as HeaderContentProvider, A as AuthProvider, p as pkg } from "./assets/TimeContext-B5j8j_GZ.js";
import { lazy, Suspense } from "react";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
const FrontLayout = lazy(() => import("./assets/FrontLayout-D18QzDZE.js"));
const SignIn = lazy(() => import("./assets/SignIn-DHDfF031.js"));
const PathResolver = lazy(() => import("./assets/PathResolver-FrvaS4We.js"));
const frontRoutes = [
  { path: "/signin", element: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(Fragment, {}), children: /* @__PURE__ */ jsx(SignIn, {}) }) },
  // { path: "/signup", element: <Suspense fallback={<></>}><SignUp /></Suspense> },
  {
    path: "/",
    element: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(Fragment, {}), children: /* @__PURE__ */ jsx(FrontLayout, {}) }),
    children: [
      { index: true, element: /* @__PURE__ */ jsx(PathResolver, {}) },
      { path: "*", element: /* @__PURE__ */ jsx(PathResolver, {}) }
    ]
  }
];
const routes = [
  ...adminRoutes,
  ...frontRoutes.filter((route) => route.path !== "/signin")
];
const { HelmetProvider } = pkg;
function render(url, initialData) {
  const basename = process.env.VITE_BASE_PATH || "/";
  const fullUrl = basename.replace(/\/$/, "") + (url.startsWith("/") ? url : "/" + url);
  const memoryRouter = createMemoryRouter(routes, {
    basename,
    initialEntries: [fullUrl]
  });
  const { initialTaxonomies, initialRoute, initialContent, initialTemplateContent, initialAuth, initialTime } = initialData;
  const helmetContext = {};
  return new Promise((resolve, reject) => {
    const stream = new PassThrough();
    let html = "";
    let didError = false;
    const { pipe } = renderToPipeableStream(
      /* @__PURE__ */ jsx(TimeProvider, { initialData: initialTime, children: /* @__PURE__ */ jsx(TaxonomyProvider, { initialData: initialTaxonomies, children: /* @__PURE__ */ jsx(RouteProvider, { initialData: initialRoute, children: /* @__PURE__ */ jsx(ContentProvider, { initialData: initialContent, children: /* @__PURE__ */ jsx(HeaderContentProvider, { initialData: initialTemplateContent, children: /* @__PURE__ */ jsx(AuthProvider, { initialData: initialAuth, children: /* @__PURE__ */ jsx(HelmetProvider, { context: helmetContext, children: /* @__PURE__ */ jsx(RouterProvider, { router: memoryRouter }) }) }) }) }) }) }) }),
      {
        onAllReady() {
          stream.on("data", (chunk) => {
            html += chunk.toString();
          });
          stream.on("end", () => {
            const { helmet } = helmetContext;
            const emptyHelmet = { title: "", meta: "", link: "" };
            resolve({
              appHtml: html,
              helmet: helmet || emptyHelmet
            });
          });
          pipe(stream);
        },
        onError(err) {
          didError = true;
          reject(err);
        }
      }
    );
    setTimeout(() => {
      if (didError) reject(new Error("SSR stream timeout"));
    }, 1e4);
  });
}
export {
  render
};
