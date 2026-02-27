import React, { useState, useEffect } from "react";
import { getTemplateByUrl } from "../../services/template.service";
import Skeleton from "react-loading-skeleton";
// import Image from "./Image";
import { useHeaderContent } from "../../context/HeaderContext";
import NavLogo from "./NavLogo";
import Button from "./Button";
import { useTaxonomies } from "../../context/TaxonomyContext";
// import { useNavigate } from "react-router-dom";
import { Category } from "../../types/category.type";
import { Link, NavLink } from "react-router";
import {
  FacebookIconGreyDefault,
  InstagramIconGreyDefault,
  TwitterIconGreyDefault,
} from "../../icons";
import { RouteProps, useRoute } from "../../context/RouteContext";

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

const MenuNav: React.FC<{
  menu: Category;
  menus: Category[];
}> = ({ menu, menus }) => {
  const { taxonomies } = useTaxonomies();
  const { actualRoute } = useRoute();

  const generateTo = (url: string, route: RouteProps) => {
    if (route?.article) {
      return `/${route.country?.slug}/${url}`;
    }
    return `${route.country ? `/${route.country.slug}` : ""}${route.city ? `/${route.city.slug}` : ""}${route.region ? `/${route.region.slug}` : ""}/${url}`;
  };

  const isActive = () => {
    if (menu.id == actualRoute.category?.id) return true;
    if (
      actualRoute.category?.id_parent &&
      !menus.find((men) => actualRoute.category?.id == men.id)
    ) {
      return (
        taxonomies.categories?.find(
          (cat) => actualRoute.category?.id_parent == cat.id,
        )?.id == menu.id
      );
    }
    return false;
  };

  return (
    <>
      <NavLink
        key={menu.id}
        relative={"route"}
        className={`menu-link text-nowrap capitalize 
                align-items-center justify-center
                font-sans text-[16px]/[25px]
                text-front-shadowed-slate
                font-light
                hover:text-front-navy
                ${isActive() ? "is-active" : ""}
                `}
        to={generateTo(menu.slug_title, actualRoute)}
      >
        {menu.title}
      </NavLink>
    </>
  );
};

const About: React.FC = () => {
  const { initialData } = useHeaderContent();
  const [content, setContent] = useState<AboutContentProps | undefined>(
    initialData?.about,
  );
  const [menuList, setMenuList] = useState<Category[]>([]);

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

  useEffect(() => {
    // if (!headerMenus || headerMenus.length === 0) {
    (async () => {
      try {
        const getTemplate = await getTemplateByUrl("/header");
        if (getTemplate?.data && getTemplate.status_code == 200) {
          const vaTemplateHeader = getTemplate?.data?.content;
          const jsonData = JSON.parse(vaTemplateHeader);
          const linkCategoryIds = jsonData.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (item: any) => item.linkCategory,
          );

          // const filteredMenus = taxonomies.categories?.filter((category: any) =>
          //   linkCategoryIds.includes(category.id),
          // );

          const filteredMenus =
            taxonomies.categories?.filter((category) =>
              linkCategoryIds.includes(category.id),
            ) ?? [];

          setMenuList(filteredMenus);
        } else {
          const fallbackMenus = taxonomies.categories ?? [];
          setMenuList(fallbackMenus);
        }
      } catch (e) {
        console.error("Error fetching header template:", e);
      }
    })();
    // }
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
              {menuList.map((menu: Category) => (
                // <p key={menu.id}>{menu.title}</p>
                <MenuNav
                  menu={menu}
                  menus={menuList}
                  key={`header-menu-${menu.slug_title}`}
                />
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
                <FacebookIconGreyDefault height={28} width={28} />
              </Link>
              <Link to={"#"} target="_blank">
                <InstagramIconGreyDefault height={28} width={28} />
              </Link>
              <Link to={"#"} target="_blank">
                <TwitterIconGreyDefault height={28} width={28} />
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
