import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { useHeaderContent } from "../../context/HeaderContext";
import { getTemplateByUrl } from "../../services/template.service";

const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL;
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || API_URL;

// Fallback logo if none is found in database
const STATIC_LOGO_PATH = "/logo.png";

type NavLogoProps = {
  url?: string;
  to: string;
};

const NavLogo: React.FC<NavLogoProps> = ({ url, to = "/" }) => {
  const { initialData } = useHeaderContent();
  const [logoSrc, setLogoSrc] = useState<string>(STATIC_LOGO_PATH);
  
  useEffect(() => {
    // 1. Try location-specific logo (site_logo from region/city/country)
    const locationLogo = initialData?.currentLogo;

    // 2. Try global logo from admin settings (template /logo-header)
    const dbLogo = initialData?.logo;

    // Accept both absolute URLs (https://storage.googleapis.com/.../foo.webp,
    // post-Phase-D Payload Media uploads) and legacy relative paths
    // (uploads/img_*.webp, dumped from MySQL during Phase E). Mirrors the
    // pattern in hooks/useArticle.ts so both eras coexist.
    const resolveLogoUrl = (raw: string): string =>
      /^https?:\/\//i.test(raw) ? raw : `${IMAGE_URL}/${raw}`;

    if (locationLogo) {
      setLogoSrc(resolveLogoUrl(locationLogo));
    } else if (dbLogo?.url) {
      setLogoSrc(resolveLogoUrl(dbLogo.url));
    } else if (url) {
      // 3. If not in initialData but url prop is provided, fetch it
      (async () => {
        try {
          const getTemplate = await getTemplateByUrl(url);
          if (getTemplate?.data?.content && getTemplate.status_code == 200) {
            const jsonData = JSON.parse(getTemplate.data.content);
            if (jsonData?.url) {
              setLogoSrc(`${IMAGE_URL}/${jsonData.url}`);
            }
          }
        } catch (e) {
          console.error("Error fetching logo from template:", e);
        }
      })();
    }
  }, [initialData, url]);

  return (
    <>
      <Link to={to}>
        <img
          src={logoSrc}
          width={80}
          height={80}
          className="h-[80px] md:h-[150px] aspect-square object-contain"
          alt="essentialbali logo"
        />
      </Link>
    </>
  );
};

export default NavLogo;
