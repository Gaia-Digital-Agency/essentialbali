import React, { useEffect, useState } from "react"
import { getTemplateByUrl } from "../../../services/template.service"
import NotFound from "../../OtherPage/NotFound"

type PageRouteProps = {
    route: string
}

const Page: React.FC<PageRouteProps> = ({route}) => {
    const [content, setContent] = useState<string>()
    const [shouldNotFound, setShouldNotFound] = useState<boolean>(false)

    useEffect(() => {
        (async () => {
            if(!route) {
                setShouldNotFound(true)
                return
            }
            const get = await getTemplateByUrl(route)
            if(get?.status_code == 200 && get?.data?.content) {
                const data = JSON.parse(get.data?.content)
                setContent(data?.content)
            }
        })()
    }, [])

    if(shouldNotFound) {
        return <NotFound />
    }

    return (
        <>
            <section className="py-12">
                <div className="container">
                    {
                        typeof content == 'string' &&
                        <div className="page-container" dangerouslySetInnerHTML={{__html: content}}></div>
                    }
                </div>
            </section>
        </>
    )
}

export default Page