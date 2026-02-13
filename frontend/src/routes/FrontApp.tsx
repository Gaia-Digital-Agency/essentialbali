import { createBrowserRouter, RouteObject, RouterProvider } from "react-router"
import { lazy, Suspense } from "react"
import { adminRoutes } from "./AdminApp"

const FrontLayout = lazy(() => import("../layout/FrontLayout"))
// const LocationAdminLayout = lazy(() => import("../layout/LocationAdminLayout"))

// Auth
const SignIn = lazy(() => import("../pages/AuthPages/SignIn"))
// const SignUp = lazy(() => import("../pages/AuthPages/SignUp"))


// Frontend
const PathResolver = lazy(() => import("../pages/Front/PathResolver"))

export const frontRoutes: RouteObject[] = [
    { path: "/signin", element: <Suspense fallback={<></>}><SignIn /></Suspense> },
    // { path: "/signup", element: <Suspense fallback={<></>}><SignUp /></Suspense> },

    {
        path: "/",
        element: (
            <Suspense fallback={<></>}>
                <FrontLayout />
            </Suspense>
        ),
        children: [
            { index: true, element: <PathResolver /> },
            { path: "*", element: <PathResolver /> },
        ],
    },
]

export const routes: RouteObject[] = [
    ...adminRoutes,
    ...frontRoutes.filter((route) => route.path !== "/signin"),
]

const FrontApp = () => {
    const router = createBrowserRouter(routes, { basename: import.meta.env.VITE_BASE_PATH || "/" })
    return <RouterProvider router={router} />
}

export default FrontApp
