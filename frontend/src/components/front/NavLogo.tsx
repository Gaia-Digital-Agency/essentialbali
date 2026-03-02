import React from "react";
import { Link } from "react-router";
import { useHeaderContent } from "../../context/HeaderContext";

const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL;
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || API_URL;

// Fallback logo if none is found in database
const STATIC_LOGO_PATH = "/logo.png";

type NavLogoProps = {
  url?: string;
  to: string;
};

const NavLogo: React.FC<NavLogoProps> = ({ to = "/" }) => {
  const { initialData } = useHeaderContent();
  
  // 1. Try location-specific logo (site_logo from region/city/country)
  const locationLogo = initialData?.currentLogo;
  
  // 2. Try global logo from admin settings (template /logo-header)
  const dbLogo = initialData?.logo;
  
  let logoSrc = STATIC_LOGO_PATH;

  if (locationLogo) {
    logoSrc = `${IMAGE_URL}/${locationLogo}`;
  } else if (dbLogo?.url) {
    logoSrc = `${IMAGE_URL}/${dbLogo.url}`;
  }

  return (
    <>
      <Link to={to}>
        <img
          src={logoSrc}
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
