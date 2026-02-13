import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { getAllLocationByType } from '../services/location.service';
import { getAllCategory } from '../services/category.service';
import { Category } from '../types/category.type';

export type RegionProps = {id: number, slug: string, name: string, id_parent?: number, name_parent?: string, site_logo?: string | null}
export type CityProps = {id: number, slug: string, name: string, id_parent?: number, name_parent?: string, site_logo?: string | null}
export type CountryProps = {id: number, slug: string, name: string, name_parent?: string, site_logo?: string | null}

interface TaxonomyProviderInitialProps extends PropsWithChildren {
  initialData: {
      countries: any,
      cities: any,
      regions: any,
      categories: any
  }
}

type TaxonomyContextProps = {
    taxonomies: TaxonomyProps,
    adminTaxonomies: LocationsProps,
    setAdminTaxonomies: (tax: LocationsProps) => void,
    loading: boolean,
    getCountryById: (id?: number) => CountryProps | undefined,
    getCityById: (id?: number) => CityProps | undefined,
    getRegionById: (id?: number) => RegionProps | undefined,
    getCategoryById: (id?: number) => Category | undefined,
    generateUrlLocations: (id: number, locType: TaxonomyLocations) => string
}

type TaxonomyLocations = "country" | "city" | "region"

export type TaxonomyProps = LocationsProps & {
  categories: Category[] | undefined
}

export type LocationsProps = {
  countries: CountryProps[] | undefined,
  cities: CityProps[] | undefined,
  regions: RegionProps[] | undefined,
}

const fetchData = {
  taxonomies: async () => {
    const getCountry = await getAllLocationByType('country')
    const getCities = await getAllLocationByType('city')
    const getRegions = await getAllLocationByType('region')
    const getCategories = await getAllCategory()
    return {
      countries: getCountry.status_code == 200 ? getCountry.data : undefined,
      cities: getCities.status_code == 200 ? getCities.data : undefined,
      regions: getRegions.status_code == 200 ? getRegions.data : undefined,
      categories: getCategories.data ?? undefined,
    };
  }
};

const TaxonomyContext = createContext<TaxonomyContextProps>(
  {
    taxonomies: {countries: undefined, cities: undefined, regions: undefined, categories: undefined},
    adminTaxonomies: {countries: undefined, cities: undefined, regions: undefined},
    setAdminTaxonomies: () => {},
    loading: true,
    getCategoryById: () => {return undefined},
    getCountryById: () => {return undefined},
    getCityById: () => {return undefined},
    getRegionById: () => {return undefined},
    generateUrlLocations: () => {return ''}
  }
);

export const TaxonomyProvider: React.FC<TaxonomyProviderInitialProps> = ({ children, initialData }) => {
  const hasInitialTaxonomies =
    !!initialData &&
    !!(
      initialData?.countries?.length ||
      initialData?.cities?.length ||
      initialData?.regions?.length ||
      initialData?.categories?.length
    )

  const [taxonomies, setTaxonomies] = useState<TaxonomyProps>(
    hasInitialTaxonomies
      ? initialData
      : { countries: undefined, cities: undefined, regions: undefined, categories: undefined },
  );
  const [adminTaxonomies, setStateAdminTaxonomies] = useState<LocationsProps>({countries: undefined, cities: undefined, regions: undefined})
  const [loading, setLoading] = useState<boolean>(!hasInitialTaxonomies)
  useEffect(() => {
    if (hasInitialTaxonomies) return
    fetchData.taxonomies().then(data => {
      setTaxonomies(data);
      // setStateAdminTaxonomies(data)
      setLoading(false)
    });
  }, [hasInitialTaxonomies]);
  // const taxonomies = initialData
  // const loading = !initialData

  const setAdminTaxonomies = (taxonomy: LocationsProps) => {
    setStateAdminTaxonomies(taxonomy)
  }
  const getRegionById = (id?: number | undefined) => {
    return taxonomies?.regions?.find(reg => (reg.id == id))
  }
  const getCityById = (id?: number | undefined) => {
    return taxonomies?.cities?.find(cit => (cit.id == id))
  }
  const getCountryById = (id?: number | undefined) => {
    return taxonomies?.countries?.find(cou => (cou.id == id))
  }
  const getCategoryById = (id?: number | undefined) => {
    return taxonomies?.categories?.find(cat => (id == cat.id))
  }
  const generateUrlLocations = (id: number, locationType: TaxonomyLocations) => {
    if(!taxonomies.countries || !taxonomies.cities || !taxonomies.regions) return ''
    let url = [] as Array<string|undefined>
    url.push(taxonomies.countries.find(tax => tax.id == id)?.slug)
    if(locationType == 'city' || locationType == 'region') url.push(taxonomies.cities.find(tax => tax.id == id)?.slug)
    if(locationType == 'region') url.push(taxonomies.regions.find(tax => tax.id == id)?.slug)
    return url.join('/')
  }
  return (
      <TaxonomyContext.Provider value={{ taxonomies, adminTaxonomies, setAdminTaxonomies, loading, getCategoryById, getCityById, getCountryById, getRegionById, generateUrlLocations }}>
      {children}
      </TaxonomyContext.Provider>
  );
};

export const useTaxonomies = () => useContext(TaxonomyContext);
