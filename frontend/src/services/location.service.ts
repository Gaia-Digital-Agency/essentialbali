import apiClient from "../api";
import { CreateLocationDto, CreateLocationResponse, EditLocationResponse, GetLocationByIDResponse, GetLocationsResponse } from "../types/location.type";

// export const getLocationById = async (id: number): Promise<GetLocationByIdResponse> => {
//   try {
//     const response = await apiClient.get<GetLocationByIdResponse>(`/locations/${id}`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

export const getAllLocationByType = async (type: string): Promise<GetLocationsResponse> => {
  try {
    const response = await apiClient.get<GetLocationsResponse>(`/location/${type}`);
    return response.data;
  } catch (error) {
    console.error(error)
    throw error;
  }
};

export const createLocation = async (type: string, location: CreateLocationDto): Promise<CreateLocationResponse> => {
  try {
    const response = await apiClient.post<CreateLocationResponse>(`/location/${type}`, location);
    return response.data;
  } catch (error) {
    console.error(error)
    throw error;
  }
};

export const getLocationByID = async (type: string, id: number): Promise<GetLocationByIDResponse> => {
  try {
    const response = await apiClient.get<GetLocationByIDResponse>(`/location/${type}/${id}`);
    const resData = response.data
    resData.data.typeLoc = type;
    return response.data;
  } catch (error) {
    console.error(error)
    throw error;
  }
};

export const editLocation = async (id: number, typeLoc: string, location: CreateLocationDto): Promise<EditLocationResponse> => {
  try {
    const response = await apiClient.put<EditLocationResponse>(`/location/${typeLoc}/${id}`, location);
    return response.data;
  } catch (error) {
    console.error(error)
    throw error;
  }
};


export const deleteLocation = async (id: number, typeLoc: string): Promise<void> => {
  try {
    return await apiClient.delete(`/location/${typeLoc}/${id}`);
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }  
}

export const getLocationsByParentID = async (type: string, id: number): Promise<GetLocationsResponse> => {
  try {
    const response = await apiClient.get<GetLocationsResponse>(`/location/${type}?id_parent=${id}`);
    return response.data;
  } catch (error) {
    console.error(error)
    throw error;
  }
};

type RegionProps = {id: number, slug: string, name: string, id_parent?: number}
type CityProps = {id: number, slug: string, name: string, id_parent?: number, regions: RegionProps[]}
type CountryProps = {id: number, slug: string, name: string, cities: CityProps[]}

export const getAllLocations = async () => {
  try {
    const getCountries = await getAllLocationByType('country')
    const getCities = await getAllLocationByType('city')
    const getRegions = await getAllLocationByType('region')
    if(!getCountries.data || getCountries.status_code != 200) throw Error('Cannot fetch Bali Areas')
    if(!getCities.data || getCities.status_code != 200) throw Error('Cant get City')
    if(!getRegions.data || getRegions.status_code != 200) throw Error('Cant get Region')
  
    if (getCities.data.length && getRegions.data.length && getCountries.data.length) {
        const locationsTemp: CountryProps[] = getCountries.data.map(country => {
            const countryCities: CityProps[] = getCities.data
                .filter(city => city.id_parent === country.id)
                .map(city => {
                    const cityRegions: RegionProps[] = getRegions.data.filter(
                        region => region.id_parent === city.id
                    )
                    return { ...city, regions: cityRegions }
                })
            return { ...country, cities: countryCities }
        })
        return locationsTemp
    }
    throw Error('Unexpected Error')
  } catch (e) {
    console.log(e)
    return false
  }
}
