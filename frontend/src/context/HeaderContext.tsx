import React, {useContext, createContext, PropsWithChildren} from "react"

type ContentContextProps = {
    initialData: any
}


interface ContentProviderProps extends PropsWithChildren {
    initialData: any
}

const HeaderContentContext = createContext<ContentContextProps>({initialData: {}})

export const HeaderContentProvider: React.FC<ContentProviderProps> = ({children, initialData}) => {
    return (
        <HeaderContentContext.Provider value={{initialData}}>
            {children}
        </HeaderContentContext.Provider>
    )
}

export const useHeaderContent = () => useContext(HeaderContentContext)