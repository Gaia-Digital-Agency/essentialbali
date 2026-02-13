import React, { useEffect, useState } from "react"
import SelectNav from "./SelectNav"
import { useNavigate, Link } from "react-router"
import { CountryProps, useTaxonomies } from "../../context/TaxonomyContext"
import { useRoute } from "../../context/RouteContext"
import { CityProps, RegionProps } from "../../context/TaxonomyContext"
import { isBaliAreaSlug } from "../../utils/baliAreas"

const NavLocation: React.FC = () => {
  const [cities, setCities] = useState<CityProps[]>()
  const [regions, setRegions] = useState<RegionProps[]>()
  const { actualRoute } = useRoute()
  const { taxonomies } = useTaxonomies()
  const filteredCountries = { ...taxonomies }.countries?.filter((country) => country.id !== 999 && isBaliAreaSlug(country.slug))
  const filteredTax = { ...taxonomies, countries: filteredCountries }
  const navigate = useNavigate()

  useEffect(() => {
    const currentCountry = actualRoute.country
    if (currentCountry) {
      setCities(filteredTax?.cities?.filter((city) => city.id_parent == currentCountry.id))
    }
    const currentCity = actualRoute.city
    if (currentCity) {
      setRegions(filteredTax?.regions?.filter((region) => region.id_parent == currentCity.id))
    }
  }, [actualRoute])

  const changeCountryHandler = (country: string | number) => {
    if (country == "") {
      navigate(`${actualRoute?.category ? `/${actualRoute?.category?.slug_title}` : "/"}`)
      return
    }
    navigate(`/${country}${actualRoute?.category ? `/${actualRoute?.category?.slug_title}` : ""}`)
  }

  const changeCityHandler = (city: string | number) => {
    if (city == "") {
      navigate(`/${actualRoute?.country?.slug}${actualRoute?.category ? `/${actualRoute?.category?.slug_title}` : ""}`)
      return
    }
    navigate(`/${actualRoute?.country?.slug}/${city}${actualRoute?.category ? `/${actualRoute?.category?.slug_title}` : ""}`)
  }

  const changeRegionHandler = (region: string | number) => {
    if (region == "") {
      navigate(`/${actualRoute?.country?.slug}/${actualRoute?.city?.slug}/${actualRoute?.category ? `/${actualRoute?.category?.slug_title}` : ""}`)
      return
    }
    navigate(
      `/${actualRoute?.country?.slug}/${actualRoute?.city?.slug}/${region}${actualRoute?.category ? `/${actualRoute?.category?.slug_title}` : ""}`,
    )
  }

  const getCountryUrl = (country: CountryProps) => {
    return `/${country.slug}${actualRoute?.category ? `/${actualRoute.category.slug_title}` : ""}`
  }

  if (actualRoute.country) {
    return (
      <div className="flex flex-col md:flex-row gap-y-2 md:gap-y-0 md:gap-x-3">
        <div className="md:w-[250px] w-full">
          <SelectNav
            classNames={{ singleValue: "uppercase" }}
            defaultLabel={"All Bali Areas"}
            onChange={changeCountryHandler}
            value={actualRoute?.country ? actualRoute.country.slug : undefined}
            options={
              filteredTax?.countries?.map((country) => {
                return { value: country.slug, label: country.name }
              }) ?? []
            }
          />
        </div>
        {!!(cities && actualRoute.country && cities.length) && (
          <div className="md:w-[250px] w-full">
            <SelectNav
              classNames={{ singleValue: "uppercase" }}
              defaultLabel={"Explore City"}
              onChange={changeCityHandler}
              value={actualRoute.city ? actualRoute.city.slug : undefined}
              options={cities.map((city) => {
                return { value: city.slug, label: city.name }
              })}
            />
          </div>
        )}
        {!!(regions && actualRoute.city && regions.length) && (
          <div className="md:w-[250px] w-full">
            <SelectNav
              classNames={{ singleValue: "uppercase" }}
              defaultLabel={"Explore Sub Area"}
              onChange={changeRegionHandler}
              value={actualRoute.region ? actualRoute.region.slug : undefined}
              options={regions.map((region) => {
                return { value: region.slug, label: region.name }
              })}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-full">
      <p className="font-serif text-front-subtitle-big font-bold mb-3">EXPLORE BALI AREAS</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filteredTax.countries?.map((country) => (
          <div className="country uppercase text-center items-center" key={`navlocation-explore-${country.id}`}>
            <Link
              className="text-front-body border-[1px] border-front-red flex justify-center items-center h-10 w-full transition text-front-red bg-white hover:text-white hover:bg-front-red"
              to={getCountryUrl(country)}
            >
              {country.name}
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NavLocation
