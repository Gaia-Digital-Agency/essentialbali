import { createBrowserRouter, RouteObject, RouterProvider } from "react-router";
import { lazy } from "react";
import { Suspense } from "react";
// Admin pages
import ProtectedRoute from "../components/ProtectedRoute"
const ArticleAdmin = lazy(() => import("../layout/ArticleAdmin"))
const TemplateLayout = lazy(() => import("../layout/TemplateLayout"))
const AppLayout = lazy(() => import("../layout/AppLayout"))
const Home = lazy(() => import("../pages/Dashboard/Home"))
const SettingPage = lazy(() => import("../pages/Setting/SettingPage"))
const SocmedSettingPage = lazy(() => import("../pages/Setting/Socmed/SocmedSettingPage"))
const ConfigSMTP = lazy(() => import("../pages/Setting/ConfigSMTP/ConfigSMTP"))
const MstCategories = lazy(() => import("../pages/Master/Categories/MstCategories"))
const MstTags = lazy(() => import("../pages/Master/Tags/MstTags"))
const MstLocations = lazy(() => import("../pages/Master/Locations/MstLocations"))
const MstTemplates = lazy(() => import("../pages/Master/Templates/MstTemplates"))
const GeneralTemplate = lazy(() => import("../pages/Master/Templates/GeneralTemplate"))
const AboutTemplate = lazy(() => import("../pages/Master/Templates/AboutTemplate"))
// const LocationTemplate = lazy(() => import("../pages/Master/Templates/LocationTemplate"))
const LocationTemplateExp = lazy(() => import("../pages/Master/Templates/LocationTemplateExp"))
const MstArticle = lazy(() => import("../pages/Master/Article/MstArticle"))
const FormArticle = lazy(() => import("../pages/Master/Article/FormArticle"))
const EditArticle = lazy(() => import("../pages/Master/Article/EditArticle"))
const Users = lazy(() => import("../pages/UserManagement/Users"))
const Registration = lazy(() => import("../pages/UserManagement/Registration"))
const UserProfiles = lazy(() => import("../pages/UserManagement/UserProfiles"))
const MediaForm = lazy(() => import("../pages/Media/MediaForm"))
const MediaLibrary = lazy(() => import("../pages/Media/MediaLibrary"))
const JobApplicant = lazy(() => import("../pages/JobApplicant/JobApplicant"))
const Subscribers = lazy(() => import("../pages/NewsletterSubscription/Subscribers"))
const Blank = lazy(() => import("../pages/Blank"))
const FormElements = lazy(() => import("../pages/Forms/FormElements"))
const SignIn = lazy(() => import("../pages/AuthPages/SignIn"))

export const adminRoutes: RouteObject[] = [
    { path: "/signin", element: <Suspense fallback={<></>}><SignIn /></Suspense> },
    {
        path: "/admin",
        element: (
            <Suspense fallback={<></>}>
                <AppLayout />
            </Suspense>
        ),
        children: [
            {
                index: true,
                element: (
                    <ProtectedRoute>
                        <Home />
                    </ProtectedRoute>
                ),
            },
            {
                path: "setting",
                element: (
                    <ProtectedRoute allowedUserLevel={["super_admin"]}>
                        <SettingPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "mst_locations",
                element: (
                    <ProtectedRoute>
                        <MstLocations />
                    </ProtectedRoute>
                ),
            },
            {
                path: "mst_categories",
                element: (
                    <ProtectedRoute allowedUserLevel={["super_admin"]}>
                        <MstCategories />
                    </ProtectedRoute>
                ),
            },
            {
                path: "mst_tags",
                element: (
                    <ProtectedRoute allowedUserLevel={["super_admin"]}>
                        <MstTags />
                    </ProtectedRoute>
                ),
            },
            {
                path: "mst_templates",
                element: (
                    <ProtectedRoute>
                        <TemplateLayout />
                    </ProtectedRoute>
                ),
                children: [
                    {
                        index: true,
                        element: <MstTemplates />,
                    },
                    // { path: "edit-exp", element: <LocationTemplate /> },
                    { path: "edit", element: <LocationTemplateExp /> },
                    {
                        path: "about",
                        element: (
                            <ProtectedRoute allowedUserLevel={["super_admin"]}>
                                <AboutTemplate />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: "general",
                        element: (
                            <ProtectedRoute allowedUserLevel={["super_admin"]}>
                                <GeneralTemplate />
                            </ProtectedRoute>
                        ),
                    },
                ],
            },
            {
                path: "mst_article",
                element: (
                    <ProtectedRoute>
                        <ArticleAdmin />
                    </ProtectedRoute>
                ),
                children: [
                    { index: true, element: <MstArticle /> },
                    { path: "add", element: <EditArticle action="add" /> },
                    { path: "edit/:id", element: <EditArticle action="edit" /> },
                    { path: ":country", element: <FormArticle /> },
                ],
            },
            {
                path: "users",
                element: (
                    <ProtectedRoute allowedUserLevel={["super_admin"]}>
                        <Users />
                    </ProtectedRoute>
                ),
            },
            {
                path: "registration",
                element: (
                    <ProtectedRoute allowedUserLevel={["super_admin"]}>
                        <Registration />
                    </ProtectedRoute>
                ),
            },
            { path: "profile", element: <UserProfiles /> },
            { path: "add_media", element: <MediaForm /> },
            { path: "media_library", element: <MediaLibrary /> },
            { path: "blank", element: <Blank /> },
            { path: "form-elements", element: <FormElements /> },
            {
                path: "subscriber_list",
                element: (
                    <ProtectedRoute allowedUserLevel={["super_admin"]}>
                        <Subscribers />
                    </ProtectedRoute>
                ),
            },
            { path: "socmed", element: <SocmedSettingPage /> },
            { path: "configSMTP", element: <ConfigSMTP /> },
            { path: "job_applicant", element: <JobApplicant /> },
        ],
    },
]

const AdminApp = () => {
    const router = createBrowserRouter(adminRoutes, { basename: import.meta.env.VITE_BASE_PATH || "/" });
    return <RouterProvider router={router} />
}

export default AdminApp
