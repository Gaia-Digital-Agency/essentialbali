import React, { useEffect, useState } from "react"; // useMemo
import { NavLink } from "react-router-dom"; //useNavigate
import NavLogo from "../../../components/front/NavLogo";
import MobileMenu from "../../../components/front/MobileMenu";
import {
  FacebookIconGreyDefault,
  HamburgerIcon,
  InstagramIconWhiteDefault,
  TwitterIconWhiteDefault,
} from "../../../icons"; //FacebookIconGreyDefault, FacebookIconGreyHover,
import { useTaxonomies } from "../../../context/TaxonomyContext";
import { RouteProps, useRoute } from "../../../context/RouteContext";
import { Category } from "../../../types/category.type";
import { SearchIcon } from "lucide-react";
import AreaMenuToggleButton from "../../../components/front/AreaMenuToggleButton";
import AreaMenuPanel from "../../../components/front/AreaMenuPanel";
import { getTemplateByUrl } from "../../../services/template.service";
import { isBaliAreaSlug } from "../../../utils/baliAreas";


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
        className={`menu-link text-[14px] text-nowrap capitalize 
                align-items-center justify-center
                ${isActive() ? "is-active" : ""}
                `}
        to={generateTo(menu.slug_title, actualRoute)}
      >
        {menu.title}
      </NavLink>
    </>
  );
};

const Header: React.FC = () => {
  // const { initialData } = useHeaderContent();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAreaOpen, setIsAreaOpen] = useState<boolean>(false);
  const [selectedAreaLabel, setSelectedAreaLabel] =
    useState<string>("All Area");

  const [headerMenus, setHeaderMenus] = useState<Category[]>([]);
  // const [areaSearch, setAreaSearch] = useState<string>("");
  const { taxonomies } = useTaxonomies();
  const { actualRoute } = useRoute();

  useEffect(() => {
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

          const filteredMenus =
            taxonomies.categories?.filter((category) =>
              linkCategoryIds.includes(category.id),
            ) ?? [];

          setHeaderMenus(filteredMenus);
        } else {
          const fallbackMenus = taxonomies.categories ?? [];
          setHeaderMenus(fallbackMenus);
        }
      } catch (e) {
        console.error("Error fetching header template:", e);
      }
    })();
  }, [taxonomies.categories]);

  useEffect(() => {
    if (actualRoute.country && isBaliAreaSlug(actualRoute.country.slug)) {
      setSelectedAreaLabel(actualRoute.country.name);
    } else {
      setSelectedAreaLabel("All Area");
    }
  }, [actualRoute]);

  const forcedMenuCategories = headerMenus;

  useEffect(() => {
    setIsModalOpen(false);
  }, [actualRoute]);

  const toNav = () => {
    return `/${actualRoute?.country ? actualRoute.country.slug : ""}${actualRoute?.city ? `/${actualRoute.city.slug}` : ""}${actualRoute?.region ? `/${actualRoute.region.slug}` : ""}`;
  };

  return (
    <>
      <header
        className="relative top-0 left-0 right-0 z-[100] bg-front-icewhite"
        role="banner"
      >
        <div className="container mx-auto py-5 relative flex items-center justify-between bg-front-icewhite h-[100px] md:h-[160px]">
          {/* LOGO (Left on Mobile, Center Absolute on Desktop) */}
          <div className="flex-1 md:flex-none md:absolute md:left-1/2 md:-translate-x-1/2 z-[101]">
            <NavLogo url="/logo-header" to={toNav()} />
          </div>

          {/* AREA TOGGLE (Center on Mobile, Left on Desktop) */}
          <div className="flex justify-center flex-1 md:flex-none md:order-first">
            <AreaMenuToggleButton
              label={selectedAreaLabel}
              open={isAreaOpen}
              onToggle={() => setIsAreaOpen((prev) => !prev)}
            />
          </div>

          {/* RIGHT SIDE (Hamburger on Mobile, Search on Desktop) */}
          <div className="flex justify-end flex-1 md:flex-none">
            <div
              className="md:hidden"
              onClick={() => setIsModalOpen(true)}
            >
              <HamburgerIcon className="w-[32px] h-[32px]" />
            </div>
            <div className="hidden md:block">
              <SearchIcon className="w-[20px] h-[20px] cursor-pointer" />
            </div>
          </div>
        </div>

        <div className="line bg-black h-[1px] w-full"></div>

        <AreaMenuPanel
          open={isAreaOpen}
          onSelect={(label: string) => {
            setSelectedAreaLabel(label);
            setIsAreaOpen(false);
          }}
        />

        <div className="categories-menu-navbar mx-auto py-[15px] hidden md:block bg-front-navy">

          <nav
            className="container relative flex flex-wrap items-center justify-center menus-wrapper gap-x-4 gap-y-3"
            aria-label="Categories"
          >
            {forcedMenuCategories.map((menu: Category, index: number) => (
              <>
                <MenuNav
                  menu={menu}
                  menus={forcedMenuCategories}
                  key={`header-menu-${menu.slug_title}`}
                />
                {index < forcedMenuCategories.length - 1 && (
                  <span className="mx-2  text-front-icewhite/40 text-[1em]">
                    |
                  </span>
                )}
              </>
            ))}
            <div className="absolute flex items-center justify-center right-5 gap-x-4">
              <FacebookIconGreyDefault className="w-[20px] h-[20px] cursor-pointer text-front-icewhite hover:text-front-dustly-slate duration-200" />
              <InstagramIconWhiteDefault className="w-[24px] h-[24px] cursor-pointer text-front-icewhite hover:text-front-dustly-slate duration-200" />
              <TwitterIconWhiteDefault className="w-[20px] h-[20px] cursor-pointer text-front-icewhite hover:text-front-dustly-slate duration-200" />
            </div>
          </nav>
        </div>
      </header>

      <MobileMenu
        isModalOpen={isModalOpen}
        closeModal={() => setIsModalOpen(false)}
      />
    </>
  );
};

export const schema = {
  menus: [{ label: "", url: "" }],
};

export default Header;
