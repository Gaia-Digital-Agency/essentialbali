// import React, {useContext, createContext, PropsWithChildren} from "react"
// import Script

// type TrackingContextProps = {
//     pushDataLayer: any
// }


// const TrackingContext = createContext<TrackingContextProps>({pushDataLayer: {}})

// export const ContentProvider: React.FC<PropsWithChildren> = ({children}) => {
//     const pushDataLayer = () => {

//     }
//     return (
//         <TrackingContext.Provider value={{pushDataLayer}}>
//             {children}

//         </TrackingContext.Provider>
//     )
// }

// export const useTracking = () => useContext(TrackingContext)