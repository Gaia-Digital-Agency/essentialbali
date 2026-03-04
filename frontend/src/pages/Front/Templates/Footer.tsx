import React, { useEffect, useState } from "react"; //useEffect, useState
// import { getTemplateByUrl } from "../../../services/template.service";
import NavLogo from "../../../components/front/NavLogo";
import { NavLink } from "react-router"; //Link, useNavigate
// import { FacebookIcon, InstagramIcon, LinkedinIcon } from "../../../icons";
import { useTaxonomies } from "../../../context/TaxonomyContext";
// import { isBaliAreaSlug } from "../../../utils/baliAreas";
// import SelectNav from "../../../components/front/SelectNav";
import { Category } from "../../../types/category.type";
import { RouteProps, useRoute } from "../../../context/RouteContext";
import { getTemplateByUrl } from "../../../services/template.service";


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
                text-front-charcoal-grey
                font-light
                hover:text-front-shadowed-slate
                ${isActive() ? "is-active" : ""}
                `}
        to={generateTo(menu.slug_title, actualRoute)}
      >
        {menu.title}
      </NavLink>
    </>
  );
};

const Footer: React.FC = () => {
  // const [content, setContent] = useState()
  // const [visitorCount, setVisitorCount] = useState(7127);
  // const [userLocation, setUserLocation] = useState("Bali Area");
  // const [userTime, setUserTime] = useState("");
  const [menuList, setMenuList] = useState<Category[]>([]);
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
    <footer className="footer bg-front-icewhite">
      <div className="container ">
        <div className="w-full bg-front-navy"></div>
        <div className="flex flex-col items-center py-5 logo-and-menu-wrapper gap-y-10">
          <div className="logo-wrapper">
            <NavLogo url="/logo-header" to="/"></NavLogo>
          </div>
          <div className="flex flex-wrap items-center justify-center links-wrapper gap-x-4 gap-y-2">
            {menuList.map((menu: Category, index: number) => (
              <React.Fragment key={`footer-menu-${menu.slug_title}`}>
                <MenuNav
                  menu={menu}
                  menus={menuList}
                />
                {index < menuList.length - 1 && (
                  <span className="text-front-shadowed-slate/40 text-[14px]">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="line bg-front-shadowed-slate/25 h-[1px] w-full"></div>
        <div className="py-5 copyright-wrapper outer">
          <div className="flex items-center justify-center text-center">
            <div className="font-light item text-front-small text-front-shadowed-slate">
              Essential Bali {new Date().getFullYear()} | GAIA Digital Agency
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
  // }
};

export default Footer;