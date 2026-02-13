import React, {useContext, createContext, PropsWithChildren} from "react"

type ContentContextProps = {
    initialData: any
}


interface ContentProviderProps extends PropsWithChildren {
    initialData: any
}

const ContentContext = createContext<ContentContextProps>({initialData: {}})

export const ContentProvider: React.FC<ContentProviderProps> = ({children, initialData}) => {
    return (
        <ContentContext.Provider value={{initialData}}>
            {children}
        </ContentContext.Provider>
    )
}

export const useContent = () => useContext(ContentContext)