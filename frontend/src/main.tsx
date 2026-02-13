// import ReactDOM from 'react-dom/client';
// import { HelmetProvider } from "react-helmet-async";
// import { TaxonomyProvider } from "./context/TaxonomyContext";
// import { createBrowserRouter, RouterProvider } from 'react-router-dom';
// import { routes } from './router-config';
// import { RouteProvider } from './context/RouteContext';
// import { ContentProvider } from './context/ContentContext';
// import React from 'react';
// import { HeaderContentProvider } from './context/HeaderContext';
// import { AuthProvider } from './context/AuthContext';
// import { TimeProvider } from './context/TimeContext';

// const browserRouter = createBrowserRouter(routes)


// ReactDOM.hydrateRoot( document.getElementById('root') as HTMLElement,
// // ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
//     <React.StrictMode>
//         <TimeProvider initialData={initialData?.initialTime}>
//             <TaxonomyProvider initialData={initialData?.initialTaxonomies}>
//                 <RouteProvider initialData={initialData?.initialRoute}>
//                     <ContentProvider initialData={initialData?.initialContent}>
//                         <HeaderContentProvider initialData={initialData?.initialTemplateContent}>
//                             <AuthProvider initialData={initialData?.initialAuth ? initialData.initialAuth[0] : null}>
//                                 <HelmetProvider>
//                                     <RouterProvider router={browserRouter} />
//                                 </HelmetProvider>
//                             </AuthProvider>
//                         </HeaderContentProvider>
//                     </ContentProvider>
//                 </RouteProvider>
//             </TaxonomyProvider>
//         </TimeProvider>
//     </React.StrictMode>
// );

// delete window.__INITIAL_DATA__;

import "./index.css";
import "./font.css";
import App from "./App";
import ReactDOM from 'react-dom/client';
import FrontApp from "./routes/FrontApp";

declare global {
    interface Window {
        __INITIAL_DATA__?: Record<string, any>
    }
}

const initialData = window.__INITIAL_DATA__;

const container = document.getElementById("root") as HTMLElement | null;
if (!container) {
  throw new Error("Missing #root element");
}

// Use hydration only when SSR markup + snapshot data are present.
// When running the Vite dev server directly, #root is empty and hydration will fail.
if (container.hasChildNodes() && initialData) {
  ReactDOM.hydrateRoot(
    container,
    <App initialData={initialData}>
      <FrontApp />
    </App>
  );
} else {
  ReactDOM.createRoot(container).render(
    <App initialData={initialData}>
      <FrontApp />
    </App>
  );
}
