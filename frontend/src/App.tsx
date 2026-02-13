import React, { PropsWithChildren } from "react"
import { TimeProvider } from "./context/TimeContext"
import { TaxonomyProvider } from "./context/TaxonomyContext"
import { RouteProvider } from "./context/RouteContext"
import { ContentProvider } from "./context/ContentContext"
import { HeaderContentProvider } from "./context/HeaderContext"
import { AuthProvider } from "./context/AuthContext"
import { HelmetProvider } from "react-helmet-async";

type MainAppProps = {
  initialData: any
} & PropsWithChildren

const App: React.FC<MainAppProps> = ({children, initialData}) => {
  return (
    // <React.StrictMode>
          <TimeProvider initialData={initialData?.initialTime}>
              <TaxonomyProvider initialData={initialData?.initialTaxonomies}>
                  <RouteProvider initialData={initialData?.initialRoute}>
                      <ContentProvider initialData={initialData?.initialContent}>
                          <HeaderContentProvider initialData={initialData?.initialTemplateContent}>
                              <AuthProvider initialData={initialData?.initialAuth ? initialData.initialAuth[0] : null}>
                                  <HelmetProvider>
                                      {children}
                                  </HelmetProvider>
                              </AuthProvider>
                          </HeaderContentProvider>
                      </ContentProvider>
                  </RouteProvider>
              </TaxonomyProvider>
          </TimeProvider>
    //   </React.StrictMode>
  )
}

// delete window.__INITIAL_DATA__;

export default App