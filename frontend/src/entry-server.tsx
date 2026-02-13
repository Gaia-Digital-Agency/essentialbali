// import React from 'react';
// import ReactDOMServer from 'react-dom/server';
// import { RouterProvider, createMemoryRouter } from 'react-router-dom';
// import { TaxonomyProvider } from './context/TaxonomyContext';
// import { ContentProvider } from './context/ContentContext';

// import {routes} from './router-config'

// import ReactHelmet from 'react-helmet-async';
// import { RouteProvider } from './context/RouteContext';
// import { ArticleProps } from './types/article.type';
// const { HelmetProvider } = ReactHelmet;
// type InitialDataProps = {
//     initialTaxonomies: TaxonomiesProps,
//     initialRoute: any,
//     initialContent: ArticleProps[]
// }
// type TaxonomiesProps = {
//     countries: any,
//     cities: any,
//     regions: any,
//     categories: any
// }

// export function render(url: string, initialData: InitialDataProps) {
//   const memoryRouter = createMemoryRouter(routes, {
//     initialEntries: [url],
//   });

//   const {initialTaxonomies, initialRoute, initialContent} = initialData
//   // Create a context for Helmet to store the tags
//   const helmetContext: { helmet?: any } = {};

//   const appHtml = ReactDOMServer.renderToString(
//     <React.StrictMode>
//         <TaxonomyProvider initialData={initialTaxonomies}>
//             <RouteProvider initialData={initialRoute}>
//                 <ContentProvider initialData={initialContent}>
//                     <HelmetProvider context={helmetContext}>
//                         <RouterProvider router={memoryRouter} />
//                     </HelmetProvider>
//                 </ContentProvider>
//             </RouteProvider>
//         </TaxonomyProvider>
//     </React.StrictMode>
//   );

//   // Extract the rendered helmet tags
//   const { helmet } = helmetContext;
//   const emptyHelmet = {title: '', meta: '', link: ''}

//   // Return both the app HTML and the helmet tags
//   return { appHtml, helmet: helmet || emptyHelmet };
// }

import { PassThrough } from 'stream'
import { renderToPipeableStream } from 'react-dom/server'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { TaxonomyProvider } from './context/TaxonomyContext'
import { ContentProvider } from './context/ContentContext'
import { RouteProvider } from './context/RouteContext'
import { routes } from './routes/FrontApp'
// import { HelmetProvider } from 'react-helmet-async'
import pkg from './lib/utils/Helmet'
const {HelmetProvider} = pkg
import type { ArticleProps } from './types/article.type'
import { HeaderContentProvider } from './context/HeaderContext'
import { AuthProvider } from './context/AuthContext'
import { TimeProvider } from './context/TimeContext'

type InitialDataProps = {
    initialTaxonomies: TaxonomiesProps
    initialRoute: any
    initialContent: ArticleProps[],
    initialTemplateContent: any,
    initialAuth: any,
    initialTime: string
}

type TaxonomiesProps = {
    countries: any
    cities: any
    regions: any
    categories: any
}

export function render(url: string, initialData: InitialDataProps) {
    const basename = process.env.VITE_BASE_PATH || '/';
    // Prepend basename to URL since nginx strips it
    const fullUrl = basename.replace(/\/$/, '') + (url.startsWith('/') ? url : '/' + url);
    const memoryRouter = createMemoryRouter(routes, {
        basename,
        initialEntries: [fullUrl],
    })

    // const router = createStaticRouter(routes)

    const { initialTaxonomies, initialRoute, initialContent, initialTemplateContent, initialAuth, initialTime } = initialData
    const helmetContext: { helmet?: any } = {}

    return new Promise<{ appHtml: string; helmet: any }>((resolve, reject) => {
        const stream = new PassThrough()
        let html = ''
        let didError = false

        const { pipe } = renderToPipeableStream(
            <TimeProvider initialData={initialTime}>
                <TaxonomyProvider initialData={initialTaxonomies}>
                    <RouteProvider initialData={initialRoute}>
                        <ContentProvider initialData={initialContent}>
                            <HeaderContentProvider initialData={initialTemplateContent}>
                                <AuthProvider initialData={initialAuth}>
                                    <HelmetProvider context={helmetContext}>
                                        <RouterProvider router={memoryRouter} />
                                    </HelmetProvider>
                                </AuthProvider>
                            </HeaderContentProvider>
                        </ContentProvider>
                    </RouteProvider>
                </TaxonomyProvider>
            </TimeProvider>,
            {
                onAllReady() {
                    // Collect stream chunks into full HTML string
                    stream.on('data', (chunk) => {
                        html += chunk.toString()
                    })

                    stream.on('end', () => {
                        const { helmet } = helmetContext
                        const emptyHelmet = { title: '', meta: '', link: '' }
                        resolve({
                            appHtml: html,
                            helmet: helmet || emptyHelmet,
                        })
                    })

                    pipe(stream)
                },
                onError(err) {
                    didError = true
                    reject(err)
                },
            }
        )

        // Timeout fallback (avoid hanging)
        setTimeout(() => {
            if (didError) reject(new Error('SSR stream timeout'))
        }, 10000)
    })
}









// import { PassThrough } from 'stream';
// import { renderToPipeableStream } from 'react-dom/server';
// import {
//   createStaticHandler,
//   createStaticRouter,
//   StaticRouterProvider,
// } from 'react-router';
// import { TaxonomyProvider } from './context/TaxonomyContext';
// import { ContentProvider } from './context/ContentContext';
// import { RouteProvider } from './context/RouteContext';
// import { routes } from './router-config';
// import pkg from './lib/utils/Helmet';
// const { HelmetProvider } = pkg;
// import type { ArticleProps } from './types/article.type';
// type InitialDataProps = {
//     initialTaxonomies: TaxonomiesProps
//     initialRoute: any
//     initialContent: ArticleProps[]
// }

// type TaxonomiesProps = {
//     countries: any
//     cities: any
//     regions: any
//     categories: any
// }


// // 1. Create the Static Handler (can be done once, outside the render function)
// const handler = createStaticHandler(routes);

// // Helper function to create a Fetch Request from a Node URL
// // (React Router server APIs use the web Fetch API standard)
// function createFetchRequest(url: string, method: string = 'GET'): Request {
//   const anUrl = new URL(url, 'http://localhost'); // Base is arbitrary
//   return new Request(anUrl, { method });
// }

// export async function render(url: string, initialData: InitialDataProps) {
//   // 2. Query the handler for the current request
//   const fetchRequest = createFetchRequest(url);
//   const context = await handler.query(fetchRequest);

//   // Handle redirects (optional but recommended)
//   if (context instanceof Response && context.status >= 300 && context.status <= 399) {
//     // This is a redirect. You should handle this in your Express server
//     // by throwing an error or returning a special value.
//     // For this function, we'll just throw an error.
//     throw new Error(`Redirect: ${context.status} ${context.headers.get('Location')}`);
//   }

//   // 3. Create the Static Router
//   const router = createStaticRouter(handler.dataRoutes, context);

//   const { initialTaxonomies, initialRoute, initialContent } = initialData;
//   const helmetContext: { helmet?: any } = {};

//   return new Promise<{ appHtml: string; helmet: any }>((resolve, reject) => {
//     const stream = new PassThrough();
//     let html = '';
//     let didError = false;

//     const { pipe } = renderToPipeableStream(
//       // 4. Use <StaticRouterProvider> instead of <RouterProvider>
//       <TaxonomyProvider initialData={initialTaxonomies}>
//         <RouteProvider initialData={initialRoute}>
//           <ContentProvider initialData={initialContent}>
//             <HelmetProvider context={helmetContext}>
//               <StaticRouterProvider
//                 router={router}
//                 context={context}
//               />
//             </HelmetProvider>
//           </ContentProvider>
//         </RouteProvider>
//       </TaxonomyProvider>,
//       {
//         onAllReady() {
//           stream.on('data', (chunk) => {
//             html += chunk.toString();
//           });
//           stream.on('end', () => {
//             const { helmet } = helmetContext;
//             const emptyHelmet = { title: '', meta: '', link: '' };
//             resolve({
//               appHtml: html,
//               helmet: helmet || emptyHelmet,
//             });
//           });
//           pipe(stream);
//         },
//         onError(err) {
//           didError = true;
//           reject(err);
//         },
//       }
//     );

//     // ... (Your timeout logic remains the same) ...
//   });
// }