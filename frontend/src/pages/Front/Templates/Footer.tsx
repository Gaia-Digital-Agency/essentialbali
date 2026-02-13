import React, { useEffect, useState } from "react";
// import { getTemplateByUrl } from "../../../services/template.service";
import NavLogo from "../../../components/front/NavLogo";
import { Link, useNavigate } from "react-router";
import { FacebookIcon, InstagramIcon, LinkedinIcon } from "../../../icons";
import { useTaxonomies } from "../../../context/TaxonomyContext";
import { isBaliAreaSlug } from "../../../utils/baliAreas";
import SelectNav from "../../../components/front/SelectNav";


const Footer: React.FC = () => {
    // const [content, setContent] = useState()
    const [visitorCount, setVisitorCount] = useState(7127);
    const [userLocation, setUserLocation] = useState("Bali Area");
    const [userTime, setUserTime] = useState("");

    const {taxonomies} = useTaxonomies()
    const navigate = useNavigate()
    const filteredCountries = {...taxonomies}.countries?.filter((coun) => coun.id != 999 && isBaliAreaSlug(coun.slug))
    const filteredTax = {...taxonomies, countries: filteredCountries}
    const exploreOptions =
        filteredTax?.countries?.map((country) => ({ value: country.slug, label: country.name })) ?? []

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

    // useEffect(() => {

    //     (async() => {
    //         const getTemplate = await getTemplateByUrl('/footer')
    //         if(getTemplate?.status_code == 200 && getTemplate.data?.content) {
    //             setContent(JSON.parse(getTemplate.data.content))
    //             // console.log(content)
    //         }
    //     })()

    // }, [])
    // if(content) {
    //     return 
    // }
    // if(!content) {
        return (
            <footer className="footer">
                <div className="container pt-6 pb-2 text-center">
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 border border-front-red text-front-red px-4 py-2 uppercase text-front-small font-semibold"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    >
                        Back To Top
                    </button>
                </div>
                <div className="container py-12">
                    <div className="grid grid-cols-12 md:gap-x-16 gap-y-10">
                        <div className="col-span-12 mb-8">
                            <div className="logo-wrapper max-w">
                                <NavLogo url="/logo-header" to="/"></NavLogo>
                            </div>
                        </div>
                        <div className="md:col-span-6 col-span-12">
                            <div className="text-wrapper">
                                <p className="text-front-body-big mb-8">
                                    Welcome to essentialbali, your practical guide to discovering Bali area by area. We help travelers, expats, and locals find where to stay, eat, explore, and experience the island with confidence.
                                </p>
                                <p className="text-front-body-big mb-8">
                                    essentialbali Editorial Desk<br />
                                    Bali
                                </p>
                                <p className="text-front-body-big">
                                    Email. info@essentialbali.com
                                </p>
                            </div>
                        </div>
                        <div className="md:col-span-3 col-span-12">
                            <div className="title-wrapper mb-2.5">
                                <p className="font-serif text-front-body-big">Website Links</p>
                            </div>
                            <div className="links-wrapper">
                                <div className="link mb-2">
                                    <Link to='/privacy-policy' className="text-front-body-big">Privacy Policy</Link>
                                </div>
                                <div className="link">
                                    <Link to='/privacy-policy' className="text-front-body-big">Term & Conditions</Link>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-3 col-span-12">
                            <div className="title-wrapper mb-2.5">
                                <p className="font-serif text-front-body-big">Explore</p>
                            </div>
                            <div className="dropdown-country-wrapper max-w-[260px]">
                                <SelectNav
                                    options={exploreOptions}
                                    defaultLabel={"Select Bali Area"}
                                    onChange={(slug) => {
                                        if (!slug) return
                                        navigate(`/${slug}`)
                                    }}
                                    classNames={{
                                        singleValue:
                                            "dropdown-country-nav dropdown-country-input text-theme-front-red md:w-[260px] w-[190px]",
                                        option: "dropdown-country-nav dropdown-country-option text-theme-front-red",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="outer py-5 bg-front-red">
                    <div className="container">
                        <div className="flex justify-between items-center">
                            <div className="item text-front-small text-white">© 2026 - essentialbali</div>
                            <div className="item flex gap-x-4">
                                <Link to={'#'} target="_blank">
                                    <FacebookIcon />
                                </Link>
                                <Link to={'#'} target="_blank">
                                    <InstagramIcon />
                                </Link>
                                <Link to={'#'} target="_blank">
                                    <LinkedinIcon />
                                </Link>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-y-2 mt-3">
                            <div className="text-front-small text-white">Visitor Count: {visitorCount}</div>
                            <div className="text-front-small text-white md:text-right">Location: {userLocation} | Time: {userTime}</div>
                        </div>
                    </div>
                </div>
            </footer>
        )
    // }
}

export default Footer
