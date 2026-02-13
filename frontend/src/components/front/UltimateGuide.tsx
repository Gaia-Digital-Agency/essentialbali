import React, {useEffect, useState} from "react"
import {Swiper, SwiperSlide} from "swiper/react"
import Button from "./Button"
import Image from "./Image"
import TextLink from "./TextLink"
import { Pagination, Navigation } from "swiper/modules"
import "../../../node_modules/swiper/modules/navigation.css";
import { useRoute } from "../../context/RouteContext"
import { useTaxonomies } from "../../context/TaxonomyContext"
import useArticle from "../../hooks/useArticle"
import { ComponentTemplateHomeProps, PreContentProps } from "../../types/template.type"
import { Spacer } from "../../pages/Front/Templates/Home"

const UltimateGuide: React.FC<ComponentTemplateHomeProps> = ({preContent}) => {
    const {actualRoute, clientChange} = useRoute()
    const {taxonomies} = useTaxonomies()
    // const {availableCategories} = useOutletContext<AvailableCategoriesProps>()
    // const {locations} = useOutletContext<LocationsContextProps>()
    const [content, setContent] = useState<PreContentProps>(preContent)
    const {generateContent, getPermalink, getFeaturedImageUrl} = useArticle()
    const CATEGORY_SLUG = "ultimate-guide"

    const theCategory = () => {
        return taxonomies?.categories?.find((cat) => (cat.slug_title == CATEGORY_SLUG))
    }
    useEffect(() => {
        (async () => {
            try {
                const get = await generateContent({
                    content: preContent,
                    query: {
                        id_country: actualRoute?.country?.id,
                        id_city: actualRoute?.city?.id,
                        id_region: actualRoute?.region?.id,
                        category: theCategory()?.id,
                        limit: 6
                    }
                })
                if(get) {
                    setContent(get)
                }
            } catch (e) {
                console.log(e)
            }
        })()
    }, [actualRoute, clientChange])

    return (
        <>
        {
            content &&
            !!content.filter(Boolean).length &&
            <>
            <Spacer />
            <section id="ultimate-guide">
                <div className="md:container px-0 md:px-7">
                    <div className="title-wrapper text-center mb-8">
                        <p className="font-serif font-semibold text-front-section-title text-front-grey">Latest Ultimate Guides</p>
                    </div>
                    <div className="slider-wrapper pb-8 mb-8 relative">
                        <div className="swiper-pagination"></div>
                        <Swiper
                            slidesPerView={1}
                            // autoHeight={true}
                            modules={[Pagination, Navigation]}
                            pagination={{
                                el: "#ultimate-guide .swiper-pagination",
                                enabled: true,
                                clickable: true
                            }}
                            navigation={{
                                nextEl: '#ultimate-guide .next-button',
                                prevEl: '#ultimate-guide .prev-button',
                                enabled: true
                            }}
                            breakpoints={{
                                1024: {
                                    // autoHeight: auyoH
                                }
                            }}
                            >
                            {content?.map((article, i) => {
                                if(article) {
                                    return (
                                        <SwiperSlide key={`ultimate-guide-${i}`}>
                                            <div className="inner">
                                                <div className="grid grid-cols-12">
                                                    <div className="lg:col-span-6 col-span-12 h-full lg:order-1 order-2">
                                                        <div className="flex flex-col h-full justify-center items-center bg-[#000] md:px-14 py-10 lg:py-0">
                                                            <div className="category-wrapper text-center pb-6 md:mb-6 mb-4">
                                                                <p className="text-front-body text-white before-red-line">ULTIMATE GUIDE</p>
                                                            </div>
                                                            <div className="title-wrapper text-center mb-3">
                                                                <p className="text-front-main-title font-serif text-white">{article.title}</p>
                                                            </div>
                                                            <div className="subtitle-wrapper text-center mb-4">
                                                                <p className="text-front-body-big text-white">{article.sub_title}</p>
                                                            </div>
                                                            <div className="text-link-wrapper">
                                                                <TextLink text="Read More" uppercase color="white" link={getPermalink(article)} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="lg:col-span-6 col-span-12 lg:order-2 order-1">
                                                        <div className="image-wrapper">
                                                            <Image url={getFeaturedImageUrl(article)} link={getPermalink(article)} ratio="100%" alt={article?.featured_image_alt} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    )
                                }
                            })}
                            <div className="swiper-navigation">
                                <div className="prev-button cursor-pointer absolute top-1/2 -translate-y-1/2 left-0 z-10">
                                    <div className="inner w-[32px] h-[32px] flex justify-center items-center bg-front-red">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="12" viewBox="0 0 8 12" fill="none" style={{rotate: '180deg'}}>
                                            <path d="M0.589844 10.59L5.16984 6L0.589844 1.41L1.99984 0L7.99984 6L1.99984 12L0.589844 10.59Z" fill="#fff"/>
                                        </svg>
                                    </div>
                                    </div>
                                <div className="next-button cursor-pointer absolute top-1/2 -translate-y-1/2 right-0 z-10">
                                    <div className="inner w-[32px] h-[32px] flex justify-center items-center bg-front-red">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="12" viewBox="0 0 8 12" fill="none">
                                            <path d="M0.589844 10.59L5.16984 6L0.589844 1.41L1.99984 0L7.99984 6L1.99984 12L0.589844 10.59Z" fill="#fff"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </Swiper>
                    </div>
                    <div className="button-wrapper text-center py-6">
                        <Button text="VIEW ALL" link={`${actualRoute?.country ? `/${actualRoute.country.slug}` : ''}${actualRoute?.city ? `/${actualRoute.city.slug}` : ''}${actualRoute?.region ? `/${actualRoute.region.slug}` : ''}/${CATEGORY_SLUG}`} />
                    </div>
                </div>
            </section>
            </>
        }
        </>
    )
}

export const AdminUltimateGuide: React.FC<ComponentTemplateHomeProps> = ({preContent}) => {
    const [content, setContent] = useState<PreContentProps>([])
    const {generateContent} = useArticle()
    useEffect(() => {
        (async () => {
            const get = await generateContent({
                content: preContent,
                admin: true
            })
            if(get) {
                setContent(get)
            }
        })()
    }, [preContent])
    if(content.length) {
        return (
            <UltimateGuide preContent={content} admin={true} />
        )
    }
}

export default UltimateGuide
