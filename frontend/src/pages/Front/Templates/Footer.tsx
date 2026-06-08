import React, { useMemo, useState } from "react";
import NavLogo from "../../../components/front/NavLogo";
import { NavLink } from "react-router";
import { useTaxonomies } from "../../../context/TaxonomyContext";
import { Category } from "../../../types/category.type";
import { RouteProps, useRoute } from "../../../context/RouteContext";
import { useHeaderContent } from "../../../context/HeaderContext";
import { AdvertiseModal } from "../../../components/front/AdvertiseModal";

const deriveMenuList = (
  categories: Category[],
  header: { linkCategory: number }[],
): Category[] => {
  const linkCategoryIds = header.map((item) => item.linkCategory);
  return categories.filter((c) => linkCategoryIds.includes(c.id));
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
  const [advertiseOpen, setAdvertiseOpen] = useState(false);
  const { taxonomies } = useTaxonomies();
  const { initialData } = useHeaderContent();

  // Derived synchronously from context — populated on both SSR and client
  // from the same provider data, eliminating the SSR→client mismatch that
  // caused a 0.4 CLS when the footer went from empty to full after hydration.
  const menuList = useMemo(() => {
    const cats = taxonomies.categories;
    if (!cats || cats.length === 0) return [];
    const header = Array.isArray(initialData?.header) ? initialData.header : null;
    if (header && header.length > 0) return deriveMenuList(cats, header);
    return cats;
  }, [taxonomies.categories, initialData?.header]);

  return (
    <footer className="footer bg-front-icewhite" style={{ minHeight: "280px" }}>
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
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <button
              type="button"
              onClick={() => setAdvertiseOpen(true)}
              className="inline-flex items-center px-5 py-2 font-sans text-front-small font-medium tracking-wide uppercase rounded-full border border-front-navy text-front-navy hover:bg-front-navy hover:text-front-icewhite transition-colors duration-200 cursor-pointer"
            >
              Advertise With Us
            </button>
            <div className="font-light item text-front-small text-front-shadowed-slate">
              Copyright &copy; {new Date().getFullYear()} Essential Bali
            </div>
            <a
              href="/admin"
              className="text-[11px] tracking-wide uppercase text-front-shadowed-slate hover:text-front-navy transition-colors"
              aria-label="Admin login"
            >
              Admin
            </a>
          </div>
        </div>
      </div>
      <AdvertiseModal open={advertiseOpen} onClose={() => setAdvertiseOpen(false)} />
    </footer>
  );
};

export default Footer;
