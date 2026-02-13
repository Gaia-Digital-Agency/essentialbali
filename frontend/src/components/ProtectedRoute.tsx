import React, { PropsWithChildren, useEffect, useState } from "react";
import { getDataDetailUser } from "../services/auth.service";
import { useNavigate, useParams } from "react-router";
import { CountryProps, useTaxonomies } from "../context/TaxonomyContext";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import { UserLevelProps } from "../types/auth.type";


type ProtectedRouteProps = PropsWithChildren & {
  allowedUserLevel?: Array<UserLevelProps>
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedUserLevel = ['super_admin', 'admin_country', 'admin_city'] }) => {
  // const [userDetails, setUserDetails] = useState<any>(null)
  const {userDetails, setUserDetails} = useAuth()
  const {setAdminTaxonomies, taxonomies} = useTaxonomies()
  const [forbiddenLevel, setForbiddenLevel] = useState<boolean>(false)
  const {setNotification} = useNotification()
  const navigate = useNavigate()
  const getUser = async () => {
    const user = await getDataDetailUser()
    if(user) {
      if(user.status_code == 200 && user.data.length) {
        setUserDetails(user.data[0])
        return true
      } else {
        setUserDetails(undefined)
        return false
      }
    } else {
      setUserDetails(undefined)
      return false
    }
  }
  const determineTaxonomy = () => {
    if(!taxonomies) return
    const USER_COUNTRY_ID = userDetails?.id_country ?? 1
    const USER_CITY_ID = userDetails?.id_city ?? 1
    const USER_REGION_ID = userDetails?.id_region ?? 1
    const prev = taxonomies
    if(userDetails?.user_level == 'super_admin') {
      setAdminTaxonomies(taxonomies)
      return
    } else if(userDetails?.user_level == 'admin_country') {
      const newCountry = prev.countries?.filter((coun: CountryProps) => (coun.id == USER_COUNTRY_ID))
      const newCity = prev.cities?.filter((cit) => (cit.id_parent == USER_COUNTRY_ID))
      const newRegion = prev.regions?.filter(reg => {
        return newCity?.find(cit => (cit.id == reg.id_parent))
      })
      setAdminTaxonomies({countries: newCountry, cities: newCity, regions: newRegion})
    } else if(userDetails?.user_level == 'admin_city') {
      const newCountry = prev.countries?.filter((coun: CountryProps) => (coun.id == USER_COUNTRY_ID))
      const newCity = prev.cities?.filter((cit) => (cit.id == USER_CITY_ID))
      const newRegion = prev.regions?.filter(reg => (reg.id_parent == USER_CITY_ID))
      setAdminTaxonomies({countries: newCountry, cities: newCity, regions: newRegion})
    } else if (userDetails?.user_level == 'admin_region') {
      const newCountry = prev.countries?.filter((coun: CountryProps) => (coun.id == USER_COUNTRY_ID))
      const newCity = prev.cities?.filter((cit) => (cit.id == USER_CITY_ID))
      const newRegion = prev.regions?.filter(reg => (reg.id == USER_REGION_ID))
      setAdminTaxonomies({countries: newCountry, cities: newCity, regions: newRegion})
    }
  }

  useEffect(() => {
    if(!forbiddenLevel) return
    setNotification({message: 'You are not allowed to access the page', type: 'fail'})
    navigate('/admin')
    setForbiddenLevel(false)
  }, [forbiddenLevel])
  const params = useParams()
  useEffect(() => {
    // if(loading) return
    (async () => {
      const user = await getUser()
      if(!user) {
        navigate('/signin')
      }
    })()
  }, [params])

  useEffect(() => {
    if(userDetails) {
      determineTaxonomy()
    }
  }, [userDetails])
  // getUser()
  if(userDetails === null) {
    return <></>
  } else {
    if(userDetails === undefined) {
      navigate('/signin')
      return <></>
    }
    if(userDetails && typeof userDetails.user_level == 'string') {
      if(allowedUserLevel.includes(userDetails.user_level)) {
        return <>{children}</>
      } else {
        setForbiddenLevel(true)
        return <></>
      }
    }
  }
}


export default ProtectedRoute