import React, { useEffect, useState, useRef } from "react"; // useMemo
import { NavLink, useNavigate, Link } from "react-router-dom"; //useNavigate
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
import { SearchIcon, X, MapPin, ChevronDown } from "lucide-react";
import AreaMenuToggleButton from "../../../components/front/AreaMenuToggleButton";
import AreaMenuPanel from "../../../components/front/AreaMenuPanel";
import { getTemplateByUrl } from "../../../services/template.service";
import { useHeaderContent } from "../../../context/HeaderContext";
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

  // Visual states:
  //   active   — red text + semibold + 2px red underline (you-are-here)
  //   default  — light icewhite, hover icewhite/70
  // The "is-active" class is kept for any legacy CSS hooks.
  return (
    <>
      <NavLink
        key={menu.id}
        relative={"route"}
        className={`menu-link text-front-small text-nowrap capitalize
                align-items-center justify-center transition-colors duration-150
                pb-1 border-b-2
                ${
                  isActive()
                    ? "is-active text-front-red font-semibold border-front-red"
                    : "text-front-icewhite hover:text-front-icewhite/70 border-transparent"
                }`}
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
  const [isAreaOpen, setIsAreaOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedAreaLabel, setSelectedAreaLabel] =
    useState<string>("All Area");

  const [headerMenus, setHeaderMenus] = useState<Category[]>([]);
  // const [areaSearch, setAreaSearch] = useState<string>("");
  const { taxonomies } = useTaxonomies();
  const { actualRoute } = useRoute();
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!taxonomies.categories) return;
    const ssrHeader = Array.isArray(initialData?.header) ? initialData.header : null;
    if (ssrHeader && ssrHeader.length > 0) {
      const linkCategoryIds = ssrHeader.map(
        (item: { linkCategory: number }) => item.linkCategory,
      );
      setHeaderMenus(
        taxonomies.categories.filter((c) => linkCategoryIds.includes(c.id)),
      );
      return;
    }
    (async () => {
      try {
        const getTemplate = await getTemplateByUrl("/header");
        if (getTemplate?.data && getTemplate.status_code == 200) {
          const jsonData = JSON.parse(getTemplate.data.content);
          const linkCategoryIds = jsonData.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (item: any) => item.linkCategory,
          );
          setHeaderMenus(
            taxonomies.categories?.filter((c) =>
              linkCategoryIds.includes(c.id),
            ) ?? [],
          );
        } else {
          setHeaderMenus(taxonomies.categories ?? []);
        }
      } catch (e) {
        console.error("Error fetching header template:", e);
      }
    })();
  }, [taxonomies.categories, initialData?.header]);

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
    setIsSearchOpen(false);
  }, [actualRoute]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      window.addEventListener("keydown", handleKeyDown);
      // Auto focus after a short delay to wait for transition
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSearchOpen]);

  // Logo always navigates to the homepage. The previous behaviour
  // (stay-in-area: `/canggu/dine` → click logo → `/canggu`) confused
  // users — most sites treat the logo as the universal "back to home"
  // anchor. If we ever want a "back to area page" affordance, that
  // belongs on the breadcrumb, not the logo.
  const toNav = () => "/";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 3) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* SEARCH OVERLAY */}
      <div className={`fixed inset-0 z-[200] bg-front-icewhite/98 backdrop-blur-sm transition-all duration-500 ease-in-out ${isSearchOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <button
          className="absolute p-2 transition-transform duration-300 top-8 right-8 md:top-12 md:right-12 hover:rotate-90"
          onClick={() => setIsSearchOpen(false)}
        >
          <X className="w-8 h-8 md:w-10 md:h-10 text-front-navy" />
        </button>

        <div className="flex flex-col items-center justify-center h-full max-w-5xl px-6 mx-auto">
          <p className="text-front-shadowed-slate uppercase tracking-[0.2em] mb-10 text-xs md:text-sm font-sans font-bold">
            What are you looking for?
          </p>
          <form onSubmit={handleSearchSubmit} className="relative w-full group">
            <input
              ref={searchInputRef}
              type="text"
              className="w-full py-6 font-serif text-3xl text-center transition-colors duration-300 bg-transparent border-b-2 border-front-navy/20 focus:border-front-navy md:text-7xl text-front-navy placeholder:text-front-dustly-slate focus:outline-none"
              placeholder="Search Bali..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery.trim().length > 0 && searchQuery.trim().length < 3 && (
              <p className="mt-4 font-sans text-sm text-center text-front-red animate-pulse">
                Please enter at least 3 characters
              </p>
            )}
            <button
              type="submit"
              disabled={searchQuery.trim().length < 3}
              className={`flex items-center gap-3 px-8 py-3 mx-auto mt-12 font-sans font-bold tracking-widest uppercase transition-all duration-300 border-2 rounded-full ${searchQuery.trim().length < 3 ? 'opacity-50 cursor-not-allowed border-front-dustly-slate text-front-dustly-slate' : 'text-front-navy hover:text-front-red border-front-navy hover:border-front-red'} group`}
            >
              <span>Find Results</span>
              <SearchIcon className="w-5 h-5 duration-300 group-hover:translate-x-1" />
            </button>
          </form>
        </div>
      </div>

      <header
        className="sticky top-0 left-0 right-0 z-[100] bg-front-icewhite shadow-sm"
        role="banner"
      >
        <div className="container relative flex items-center justify-between h-[110px] pt-5 pb-7 md:pb-10 mx-auto bg-front-icewhite md:h-44">
          {/* LOGO (Left on Mobile, Center Absolute on Desktop) */}
          <div className="flex-1 md:flex-none md:absolute md:left-1/2 md:-translate-x-1/2 z-101">
            <NavLogo url="/logo-header" to={toNav()} />
          </div>

          {/* AREA TOGGLE (Center on Mobile, Left on Desktop) */}
          <div className="justify-center flex-1 hidden md:flex md:flex-none md:order-first">
            <AreaMenuToggleButton
              label={selectedAreaLabel}
              open={isAreaOpen}
              active={selectedAreaLabel !== "All Area"}
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
              <SearchIcon
                className={`w-[20px] h-[20px] cursor-pointer transition-colors ${isSearchOpen ? 'text-front-red' : 'text-black'}`}
                onClick={() => setIsSearchOpen(true)}
              />
            </div>
          </div>
        </div>

        <div className="line bg-front-navy/30 h-[1px] w-full"></div>

        <div
          className="flex items-center justify-between w-full px-6 py-4 cursor-pointer navbar-area md:hidden bg-front-navy"
          onClick={() => setIsAreaOpen(!isAreaOpen)}
        >
          <div className="flex items-center">
            <MapPin className="w-5 h-5 mr-3 text-front-icewhite" />
            <span className="font-sans font-light tracking-wider capitalize text-front-medium text-front-icewhite">
              {selectedAreaLabel}
            </span>
          </div>
          <ChevronDown className={`w-5 h-5 text-front-icewhite transition-transform duration-300 ${isAreaOpen ? 'rotate-180' : ''}`} />
        </div>

        <AreaMenuPanel
          open={isAreaOpen}
          onSelect={(label: string) => {
            setSelectedAreaLabel(label);
            setIsAreaOpen(false);
          }}
        />

        <div className="categories-menu-navbar mx-auto py-[15px] hidden md:block bg-front-navy">

          <nav
            className="container relative flex flex-wrap items-center justify-center menus-wrapper md:gap-x-1 gap-x-4 gap-y-3"
            aria-label="Categories"
          >
            {forcedMenuCategories.map((menu: Category, index: number) => (
              <React.Fragment key={`header-menu-container-${menu.slug_title}`}>
                <MenuNav
                  menu={menu}
                  menus={forcedMenuCategories}
                />
                {index < forcedMenuCategories.length - 1 && (
                  <span className="mx-2 text-front-icewhite/40 text-[1em]">
                    |
                  </span>
                )}
              </React.Fragment>
            ))}
            <div className="absolute items-center justify-center hidden lg:flex right-5 gap-x-4">
              <Link to={"https://www.facebook.com/essentialbali"} target="_blank">
                <FacebookIconGreyDefault className="w-5 h-5 duration-200 cursor-pointer text-front-icewhite hover:text-front-dustly-slate" />
              </Link>
              <Link to={"https://www.instagram.com/essentialbali/"} target="_blank">
                <InstagramIconWhiteDefault className="w-6 h-6 duration-200 cursor-pointer text-front-icewhite hover:text-front-dustly-slate" />
              </Link>
              <Link to={"https://twitter.com/essentialbali"} target="_blank">
                <TwitterIconWhiteDefault className="w-5 h-5 duration-200 cursor-pointer text-front-icewhite hover:text-front-dustly-slate" />
              </Link>
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
