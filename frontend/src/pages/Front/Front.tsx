// import React, {useState, useEffect, ReactElement} from "react"
// import HomeTemplate from "./Templates/Home"
// import Single from "./Templates/Single"
// import SingleEvent from "./Templates/SingleEvent"
// import Deals from "./Templates/Deals"
// import { useRoute } from "../../context/RouteContext"

// const Front: React.FC = ({}) => {
//     const {actualRoute} = useRoute()
//     // const {actualRoute} = useOutletContext<{actualRoute: ActualRouteProps}>()
//     // const {isReadyRender} = useOutletContext<IsReadyRenderContextProps>()
//     const [render, setRender] = useState<ReactElement>(<></>)

//     useEffect(() => {
//         const renderRoute = () => {
//             if(actualRoute?.article && actualRoute.category) {
//                 const catSlug = actualRoute.category.slug_title
//                 if(catSlug == 'events') {
//                     return <SingleEvent />
//                 }
//                 if(catSlug == 'housing') {
//                     // return housing
//                 }
//                 return <Single />
//             }
//             if(actualRoute?.category) {
//                 const catSlug = actualRoute.category.slug_title
//                 if(catSlug == 'deals') {
//                     return <Deals />
//                 }
//             }

//             return <HomeTemplate />
//         }

//     setRender(renderRoute())

//     }, [actualRoute])
//     if(render) {
//         return (
//             <>
//                 <div className="page-container">
//                     {render}
//                 </div>
//             </>
//         )
//     }
// }

// export default Front