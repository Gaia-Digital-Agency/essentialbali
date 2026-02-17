import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import NavLogo from "../../../components/front/NavLogo";
import DropDownCountry from "../../../components/front/DropDownCountry";
import MobileMenu from "../../../components/front/MobileMenu";
import { HamburgerIcon } from "../../../icons";
import { useTaxonomies } from "../../../context/TaxonomyContext";
import { RouteProps, useRoute } from "../../../context/RouteContext";
import { Category } from "../../../types/category.type";
import { getTemplateByUrl } from "../../../services/template.service";
import { useHeaderContent } from "../../../context/HeaderContext";
import { BALI_AREA_OPTIONS, isBaliAreaSlug } from "../../../utils/baliAreas";

const DESIRED_HEADER_MENUS = [
  { slug: "events", label: "Events" },
  { slug: "deals", label: "Deals" },
  { slug: "featured", label: "Featured" },
  { slug: "ultimate-guide", label: "Ultimate Guide" },
  { slug: "health-wellness", label: "Health & Wellness" },
  { slug: "directory", label: "Directory" },
  { slug: "nature-adventure", label: "Nature Adventure" },
];

const MenuNav: React.FC<{
  menu: Category;
  menus: Category[];
  index: number;
}> = ({ menu, menus, index }) => {
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
        className={`menu-link text-front-extra-small text-nowrap capitalize 
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
  const { initialData } = useHeaderContent();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [headerMenus, setHeaderMenus] = useState<any[]>(
    initialData?.header ?? [],
  );
  const [areaSearch, setAreaSearch] = useState<string>("");
  const { taxonomies } = useTaxonomies();
  const { actualRoute } = useRoute();
  const navigate = useNavigate();
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

  useEffect(() => {
    if (!headerMenus || headerMenus.length === 0) {
      (async () => {
        try {
          const getTemplate = await getTemplateByUrl("/header");
          if (getTemplate?.data && getTemplate.status_code == 200) {
            const jsonData = JSON.parse(getTemplate.data.content);
            setHeaderMenus(jsonData);
          } else {
            const fallbackMenus =
              taxonomies.categories
                ?.filter((cat) => !cat.id_parent)
                ?.map((cat) => ({
                  label: cat.title,
                  url: cat.slug_title,
                  linkCategory: cat.id,
                })) ?? [];
            setHeaderMenus(fallbackMenus);
          }
        } catch (e) {
          console.log("Error fetching header template:", e);
          const fallbackMenus =
            taxonomies.categories
              ?.filter((cat) => !cat.id_parent)
              ?.map((cat) => ({
                label: cat.title,
                url: cat.slug_title,
                linkCategory: cat.id,
              })) ?? [];
          setHeaderMenus(fallbackMenus);
        }
      })();
    }
  }, [taxonomies.categories]);

  useEffect(() => {
    setIsModalOpen(false);
  }, [actualRoute]);

  const toNav = () => {
    return `/${actualRoute?.country ? actualRoute.country.slug : ""}${actualRoute?.city ? `/${actualRoute.city.slug}` : ""}${actualRoute?.region ? `/${actualRoute.region.slug}` : ""}`;
  };

  const baliAreas = useMemo(() => {
    const taxonomyAreas = (taxonomies.countries ?? []).filter(
      (country) => country.id !== 999 && isBaliAreaSlug(country.slug),
    );
    if (taxonomyAreas.length > 0) return taxonomyAreas;
    return BALI_AREA_OPTIONS.map((area, index) => ({
      id: -(index + 1),
      name: area.name,
      slug: area.slug,
    }));
  }, [taxonomies.countries]);

  const areaSearchSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const normalized = areaSearch
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    const fallbackArea = baliAreas[0];
    if (!normalized) {
      if (fallbackArea) navigate(`/${fallbackArea.slug}`);
      return;
    }

    const exact = baliAreas.find(
      (area) =>
        area.slug.toLowerCase() === normalized ||
        area.name.toLowerCase() === areaSearch.trim().toLowerCase(),
    );
    const startsWith = baliAreas.find(
      (area) =>
        area.slug.toLowerCase().startsWith(normalized) ||
        area.name.toLowerCase().startsWith(areaSearch.trim().toLowerCase()),
    );
    const partial = baliAreas.find(
      (area) =>
        area.slug.toLowerCase().includes(normalized) ||
        area.name.toLowerCase().includes(areaSearch.trim().toLowerCase()),
    );

    const target = exact ?? startsWith ?? partial ?? fallbackArea;
    if (target) navigate(`/${target.slug}`);
  };

  return (
    <>
      <header
        className="relative top-0 left-0 right-0 z-[100] bg-front-icewhite mb-[20px]"
        role="banner"
      >
        <div className="container mx-auto py-5 flex justify-between items-center gap-4">
          <div className="logo-wrapper w-max flex items-center gap-3">
            <NavLogo url="/logo-header" to={toNav()} />
          </div>

          <div
            className="hamburger md:hidden block"
            onClick={() => setIsModalOpen(true)}
          >
            <HamburgerIcon className="w-[32px] h-[32px]" />
          </div>
        </div>

        <div className="line bg-black h-[1px] w-full"></div>

        <div className="container mx-auto py-4 hidden md:flex items-center gap-4 area-nav-tools">
          <div className="min-w-[250px]">
            <DropDownCountry />
          </div>

          <form
            onSubmit={areaSearchSubmitHandler}
            className="area-search-wrapper flex-1 flex items-center gap-2"
          >
            <input
              type="text"
              list="bali-areas-list"
              value={areaSearch}
              onChange={(event) => setAreaSearch(event.target.value)}
              className="w-full border border-[#e5d8d8] px-4 py-3 text-front-body"
              placeholder="Type a Bali area"
            />
            <datalist id="bali-areas-list">
              {baliAreas.map((area) => (
                <option value={area.name} key={`area-option-${area.slug}`} />
              ))}
            </datalist>
            <button
              type="submit"
              className="bg-front-red text-white uppercase px-5 py-3 text-front-small font-semibold"
            >
              Go
            </button>
          </form>
        </div>

        <div className="line bg-black h-[1px] w-full"></div>

        <div className="mx-auto py-[15px] hidden md:block bg-front-navy">
          <nav
            className="container menus-wrapper flex flex-wrap items-center gap-x-6 gap-y-3 justify-center"
            aria-label="Categories"
          >
            {forcedMenuCategories.map((menu: Category, index: number) => (
              <>
                <MenuNav
                  menu={menu}
                  menus={forcedMenuCategories}
                  key={`header-menu-${menu.slug_title}`}
                  index={index}
                />
                {index < forcedMenuCategories.length - 1 && (
                  <span className="mx-2 pb-2 text-front-icewhite/40 text-[1em]">|</span>
                )}
              </>
            ))}
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
