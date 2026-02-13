import React from "react"
import { useRoute } from "../../context/RouteContext"
import SelectNav from "./SelectNav"
import { useNavigate } from "react-router"
import { useTaxonomies } from "../../context/TaxonomyContext"


const DropDownRegion: React.FC = () => {
    const {actualRoute, generateLocationRouteUrl} = useRoute()
    const {taxonomies} = useTaxonomies()
    const navigate = useNavigate()

    const options = taxonomies.regions?.filter(city => (city.id_parent == actualRoute?.city?.id)).map(city => ({value: city.slug, label: city.name}))

    const changeHandler = (val: string) => {
        const region = taxonomies?.regions?.find(coun => (coun.slug == val))
        if(region) {
            navigate(generateLocationRouteUrl({...actualRoute, region}))
            // navigate(`/${actualRoute.country?.slug}/${actualRoute.city?.slug}/${}`)
            return
        }
        navigate(generateLocationRouteUrl(actualRoute))
        return
    }
    return (
        <>
        {
        actualRoute.country && actualRoute.city && options &&
            <div className="dropdown-country-wrapper">
                <SelectNav 
                    onChange={changeHandler}
                    options={options || []}
                    defaultLabel={'Choose Region'}
                    value={actualRoute.region?.slug || undefined}
                    classNames={{
                        singleValue: "dropdown-country-nav dropdown-country-input text-theme-front-red md:w-[260px] w-[190px]",
                        option: "dropdown-country-nav dropdown-country-option text-theme-front-red"
                    }}
                >
                </SelectNav>
            </div>
        
        }
        </>
    )
}

export default DropDownRegion