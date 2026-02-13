// import { RouteObject } from "react-router";
// import ProtectedRoute from "./components/ProtectedRoute";
// import SignIn from "./pages/AuthPages/SignIn";
// import SignUp from "./pages/AuthPages/SignUp";
// import UserProfiles from "./pages/UserManagement/UserProfiles";
// import FormElements from "./pages/Forms/FormElements";
// import Blank from "./pages/Blank";
// import MstCategories from "./pages/Master/Categories/MstCategories";
// import AppLayout from "./layout/AppLayout";
// import Home from "./pages/Dashboard/Home";
// import MstTags from "./pages/Master/Tags/MstTags";
// import MstLocations from "./pages/Master/Locations/MstLocations";
// import Users from "./pages/UserManagement/Users";
// import Registration from "./pages/UserManagement/Registration";
// import MediaForm from "./pages/Media/MediaForm";
// import MediaLibrary from "./pages/Media/MediaLibrary";
// import FrontLayout from "./layout/FrontLayout";
// import MstTemplates from "./pages/Master/Templates/MstTemplates";
// import LocationAdminLayout from "./layout/LocationAdminLayout";
// import MstArticle from "./pages/Master/Article/MstArticle";
// import FormArticle from "./pages/Master/Article/FormArticle";
// import ArticleAdmin from "./layout/ArticleAdmin";
// import EditArticle from "./pages/Master/Article/EditArticle";
// import Subscribers from "./pages/NewsletterSubscription/Subscribers";
// import GeneralTemplate from "./pages/Master/Templates/GeneralTemplate";
// import TemplateLayout from "./layout/TemplateLayout";
// import SettingPage from "./pages/Setting/SettingPage";
// import AboutTemplate from "./pages/Master/Templates/AboutTemplate";
// // import LocationTemplate from "./pages/Master/Templates/LocationTemplate";
// import PathResolver from "./pages/Front/PathResolver";
// // import HomeTemplate from "./pages/Front/Templates/Home";
// import SocmedSettingPage from "./pages/Setting/Socmed/SocmedSettingPage";
// import ConfigSMTP from "./pages/Setting/ConfigSMTP/ConfigSMTP";
// import JobApplicant from "./pages/JobApplicant/JobApplicant"
// import LocationTemplateExp from "./pages/Master/Templates/LocationTemplateExp";

// export const routes: RouteObject[] = [
//   { path: "/signin", element: <SignIn /> },
//   { path: "/signup", element: <SignUp /> },
//   {
//     path: "/admin",
//     element: <AppLayout />,
//     children: [
//       {
//         index: true,
//         element: (
//           <ProtectedRoute>
//             <Home />
//           </ProtectedRoute>
//         ),
//       },
//       {
//         path: "setting",
//         element: (
//             <ProtectedRoute allowedUserLevel={['super_admin']}>
//                 <SettingPage />
//             </ProtectedRoute>
//         )
//       },
//       {
//         path: "mst_locations",
//         element: (
//           <ProtectedRoute>
//             <MstLocations />
//           </ProtectedRoute>
//         ),
//       },
//       {
//         path: "mst_categories",
//         element: (
//           <ProtectedRoute allowedUserLevel={['super_admin']}>
//             <MstCategories />
//           </ProtectedRoute>
//         ),
//       },
//       {
//         path: "mst_tags",
//         element: (
//           <ProtectedRoute allowedUserLevel={['super_admin']}>
//             <MstTags />
//           </ProtectedRoute>
//         ),
//       },
//       {
//         path: "mst_templates",
//         element: (
//           <ProtectedRoute>
//             <TemplateLayout />
//           </ProtectedRoute>
//         ),
//         children: [
//             {
//                 index: true,
//                 element: (
//                     <ProtectedRoute>
//                         <MstTemplates />
//                     </ProtectedRoute>
//                 )
//             },
//             // {
//             //     path: "edit",
//             //     element: (
//             //         <ProtectedRoute>
//             //             <LocationTemplate />
//             //         </ProtectedRoute>
//             //     )
//             // },
//             {
//               path: "edit",
//               element: (
//                 <ProtectedRoute>
//                   <LocationTemplateExp />
//                 </ProtectedRoute>
//               )
//             },
//             {
//                 path: "about",
//                 element: (
//                     <ProtectedRoute allowedUserLevel={['super_admin']}>
//                         <AboutTemplate />
//                     </ProtectedRoute>
//                 )
//             },
//             {
//                 path: "general",
//                 element: (
//                     <ProtectedRoute allowedUserLevel={['super_admin']}>
//                         <GeneralTemplate />
//                     </ProtectedRoute>
//                 )
//             }
//         ]
//     },
//       {
//         path: "mst_article",
//         element: (
//           <ProtectedRoute>
//             <ArticleAdmin />
//           </ProtectedRoute>
//         ),
//         children: [
//           {
//             index: true,
//             element: (
//               <ProtectedRoute>
//                 <MstArticle />
//               </ProtectedRoute>
//             ),
//           },
//           {
//             path: "add",
//             element: (
//               <ProtectedRoute>
//                 <EditArticle action="add" />
//               </ProtectedRoute>
//             ),
//           },
//           {
//             path: "edit/:id",
//             element: (
//               <ProtectedRoute>
//                 <EditArticle action="edit" />
//               </ProtectedRoute>
//             ),
//           },
//           {
//             path: ":country",
//             element: (
//               <ProtectedRoute>
//                 <FormArticle />
//               </ProtectedRoute>
//             ),
//           },
//         ],
//       },
//       {
//         path: "users",
//         element: (
//           <ProtectedRoute allowedUserLevel={['super_admin']} >
//             <Users />
//           </ProtectedRoute>
//         ),
//       },
//       {
//         path: "registration",
//         element: (
//           <ProtectedRoute allowedUserLevel={['super_admin']} >
//             <Registration  />
//           </ProtectedRoute>
//         ),
//       },
//       {
//         path: "edit",
//         element: <LocationAdminLayout />,
//         // children: [
//         //   {
//         //     path: "location",
//         //     element: <LocationAdminLayout />,
//         //     children: [
//         //       { index: true, element: <LocationTemplate /> },
//         //       {
//         //         path: ":country",
//         //         element: <LocationTemplate />,
//         //       },
//         //       {
//         //         path: ":country/:city",
//         //         element: <LocationTemplate />,
//         //       },
//         //       {
//         //         path: ":country/:city/:region",
//         //         element: <LocationTemplate />,
//         //       },
//         //     ],
//         //   },
//         // ],
//       },
//       {
//         path: "profile",
//         element: (
//           <ProtectedRoute>
//             <UserProfiles />
//           </ProtectedRoute>
//         ),
//       },
//       {
//         path: "add_media",
//         element: (
//           <ProtectedRoute>
//             <MediaForm />
//           </ProtectedRoute>
//         ),
//       },
//       {
//         path: "media_library",
//         element: (
//           <ProtectedRoute>
//             <MediaLibrary />
//           </ProtectedRoute>
//         ),
//       },
//       { path: "blank", element: <Blank /> },
//       { path: "form-elements", element: <FormElements /> },
//       { 
//         path: "subscriber_list",
//         element: (
//           <ProtectedRoute allowedUserLevel={['super_admin']} >
//             <Subscribers />
//           </ProtectedRoute>
//         ) 
//       },
//       { path: "socmed", element: <SocmedSettingPage /> },
//       { path: "configSMTP", element: <ConfigSMTP /> },
//       { path: "job_applicant", element: <JobApplicant /> },
//     ],
//   },
//   {
//     path: "/",
//     element: <FrontLayout />,
//     children: [
//       {
//         index: true,
//         element: <PathResolver />,
//       },
//       {
//         // index: true,
//         path: "*",
//         element: <PathResolver />,
//       },
//     ],
//   },
// ];


import { RouteObject } from "react-router"
import { lazy, Suspense } from "react"
import ProtectedRoute from "./components/ProtectedRoute"

const AppLayout = lazy(() => import("./layout/AppLayout"))
const FrontLayout = lazy(() => import("./layout/FrontLayout"))
// const LocationAdminLayout = lazy(() => import("./layout/LocationAdminLayout"))
const ArticleAdmin = lazy(() => import("./layout/ArticleAdmin"))
const TemplateLayout = lazy(() => import("./layout/TemplateLayout"))

// Auth
const SignIn = lazy(() => import("./pages/AuthPages/SignIn"))
const SignUp = lazy(() => import("./pages/AuthPages/SignUp"))

// Admin pages
const Home = lazy(() => import("./pages/Dashboard/Home"))
const SettingPage = lazy(() => import("./pages/Setting/SettingPage"))
const SocmedSettingPage = lazy(() => import("./pages/Setting/Socmed/SocmedSettingPage"))
const ConfigSMTP = lazy(() => import("./pages/Setting/ConfigSMTP/ConfigSMTP"))
const MstCategories = lazy(() => import("./pages/Master/Categories/MstCategories"))
const MstTags = lazy(() => import("./pages/Master/Tags/MstTags"))
const MstLocations = lazy(() => import("./pages/Master/Locations/MstLocations"))
const MstTemplates = lazy(() => import("./pages/Master/Templates/MstTemplates"))
const GeneralTemplate = lazy(() => import("./pages/Master/Templates/GeneralTemplate"))
const AboutTemplate = lazy(() => import("./pages/Master/Templates/AboutTemplate"))
// const LocationTemplate = lazy(() => import("./pages/Master/Templates/LocationTemplate"))
const LocationTemplateExp = lazy(() => import("./pages/Master/Templates/LocationTemplateExp"))
const MstArticle = lazy(() => import("./pages/Master/Article/MstArticle"))
const FormArticle = lazy(() => import("./pages/Master/Article/FormArticle"))
const EditArticle = lazy(() => import("./pages/Master/Article/EditArticle"))
const Users = lazy(() => import("./pages/UserManagement/Users"))
const Registration = lazy(() => import("./pages/UserManagement/Registration"))
const UserProfiles = lazy(() => import("./pages/UserManagement/UserProfiles"))
const MediaForm = lazy(() => import("./pages/Media/MediaForm"))
const MediaLibrary = lazy(() => import("./pages/Media/MediaLibrary"))
const JobApplicant = lazy(() => import("./pages/JobApplicant/JobApplicant"))
const Subscribers = lazy(() => import("./pages/NewsletterSubscription/Subscribers"))
const Blank = lazy(() => import("./pages/Blank"))
const FormElements = lazy(() => import("./pages/Forms/FormElements"))

// Frontend
const PathResolver = lazy(() => import("./pages/Front/PathResolver"))

export const routes: RouteObject[] = [
    { path: "/signin", element: <Suspense fallback={<></>}><SignIn /></Suspense> },
    { path: "/signup", element: <Suspense fallback={<></>}><SignUp /></Suspense> },

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
