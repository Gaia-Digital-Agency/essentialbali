import { PassThrough } from 'stream'
import { renderToPipeableStream } from 'react-dom/server'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { TaxonomyProvider } from './context/TaxonomyContext'
import { ContentProvider } from './context/ContentContext'
import { RouteProvider } from './context/RouteContext'
import { adminRoutes } from './routes/AdminApp'
// import { HelmetProvider } from 'react-helmet-async'
import pkg from './lib/utils/Helmet'
const {HelmetProvider} = pkg
import type { ArticleProps } from './types/article.type'
import { HeaderContentProvider } from './context/HeaderContext'
import { AuthProvider } from './context/AuthContext'
import { TimeProvider } from './context/TimeContext'

type InitialDataProps = {
    initialTaxonomies: TaxonomiesProps
    initialRoute: any
    initialContent: ArticleProps[],
    initialTemplateContent: any,
    initialAuth: any,
    initialTime: string
}

type TaxonomiesProps = {
    countries: any
    cities: any
    regions: any
    categories: any
}

export function render(url: string, initialData: InitialDataProps) {
    const memoryRouter = createMemoryRouter(adminRoutes, {
        initialEntries: [url],
    })

    // const router = createStaticRouter(routes)

    const { initialTaxonomies, initialRoute, initialContent, initialTemplateContent, initialAuth, initialTime } = initialData
    const helmetContext: { helmet?: any } = {}

    return new Promise<{ appHtml: string; helmet: any }>((resolve, reject) => {
        const stream = new PassThrough()
        let html = ''
        let didError = false

        const { pipe } = renderToPipeableStream(
            <TimeProvider initialData={initialTime}>
                <TaxonomyProvider initialData={initialTaxonomies}>
                    <RouteProvider initialData={initialRoute}>
                        <ContentProvider initialData={initialContent}>
                            <HeaderContentProvider initialData={initialTemplateContent}>
                                <AuthProvider initialData={initialAuth}>
                                    <HelmetProvider context={helmetContext}>
                                        <RouterProvider router={memoryRouter} />
                                    </HelmetProvider>
                                </AuthProvider>
                            </HeaderContentProvider>
                        </ContentProvider>
                    </RouteProvider>
                </TaxonomyProvider>
            </TimeProvider>,
            {
                onAllReady() {
                    // Collect stream chunks into full HTML string
                    stream.on('data', (chunk) => {
                        html += chunk.toString()
                    })

                    stream.on('end', () => {
                        const { helmet } = helmetContext
                        const emptyHelmet = { title: '', meta: '', link: '' }
                        resolve({
                            appHtml: html,
                            helmet: helmet || emptyHelmet,
                        })
                    })

                    pipe(stream)
                },
                onError(err) {
                    didError = true
                    reject(err)
                },
            }
        )

        // Timeout fallback (avoid hanging)
        setTimeout(() => {
            if (didError) reject(new Error('SSR stream timeout'))
        }, 10000)
    })
}