import locationService from "../services/location.service.js";


export const fetchLocationsData = async () => {
  try {
    let vaData = [];

    // mapping handler
    const handler = {
      country: () => locationService.getCountry(),
      city: () => locationService.getCity(id_parent),
      region: () => locationService.getRegion(id_parent),
    };
    const countryRes = await locationService.getCountry()
    const cityRes = await locationService.getCity()
    const regionRes = await locationService.getRegion()
    
    return {country: countryRes, city: cityRes, region: regionRes}
    // return response(res, 200, vaData);
  } catch (error) {
    console.log(error)
    // errResponse(error, res);
  }
}