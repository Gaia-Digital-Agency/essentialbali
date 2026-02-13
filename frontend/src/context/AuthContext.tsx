import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { User } from '../types/auth.type'
import { getDataDetailUser } from "../services/auth.service";
import { useRoute } from './RouteContext';

export type UserDetailsProps = User | null | undefined

type AuthContextProps = {
    userDetails?: UserDetailsProps,
    setUserDetails: (userDetails: UserDetailsProps) => void
}

const AuthContext = createContext<AuthContextProps>({userDetails: null, setUserDetails: (userDetails: UserDetailsProps) => {if(userDetails) return}})

type AuthProviderProps = {
    initialData?: any
} & PropsWithChildren

export const AuthProvider: React.FC<AuthProviderProps> = ({children, initialData}) => {
    const [userDetails, setStateUserDetails] = useState<UserDetailsProps>(initialData ?? undefined)
    const {clientChange} = useRoute()
    const setUserDetails = (userDetail: UserDetailsProps) => {
        setStateUserDetails(userDetail)
    }
    useEffect(() => {
        if(initialData || !clientChange) return;
        (async () => {

            const getUser = await getDataDetailUser()
            if(getUser) {
                if(getUser?.data && getUser?.status_code == 200) {
                    setUserDetails(getUser.data[0])
                } else {
                    setUserDetails(undefined)
                }
            } else {
                setUserDetails(undefined)
            }
        })()
    }, [])
    return (
        <AuthContext.Provider value={{userDetails, setUserDetails}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)