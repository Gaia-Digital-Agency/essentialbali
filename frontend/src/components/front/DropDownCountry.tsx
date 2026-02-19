import React from "react"
import { useRoute } from "../../context/RouteContext"
import SelectNav from "./SelectNav"
import { useNavigate } from "react-router"
import { useTaxonomies } from "../../context/TaxonomyContext"
import { BALI_AREA_OPTIONS, isBaliAreaSlug } from "../../utils/baliAreas"

const DropDownCountry: React.FC = () => {
  const { actualRoute } = useRoute()
  const { taxonomies } = useTaxonomies()
  const navigate = useNavigate()

  // console.log(taxonomies, 'taxonomies')
  const changeHandler = (val: string) => {
    const area = taxonomies?.countries?.find((country) => country.slug == val)
    if (area) {
      navigate(`/${area.slug}`)
      return
    }
    if (val) {
      navigate(`/${val}`)
      return
    }
    navigate("/")
  }

  const taxonomyOptions = (taxonomies.countries ?? [])
    .filter((country) => country.id !== 999 && isBaliAreaSlug(country.slug))
    .map((country) => ({ value: country.slug, label: country.name }))
  const options =
    taxonomyOptions.length > 0
      ? taxonomyOptions
      : BALI_AREA_OPTIONS.map((area) => ({ value: area.slug, label: area.name }))
  return (
    <div className="dropdown-country-wrapper">
      <SelectNav
        onChange={changeHandler}
        options={options}
        // options={[{ value: 'test', label: "test" }]}
        defaultLabel={"All Areas"}
        value={actualRoute.country?.slug || undefined}
        classNames={{
          singleValue: "dropdown-country-nav dropdown-country-input ",
          option: "dropdown-country-nav dropdown-country-option",
        }}
      ></SelectNav>
    </div>
  )
}

export default DropDownCountry
