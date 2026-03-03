import React, { useEffect, useState, lazy, Suspense } from "react"
import { CountryProps, CityProps, RegionProps, TaxonomyProps, useTaxonomies } from "../../context/TaxonomyContext"
import { Category } from "../../types/category.type"
const HomeTemplate = lazy(() => import('./Templates/Home'))
const Single = lazy(() => import('./Templates/Single'))
const Deals = lazy(() => import('./Templates/Deals'))
const JobListing = lazy(() => import("./Templates/JobListing"))
const Directory = lazy(() => import('./Templates/Directory'))
const Events = lazy(() => import('./Templates/EventsV3'))
// const Events = lazy(() => import('./Templates/Events'))
const SingleJob = lazy(() => import('./Templates/SingleJob'))
const SingleEvent = lazy(() => import('./Templates/SingleEvent'))
const NotFound = lazy(() => import('../OtherPage/NotFound'))
const Housing = lazy(() => import('./Templates/Housing'))
const Search = lazy(() => import('./Templates/Search'))
const LocalBali = lazy(() => import('./Templates/LocalBali'))
import { useRoute } from "../../context/RouteContext"
import { useParams } from "react-router"
import { getArticleBySlug } from "../../services/article.service"
import { useAuth, UserDetailsProps } from "../../context/AuthContext"
import { BALI_AREA_OPTIONS } from "../../utils/baliAreas"

export type ParamsProps = {
    country: CountryProps | undefined
    city: CityProps | undefined
    region: RegionProps | undefined
    category: Category | undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    article?: any
}

// Disabled Bali redirect - now behaves like other countries
// const checkLegacyRedirect = (p: ParamsProps, userDetails: UserDetailsProps) => {
//     if (p.country?.slug === "indonesia") {
//         console.log(userDetails, 'from check indo')
//         if(userDetails) return;
//         window.location.replace("https://essentialbali.com")
//     }
// }

const parseParams = (slugs: string[], tax: TaxonomyProps) => {
    const p = { country: undefined, city: undefined, region: undefined, category: undefined } as ParamsProps
    const fallbackCountryBySlug = (slug: string) => {
        const index = BALI_AREA_OPTIONS.findIndex((area) => area.slug === slug)
        if (index === -1) return undefined
        return { id: index + 1, slug: BALI_AREA_OPTIONS[index].slug, name: BALI_AREA_OPTIONS[index].name } as CountryProps
    }
    slugs.forEach(s => {
        const c = tax.countries?.find(x => x.slug == s)
        const ct = tax.cities?.find(x => x.slug == s)
        const r = tax.regions?.find(x => x.slug == s)
        const cat = tax.categories?.find((x: Category) => x.slug_title == s)
        const fallbackCountry = fallbackCountryBySlug(s)
        if (c) p.country = c
        else if (fallbackCountry) p.country = fallbackCountry
        else if (ct) p.city = ct
        else if (r) p.region = r
        else if (cat) p.category = cat
    })
    return p
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resolveRoute = async (path: string, tax: TaxonomyProps, _userDetails: UserDetailsProps) => {
    const slugs = path ? path.split("/").filter(Boolean) : []
    if (slugs.length === 0) {
        return { type: "HOME", listingParams: { country: undefined, city: undefined, region: undefined, category: undefined } }
    }

    const last = slugs[slugs.length - 1]
    const art = await getArticleBySlug(last)
    if (art) {
        const cat = tax.categories?.find((x: Category) => x.id == art.category_id)
        const listing = parseParams(slugs.slice(0, -1), tax)
        // checkLegacyRedirect(listing, userDetails)
        if (cat?.slug_title === "job-listing") {
            return { type: "ARTICLE_JOB", listingParams: { ...listing, article: art }, articleSlug: last }
        }
        if (cat?.slug_title === "events") {
            return { type: "ARTICLE_EVENT", listingParams: { ...listing, article: art }, articleSlug: last }
        }
        return { type: "ARTICLE_PAGE", listingParams: { ...listing, article: art }, articleSlug: last }
    }

    const listing = parseParams(slugs, tax)
    // checkLegacyRedirect(listing, userDetails)
    const lp = { ...listing, article: undefined }

    if (last === "trending") return { type: "LISTING_TRENDINGS", listingParams: lp }
    if (last === "overseas" || last === "area-highlights") return { type: "LISTING_OVERSEAS", listingParams: lp }
    if (last === "search") return { type: "LISTING_SEARCH", listingParams: lp }
    if (listing.category?.slug_title === "events") return { type: "LISTING_EVENTS", listingParams: lp }
    if (listing.category?.slug_title === "job-listing") return { type: "LISTING_JOBS", listingParams: lp }
    if (listing.category?.slug_title === "deals") return { type: "LISTING_DEALS", listingParams: lp }
    if (listing.category?.slug_title === "housing") return { type: "LISTING_HOUSING", listingParams: lp }
    if (listing.category) return { type: "LISTING_CATEGORIES", listingParams: lp }
    if (!listing.country && !listing.city && !listing.region && !listing.category) return { type: "NOT_FOUND", listingParams: lp }

    return { type: "LISTING_HOME", listingParams: lp }
}

const PathResolver: React.FC = () => {
    const { routeType, setRouteType, setActualRoute, actualRoute, setClientChange, clientChange } = useRoute()
    const [renderState, setRenderState] = useState({ type: routeType, listingParams: actualRoute })
    const params = useParams()
    const path = params["*"]
    const { taxonomies } = useTaxonomies()
    const {userDetails} = useAuth()

    useEffect(() => {
        setClientChange(true)
    }, [path])

    useEffect(() => {
        ;(async () => {
          const r = await resolveRoute(path ?? "", taxonomies, userDetails)
            setRenderState(r)
            setRouteType(r.type)
            setActualRoute(r.listingParams)
        })()
    }, [path, taxonomies, userDetails, clientChange])

    switch (routeType) {
        case "ARTICLE_JOB":
            return <Suspense fallback={<></>}><JobListing key="single-job"><SingleJob /></JobListing></Suspense>
        case "ARTICLE_EVENT":
            return <Suspense fallback={<></>}><SingleEvent key="single-event" /></Suspense>
        case "ARTICLE_PAGE":
            return <Suspense fallback={<></>}><Single key="single-article" /></Suspense>
        case "LISTING_JOBS":
            return <Suspense fallback={<></>}><JobListing key="job-listing" /></Suspense>
        case "LISTING_SEARCH":
            return <Suspense fallback={<></>}><Search key="search" /></Suspense>
        case "LISTING_TRENDINGS":
            return <Suspense fallback={<></>}><Directory key="trending" isTrending /></Suspense>
        case "LISTING_OVERSEAS":
            return <Suspense fallback={<></>}><LocalBali key="local-bali" /></Suspense>
        case "LISTING_EVENTS":
            return <Suspense fallback={<></>}><Events key="events" /></Suspense>
        case "LISTING_DEALS":
            return <Suspense fallback={<></>}><Deals key="deals" /></Suspense>
        case "LISTING_CATEGORIES":
            return <Suspense fallback={<></>}><Directory key={`cat-${renderState.listingParams.category?.slug_title}`} /></Suspense>
        case "LISTING_HOUSING":
            return <Suspense fallback={<></>}><Housing key="housing" /></Suspense>
        case "LISTING_HOME":
        case "HOME":
            return <Suspense fallback={<></>}><HomeTemplate key="home" /></Suspense>
        case "LOADING":
            return null
        default:
            return <Suspense fallback={<></>}><NotFound /></Suspense>
    }
}

export default PathResolver
