import React from "react";
import { Link } from "react-router";

// Single source of truth for branding logo: `/public/logo.png`.
const STATIC_LOGO_PATH = "/logo.png";

type NavLogoProps = {
  url?: string;
  to: string;
};

const NavLogo: React.FC<NavLogoProps> = ({ to = "/" }) => {
  return (
    <>
      <Link to={to}>
        <img
          src={STATIC_LOGO_PATH}
          width={150}
          height={150}
          className="w-auto h-[150px] md:h-[150px]"
          alt="essentialbali logo"
        />
      </Link>
    </>
  );
};

export default NavLogo;

// import React, { useEffect, useState } from "react"
// import { getTemplateByUrl } from "../../services/template.service"
// import { Link } from "react-router"
// import Skeleton from 'react-loading-skeleton'
// import { useRoute } from "../../context/RouteContext"
// import { useHeaderContent } from "../../context/HeaderContext"
// const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL

// type NavLogoProps = {
//     url?: string,
//     to: string
// }

// const NavLogo: React.FC<NavLogoProps> = ({to = '/'}) => {
//     const {initialData} = useHeaderContent()
//     const defaultImage = initialData.logo ?? false
//     const [image, setImage] = useState<{url: string, id: number} | false>(initialData.currentLogo ? {url: initialData.currentLogo, id: 0} : false)
//     const {actualRoute, clientChange} = useRoute()

//     useEffect(() => {
//         if(!clientChange) return;
//         (async () => {
//             try {
//                 if(actualRoute.region && actualRoute.region.site_logo) {
//                     setImage({url: actualRoute.region.site_logo, id: 0})
//                     return
//                 }
//                 if(actualRoute.city && actualRoute.city.site_logo) {
//                     setImage({url: actualRoute.city.site_logo, id: 0})
//                     return
//                 }
//                 if(actualRoute.country && actualRoute.country.site_logo) {
//                     setImage({url: actualRoute.country.site_logo, id: 0})
//                     return
//                 }
//                 setImage(false)
//             } catch(e) {
//                 console.log(e)
//             }
//         })()
//     }, [actualRoute, clientChange])

//     const renderImage = () => {
//         if(!defaultImage && !image) {
//             return <Skeleton height="76px" width="141px" containerClassName="logo-wrapper-skeleton inline-block" />
//         }
//         if(!image && defaultImage) return <img src={defaultImage ? `${API_URL}/${defaultImage.url}` : '#'} style={{display: defaultImage ? 'block' : 'none'}} width={150} height={150} alt="Logo" />
//         return <img src={image ? `${API_URL}/${image.url}` : '#'} style={{display: image ? 'block' : 'none'}} width={150} height={150} alt="Logo" />
//     }

//     return (
//         <>
//             <Link to={to}>
//                 {renderImage()}
//             </Link>
//         </>
//     )

// }

// export default NavLogo
