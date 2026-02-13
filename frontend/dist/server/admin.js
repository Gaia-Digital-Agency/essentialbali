import { jsx } from "react/jsx-runtime";
import { PassThrough } from "stream";
import { renderToPipeableStream } from "react-dom/server";
import { createMemoryRouter, RouterProvider } from "react-router";
import { a as adminRoutes, T as TimeProvider, b as TaxonomyProvider, R as RouteProvider, C as ContentProvider, H as HeaderContentProvider, A as AuthProvider, p as pkg } from "./assets/TimeContext-B5j8j_GZ.js";
import "react";
import "axios";
import "react-fast-compare";
import "invariant";
import "shallowequal";
const { HelmetProvider } = pkg;
function render(url, initialData) {
  const memoryRouter = createMemoryRouter(adminRoutes, {
    initialEntries: [url]
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
