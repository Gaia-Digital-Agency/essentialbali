import React, { useState, useEffect } from "react"
import { getTemplateByUrl } from "../../services/template.service"
import Skeleton from "react-loading-skeleton"
import Image from "./Image"
import { useHeaderContent } from "../../context/HeaderContext"

// Brand logo lives in `/public/logo.png`.
const BRAND_LOGO_PATH = "/logo.png"

export type AboutContentProps = {
    title: string,
    description: string,
    link: string,
    image: {
        url?: string,
        alt?: string | null
    }
}

const About: React.FC = () => {
    const {initialData} = useHeaderContent()
    const [content, setContent] = useState<AboutContentProps | undefined>(initialData?.about)

    // Fetch about template if not provided by SSR
    useEffect(() => {
        if (!content) {
            (async () => {
                try {
                    const getTemplate = await getTemplateByUrl('/about')
                    if(getTemplate?.status_code == 200 && getTemplate.data?.content) {
                        setContent(JSON.parse(getTemplate.data.content))
                    }
                } catch(e) {
                    console.log('Error fetching about template:', e)
                }
            })()
        }
    }, [])

    return (
        <>
        <div className="container pb-16 mb-12 border-b border-[#5F5F5F]">
            <div className="grid grid-cols-12 md:gap-x-10 gap-y-10 items-center">
                <div className="md:col-span-6 col-span-12 md:order-1 order-2">
                    <div className="title-wrapper mb-3">
                        <p className="font-serif font-semibold text-front-section-title">{content?.title ?? <Skeleton />}</p>
                    </div>
                    <div className="description-wrapper">
                        <p className="text-front-body-big">{content?.description ?? <Skeleton />}</p>
                    </div>
                </div>
                <div className="md:col-span-6 col-span-12 md:order-2 order-1">
                    <div className="image-wrapper">
                        <Image
                          url={BRAND_LOGO_PATH}
                          alt={content?.image?.alt ?? "essentialbali"}
                          fit="contain"
                          noRatio
                        />
                    </div>
                </div>
            </div>
        </div>

        </>
    )
}

export default About
