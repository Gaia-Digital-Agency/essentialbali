import React, {useState, useEffect} from "react"
import { Outlet } from "react-router"
import { useTaxonomies } from "../context/TaxonomyContext"

export type RegionProps = {id: number, slug: string, name: string, id_parent?: number}
export type CityProps = {id: number, slug: string, name: string, id_parent?: number, regions?: RegionProps[]}
export type CountryProps = {id: number, slug: string, name: string, cities?: CityProps[]}

const TemplateLayout: React.FC = () => {

    const [locations, setLocations] = useState<CountryProps[]>([])
    const {adminTaxonomies} = useTaxonomies()
    useEffect(() => {
        if(!adminTaxonomies.countries || !adminTaxonomies.cities || !adminTaxonomies.regions) return
        const newCity = adminTaxonomies.cities.map(cit => {
            return {...cit, regions: adminTaxonomies.regions?.filter(reg => (reg.id_parent == cit.id))}
        })
        const newCountry = adminTaxonomies.countries.map(coun => {
            const city = newCity?.filter(cit => (cit.id_parent == coun.id))
            return {...coun, cities: city}
        })
        setLocations(newCountry)
        // temp = {...adminTaxonomies?.countries}
    }, [adminTaxonomies])

    return (
        <>
            <Outlet context={{locations}} />
        </>
    )
}
export default TemplateLayout