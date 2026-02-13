import React, {useEffect, useState} from "react"
import { Link, useNavigate } from "react-router"
import Button from "../../../components/ui/button/Button"
import { useAuth } from "../../../context/AuthContext"
import { useTaxonomies } from "../../../context/TaxonomyContext"

type CountryProps = {
    id: number,
    name: string,
    slug: string,
}

const MstArticle: React.FC = () => {
    const [countries, setCountries] = useState<CountryProps[]>([])
    const {userDetails} = useAuth()
    const {adminTaxonomies} = useTaxonomies()
    const navigate = useNavigate()
    if(userDetails?.id_country && userDetails.user_level !== 'super_admin') {
        navigate(`/admin/mst_article/${userDetails?.id_country}`)
    }

    useEffect(() => {
        (async () => {
            // const res = await getAllLocationByType('country')
            // console.log(res)
            // if(res.status_code == 200 && res.data) {
            //     setCountries(res.data)
            // }
            if(adminTaxonomies.countries) {
                setCountries(adminTaxonomies.countries.map(coun => ({id: coun.id, name: coun.name, slug: coun.slug})))
            }
        })()
    }, [adminTaxonomies])
    if(countries) {
        return (
            <div className="grid grid-cols-12 gap-8">
                {countries.map(country => (
                    <div className="col-span-4" key={country.slug}>
                        <Button className="w-full">
                            <Link to={`${country.id}`} className="w-full">{country.name}</Link>
                        </Button>
                    </div>
                ))}
            </div>
        )

    } else {
        return (
            <></>
        )
    }
}

export default MstArticle