import React, {useContext, createContext, useState, PropsWithChildren} from "react"
import { CountryProps, CityProps, RegionProps } from "./TaxonomyContext"
import { Category } from "../types/category.type"
import { ArticleApiResponseProps } from "../types/article.type"

type RouteContextProps = {
    actualRoute: RouteProps,
    setActualRoute: ({country, city, region, category, article}: RouteProps) => void,
    routeType: string,
    setRouteType: (type: string) => void,
    clientChange: boolean,
    setClientChange: (type: boolean) => void,
    getLocationRouteUrl: () => string,
    generateLocationRouteUrl: ({}: LocationProps) => string
}

type LocationProps = {
    country?: CountryProps | undefined,
    city?: CityProps | undefined,
    region?: RegionProps | undefined,
    category?: Category | undefined
}

export type RouteProps = {
    article?: ArticleApiResponseProps | undefined
} & LocationProps

interface RouteProviderProps extends PropsWithChildren {
    initialData: any
}

const RouteContext = createContext<RouteContextProps>({actualRoute: {country: undefined, city: undefined, region: undefined}, setActualRoute: () => {}, routeType: "", setRouteType: () => {}, clientChange: false, setClientChange: () => {}, getLocationRouteUrl: () => (''), generateLocationRouteUrl: () => ('')})

export const RouteProvider: React.FC<RouteProviderProps> = ({children, initialData}) => {
    const [actualRoute, setStateActualRoute] = useState<RouteProps>(initialData?.listingParams ?? {})
    const [routeType, setStateRouteType] = useState<string>(initialData?.type ?? 'LOADING')
    // Set to true by default since SSR is disabled - allows components to fetch content on initial load
    const [clientChange, setStateClientChange] = useState<boolean>(false)
    const setActualRoute = (params: RouteProps) => {
        setStateActualRoute(prev => ({...prev, ...params}));
        // setClientChange(true)
    }
    const setRouteType = (type: string) => {
        setStateRouteType(type)
        // setClientChange(true)
    }
    const setClientChange = (val: boolean) => {
        setStateClientChange(val)
    }

    const getLocationRouteUrl = () => {
        return `${actualRoute.country ? `/${actualRoute.country.slug}` : ''}${actualRoute.city ? `/${actualRoute.city.slug}` : ''}${actualRoute.region ? `/${actualRoute.region.slug}` : ''}`
    }
    const generateLocationRouteUrl = ({country, city, region, category}: LocationProps) => {
        let res = [];
        if(country) res.push(country.slug);
        if(city) res.push(city.slug);
        if(region) res.push(region.slug);
        if(category)res.push(category.slug_title)
        return '/' + res.join('/')
    }
    return (
        <RouteContext.Provider value={{actualRoute, setActualRoute, routeType, setRouteType, clientChange, setClientChange, getLocationRouteUrl, generateLocationRouteUrl}}>
            {children}
        </RouteContext.Provider>
    )
}

export const useRoute = () => useContext(RouteContext)