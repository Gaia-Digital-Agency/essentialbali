import React, {useContext, createContext, useState, PropsWithChildren} from "react"

type ContentContextProps = {
    initialData: any
    setInitialData: (data: any) => void
}

interface ContentProviderProps extends PropsWithChildren {
    initialData: any
}

const ContentContext = createContext<ContentContextProps>({
    initialData: {},
    setInitialData: () => {},
})

export const ContentProvider: React.FC<ContentProviderProps> = ({children, initialData: seed}) => {
    const [initialData, setInitialData] = useState<any>(seed)
    return (
        <ContentContext.Provider value={{initialData, setInitialData}}>
            {children}
        </ContentContext.Provider>
    )
}

export const useContent = () => useContext(ContentContext)
