import React, { useState, useEffect, useMemo } from "react";
import { getTemplateByUrl } from "../../services/template.service";
import Skeleton from "react-loading-skeleton";
// import Image from "./Image";
import { useHeaderContent } from "../../context/HeaderContext";
import NavLogo from "./NavLogo";
import Button from "./Button";
import { useTaxonomies } from "../../context/TaxonomyContext";
// import { useNavigate } from "react-router-dom";
import { Category } from "../../types/category.type";
import { Link } from 'react-router';
import { FacebookIconGreyDefault, InstagramIconGreyDefault, TwitterIconGreyDefault } from "../../icons";

// Brand logo lives in `/public/logo.png`.
// const BRAND_LOGO_PATH = "/logo.png";
export type AboutContentProps = {
  title: string;
  description: string;
  link: string;
  image: {
    url?: string;
    alt?: string | null;
  };
};

const DESIRED_HEADER_MENUS = [
  { slug: "events", label: "Events" },
  { slug: "deals", label: "Deals" },
  { slug: "featured", label: "Featured" },
  { slug: "ultimate-guide", label: "Ultimate Guide" },
  { slug: "health-wellness", label: "Health & Wellness" },
  { slug: "directory", label: "Directory" },
  { slug: "nature-adventure", label: "Nature Adventure" },
  { slug: "nature-adventure", label: "Nature Adventure" },
];

const About: React.FC = () => {
  const { initialData } = useHeaderContent();
  const [content, setContent] = useState<AboutContentProps | undefined>(
    initialData?.about,
  );

  // Fetch about template if not provided by SSR
  useEffect(() => {
    if (!content) {
      (async () => {
        try {
          const getTemplate = await getTemplateByUrl("/about");
          if (getTemplate?.status_code == 200 && getTemplate.data?.content) {
            setContent(JSON.parse(getTemplate.data.content));
          }
        } catch (e) {
          console.log("Error fetching about template:", e);
        }
      })();
    }
  }, []);

  const { taxonomies } = useTaxonomies();
  // console.log(taxonomies);
  // const { actualRoute } = useRoute();
//   const navigate = useNavigate();
  const forcedMenuCategories = useMemo(() => {
    const categories = taxonomies.categories ?? [];
    return DESIRED_HEADER_MENUS.map((item, index) => {
      const found = categories.find((cat) => cat.slug_title === item.slug);
      if (found) return found;
      return {
        id: -(index + 1),
        title: item.label,
        slug_title: item.slug,
      } as Category;
    });
  }, [taxonomies.categories]);

  return (
    <>
      <div className="">
        {/* <div className="grid grid-cols-12 md:gap-x-10 gap-y-10 items-center"> */}
        {/* <div className="md:col-span-6 col-span-12 md:order-1 order-2"> */}
        <div className="about-section mb-12">
          <NavLogo url="/logo-header" to="/"></NavLogo>
          <div className="container mt-8">
            <div className="description-wrapper">
              <p className="font-sans text-[16px]/[25px] text-front-shadowed-slate">
                {content?.description ?? <Skeleton />}
              </p>
            </div>
            <div className="button-wrapper mt-8">
              <Button
                text="Get The Essentials"
                link={content?.link ?? ""}
                type="primary"
              />
            </div>
          </div>
        </div>

        <div className="category-section mb-12">
          <div className="container">
            <p className="text-2xl font-serif text-front-navy capitalize mb-7">
              Essential Categories
            </p>
            <div className="category-wrapper flex flex-col gap-y-3 font-sans text-[16px]/[25px] text-front-shadowed-slate">
              {forcedMenuCategories.map((menu: Category) => (
                <p key={menu.id}>{menu.title}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="socmedia-section">
          <div className="container">
            <p className="text-2xl font-serif text-front-navy capitalize mb-7">
              Essential Community
            </p>
            <div className="item flex gap-x-4">
              <Link to={"#"} target="_blank">
                <FacebookIconGreyDefault height={28} width={28}/>
              </Link>
              <Link to={"#"} target="_blank">
                <InstagramIconGreyDefault height={28} width={28}/>
              </Link>
              <Link to={"#"} target="_blank">
                <TwitterIconGreyDefault height={28} width={28}/>
              </Link>
            </div>
          </div>
        </div>
        {/* </div> */}
        {/* </div> */}
      </div>
    </>
  );
};

export default About;
