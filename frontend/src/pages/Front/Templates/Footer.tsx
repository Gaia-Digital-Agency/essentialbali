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
        <div className="line bg-front-navy h-[0.5px] w-full"></div>
        <div className="py-12 ">
          <div className="grid grid-cols-12 md:gap-x-16 gap-y-10 items-center">
            <div className="col-span-6 flex items-center">
              <div className="logo-wrapper max-w items-center justify-center">
                <NavLogo url="/logo-header" to="/"></NavLogo>
              </div>
            </div>
            <div className="md:col-span-6 col-span-6 flex justify-end">
              {/* <div className="links-wrapper flex flex-col gap-y-2"> */}
              <div className="links-wrapper grid grid-flow-col grid-rows-3 gap-x-30 gap-y-2">
                {menuList.map((menu: Category) => (
                  // <p className="font-sans text-[16px]/[25px]" key={menu.id}>{menu.title}</p>
                  <MenuNav
                    menu={menu}
                    menus={menuList}
                    key={`header-menu-${menu.slug_title}`}
                  />
                ))}
                {/* <div className="link">
                  <Link
                    to="/privacy-policy"
                    className="font-sans text-[16px]/[25px]"
                  >
                    Privacy Policy
                  </Link>
                </div>
                <div className="link">
                  <Link to="/privacy-policy" className="text-front-body-small">
                    Term & Conditions
                  </Link>
                </div>
                <div className="link">
                  <Link to="/privacy-policy" className="text-front-body-small">
                    Term & Conditions
                  </Link>
                </div>
                <div className="link">
                  <Link to="/privacy-policy" className="text-front-body-small">
                    Term & Conditions
                  </Link>
                </div>
                <div className="link">
                  <Link to="/privacy-policy" className="text-front-body-small">
                    Term & Conditions
                  </Link>
                </div>
                <div className="link">
                  <Link to="/privacy-policy" className="text-front-body-small">
                    Term & Conditions
                  </Link>
                </div>
                <div className="link">
                  <Link to="/privacy-policy" className="text-front-body-small">
                    Term & Conditions
                  </Link>
                </div>
                <div className="link">
                  <Link to="/privacy-policy" className="text-front-body-small">
                    Term & Conditions
                  </Link>
                </div>
                <div className="link">
                  <Link to="/privacy-policy" className="text-front-body-small">
                    Term & Conditions
                  </Link>
                </div> */}
              </div>
            </div>
            {/* <div className="md:col-span-3 col-span-12">
              <div className="title-wrapper mb-2.5">
                <p className="font-serif text-front-body-big">Explore</p>
              </div>
              <div className="dropdown-country-wrapper max-w-[260px]">
                <SelectNav
                  options={exploreOptions}
                  defaultLabel={"Select Bali Area"}
                  onChange={(slug) => {
                    if (!slug) return;
                    navigate(`/${slug}`);
                  }}
                  classNames={{
                    singleValue:
                      "dropdown-country-nav dropdown-country-input text-theme-front-red md:w-[260px] w-[190px]",
                    option:
                      "dropdown-country-nav dropdown-country-option text-theme-front-red",
                  }}
                />
              </div>
            </div> */}
          </div>
        </div>
        <div className="line bg-front-navy h-[0.5px] w-full"></div>
        <div className="outer py-5">
          <div className="flex justify-between items-center">
            <div className="item text-front-small font-light text-front-charcoal-grey">
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
