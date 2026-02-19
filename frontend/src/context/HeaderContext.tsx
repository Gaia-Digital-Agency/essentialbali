import React, {useContext, createContext, PropsWithChildren} from "react"

type ContentContextProps = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData: any
}


interface ContentProviderProps extends PropsWithChildren {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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