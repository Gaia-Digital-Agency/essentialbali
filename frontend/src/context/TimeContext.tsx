import React, {useContext, createContext, PropsWithChildren} from "react"

type TimeContextProps = {
    initialData: string | null
}


interface ContentProviderProps extends PropsWithChildren {
    initialData: string
}

const TimeContext = createContext<TimeContextProps>({initialData: null})

export const TimeProvider: React.FC<ContentProviderProps> = ({children, initialData}) => {
    return (
        <TimeContext.Provider value={{initialData}}>
            {children}
        </TimeContext.Provider>
    )
}

export const useTime = () => useContext(TimeContext)