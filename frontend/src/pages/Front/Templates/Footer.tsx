import React, { useEffect, useMemo, useState } from "react";
// import { getTemplateByUrl } from "../../../services/template.service";
import NavLogo from "../../../components/front/NavLogo";
import { Link, NavLink, useNavigate } from "react-router";
import { FacebookIcon, InstagramIcon, LinkedinIcon } from "../../../icons";
import { useTaxonomies } from "../../../context/TaxonomyContext";
import { isBaliAreaSlug } from "../../../utils/baliAreas";
import SelectNav from "../../../components/front/SelectNav";
import { Category } from "../../../types/category.type";
import { RouteProps, useRoute } from "../../../context/RouteContext";

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
  const [visitorCount, setVisitorCount] = useState(7127);
  const [userLocation, setUserLocation] = useState("Bali Area");
  const [userTime, setUserTime] = useState("");

  const { taxonomies } = useTaxonomies();
  const navigate = useNavigate();
  const filteredCountries = { ...taxonomies }.countries?.filter(
    (coun) => coun.id != 999 && isBaliAreaSlug(coun.slug),
  );
  const filteredTax = { ...taxonomies, countries: filteredCountries };
  const exploreOptions =
    filteredTax?.countries?.map((country) => ({
      value: country.slug,
      label: country.name,
    })) ?? [];

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storageKey = "essentialbali_visitor_count";
    const raw = window.localStorage.getItem(storageKey);
    const parsed = Number.parseInt(raw || "", 10);
    const nextCount = Number.isFinite(parsed) ? parsed + 1 : 7127;
    window.localStorage.setItem(storageKey, String(nextCount));
    setVisitorCount(nextCount);

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const city = timezone.split("/").pop()?.replace(/_/g, " ") || "Bali Area";
    let region = "";
    const language = navigator.language || "en-US";
    const countryCode = language.split("-")[1];
    if (countryCode && typeof Intl.DisplayNames !== "undefined") {
      const regionNames = new Intl.DisplayNames([language], { type: "region" });
      region = regionNames.of(countryCode) || "";
    }
    const locationLabel = [city, region].filter(Boolean).join(", ");
    setUserLocation(locationLabel || "Bali Area");

    const tick = () => {
      const now = new Date();
      setUserTime(
        now.toLocaleString(language, {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  console.log(taxonomies);
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

  console.log("sepisan =>", forcedMenuCategories);

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
                {forcedMenuCategories.map((menu: Category) => (
                  // <p className="font-sans text-[16px]/[25px]" key={menu.id}>{menu.title}</p>
                  <MenuNav
                    menu={menu}
                    menus={forcedMenuCategories}
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
