import React, {useEffect, useState} from "react";
import {Swiper, SwiperSlide} from "swiper/react";
import { Pagination } from "swiper/modules";
import Image from "./Image";
import Button from "./Button";
import { Link } from "react-router";
import { useRoute } from "../../context/RouteContext";
import { useTaxonomies } from "../../context/TaxonomyContext";
import useArticle from "../../hooks/useArticle";
import { ComponentTemplateHomeProps, PreContentProps } from "../../types/template.type";
import { Spacer } from "../../pages/Front/Templates/Home";
// const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL


const MostPopular: React.FC<ComponentTemplateHomeProps> = ({preContent}) => {
    const [content, setContent] = useState<PreContentProps>(preContent ?? [])
    const [title, setTitle] = useState<string>('')
    const {actualRoute, clientChange} = useRoute()
    const {getPermalink, getFeaturedImageUrl, generateContent} = useArticle()
    const {taxonomies} = useTaxonomies()
    const CATEGORY_SLUG = 'most-popular'

    const theCategory = () => {
        return taxonomies?.categories?.filter((cat) => (cat.slug_title == CATEGORY_SLUG))[0]
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
                        limit: 8,
                        category: theCategory()?.id
                    }
                })
                if(get) {
                    setContent(get)
                }
            } catch (e) {
                console.log(e)
            }
        })()
        return
    }, [actualRoute, preContent, clientChange])

    useEffect(() => {
        if(actualRoute?.region) {
            setTitle(actualRoute.region.name)
            return
        }
        if(actualRoute?.city) {
            setTitle(actualRoute.city.name)
            return
        }
        if(actualRoute?.country) {
            setTitle(actualRoute.country.name)
            return
        }
        setTitle('Bali')
    }, [actualRoute])
    if(content.filter(Boolean).length) {
        return (
            <>
                <Spacer />
                <div id="most-popular" className="bg-front-section-grey py-12">
                    <div className="container">
                        <div className="title-wrapper mb-8 text-center">
                            <p className="text-front-section-title font-serif text-front-grey font-semibold mb-2">The Most Popular Area in <span className="text-front-red">{title}</span></p>
                            <p className="text-front-body text-front-grey">Explore diverse experiences at every destination and uncover exciting, budget-friendly adventures.</p>
                        </div>
                        <div className="slider-wrapper pb-8 mb-8 relative">
                            {/* <div className="pagination-wrapper"> */}
                                <div className="swiper-pagination"></div>
                            {/* </div> */}
                            <Swiper
                                slidesPerView={1}
                                spaceBetween={10}
                                modules={[Pagination]}
                                pagination={{
                                    el: "#most-popular .swiper-pagination",
                                    enabled: true,
                                    clickable: true
                                }}
                                breakpoints={{
                                    768: {
                                        slidesPerView: 3,
                                        spaceBetween: 40
                                    }
                                }}
                            >
                                {content?.map(article => {
                                    if(article) {
                                        return (
                                            <>
                                                <SwiperSlide>
                                                    <div className="inner">
                                                        <div className="image-wrapper mb-4">
                                                            <Image url={getFeaturedImageUrl(article)} ratio="145%" link={getPermalink(article)} alt={article?.featured_image_alt} />
                                                        </div>
                                                        <div className="text-wrapper">
                                                            <Link to={getPermalink(article)}>
                                                                <div className="title mb-2">
                                                                    <p className="font-serif text-front-article-title">{article.title}</p>
                                                                </div>
                                                                <div className="subtitle">
                                                                    <p className="text-front-body-big">{article.sub_title}</p>
                                                                </div>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </SwiperSlide>
                                            </>
                                        )
                                    }
                                }
                                )}
                            </Swiper>
                        </div>
                        <div className="button-wrapper text-center">
                            <Button text="VIEW ALL" link={`${actualRoute?.country ? `/${actualRoute.country.slug}` : ''}${actualRoute?.city ? `/${actualRoute.city.slug}` : ''}${actualRoute?.region ? `/${actualRoute.region.slug}` : ''}/${CATEGORY_SLUG}`} />
                        </div>
                    </div>
                </div>
                <Spacer />
            </>
        )
    } else {
        return (<></>)
    }
}

export const AdminMostPopular: React.FC<ComponentTemplateHomeProps> = ({preContent}) => {
    const [content, setContent] = useState<PreContentProps>()
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
    }, [])
    if(content) {
        return (
            <MostPopular preContent={content} admin={true} />
        )
    }
}

export default MostPopular
