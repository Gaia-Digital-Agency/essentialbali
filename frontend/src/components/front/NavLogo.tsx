import React from "react"
import { Link } from "react-router"

// Single source of truth for branding logo: `/public/logo.png`.
const STATIC_LOGO_PATH = "/logo.png"

type NavLogoProps = {
    url?: string,
    to: string
}


const NavLogo: React.FC<NavLogoProps> = ({to = '/'}) => {
    return (
        <>
            <Link to={to}>
                <img
                  src={STATIC_LOGO_PATH}
                  width={124}
                  height={52}
                  className="w-auto h-[52px] md:h-[56px]"
                  alt="essentialbali logo"
                />
            </Link>
        </>
    )

}

export default NavLogo
