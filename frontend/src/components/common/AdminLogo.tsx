import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { getTemplateByUrl } from "../../services/template.service";

const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL;
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || API_URL;
const STATIC_LOGO_PATH = "/logo.png";

type AdminLogoProps = {
  className?: string;
  width?: number;
  height?: number;
  to?: string;
};

const AdminLogo: React.FC<AdminLogoProps> = ({ 
  className = "", 
  width = 180, 
  height = 75,
  to = "/admin"
}) => {
  const [logoSrc, setLogoSrc] = useState<string>(STATIC_LOGO_PATH);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await getTemplateByUrl("/logo-header");
        if (res?.status_code === 200 && res.data?.content) {
          const jsonData = JSON.parse(res.data.content);
          if (jsonData?.url) {
            setLogoSrc(`${IMAGE_URL}/${jsonData.url}`);
          }
        }
      } catch (e) {
        console.error("Error fetching admin logo:", e);
      }
    };

    fetchLogo();
  }, []);

  return (
    <Link to={to}>
      <img
        src={logoSrc}
        alt="essentialbali logo"
        width={width}
        height={height}
        className={className}
      />
    </Link>
  );
};

export default AdminLogo;
