import React from "react"
import { useRoute } from "../../context/RouteContext"
import SelectNav from "./SelectNav"
import { useNavigate } from "react-router"
import { useTaxonomies } from "../../context/TaxonomyContext"


const DropDownCity: React.FC = () => {
    const {actualRoute, generateLocationRouteUrl} = useRoute()
    const {taxonomies} = useTaxonomies()
    const navigate = useNavigate()

    const options = taxonomies.cities?.filter(city => (city.id_parent == actualRoute?.country?.id)).map(city => ({value: city.slug, label: city.name}))

    const changeHandler = (val: string) => {
        const city = taxonomies?.cities?.find(coun => (coun.slug == val))
        if(city) {
            navigate(generateLocationRouteUrl({...actualRoute, city}))
            return
        }
        navigate(`/${actualRoute.country?.slug || ''}`)
        return
    }
    if(actualRoute.country && options?.length) {
        return (
            <>
            {
                <div className="dropdown-country-wrapper">
                    <SelectNav 
                        onChange={changeHandler}
                        options={options || []}
                        defaultLabel={'Explore City'}
                        value={actualRoute.city?.slug || undefined}
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
}

export default DropDownCity