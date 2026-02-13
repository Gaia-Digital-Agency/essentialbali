import React, {useEffect, useState} from "react"
import Image from "./Image"
import { Link } from "react-router"
import TextLink from "./TextLink"
import { useRoute } from "../../context/RouteContext"
import { useTaxonomies } from "../../context/TaxonomyContext"
import Button from "./Button"
import useArticle from "../../hooks/useArticle"
import { PreContentProps, ComponentTemplateHomeProps } from "../../types/template.type"
import { formatPublished } from "../../lib/utils/format"
import { Spacer } from "../../pages/Front/Templates/Home"


const EventsHome: React.FC<ComponentTemplateHomeProps> = ({preContent = []}) => {
    const [content, setContent] = useState<PreContentProps>(preContent)
    const {actualRoute, clientChange} = useRoute()
    const {taxonomies} = useTaxonomies()
    const {generateContent, getPermalink, getFeaturedImageUrl} = useArticle()
    const CATEGORY_SLUG = 'events'


    useEffect(() => {
        (async () => {
            try {
                const get = await generateContent({
                    content: preContent,
                    query: {
                        id_country: actualRoute?.country?.id,
                        id_city: actualRoute?.city?.id,
                        id_region: actualRoute?.region?.id,
                        limit: 4,
                        category: taxonomies?.categories?.find(cat => (cat.slug_title == CATEGORY_SLUG))?.id
                    }
                })
                if(get) {
                    setContent(get)
                } else {
                    setContent([])
                }
                // if(content.length) return
                // if(!clientChange) return
                // const getArticle = await getArticleByFields({
                //     id_country: actualRoute?.country?.id,
                //     id_city: actualRoute?.city?.id,
                //     id_region: actualRoute?.region?.id,
                //     limit: 4,
                //     category: taxonomies?.categories?.find(cat => (cat.slug_title == CATEGORY_SLUG))?.id
                // })
                // if(getArticle?.articles) {
                //     // const setArticle = getArticle.articles.map(article => ({...article, featured_image_full_url: generateImageUrl(article.featured_image_url, article.id)}))
                //     setContent(getArticle.articles)
                //     return
                // }
            } catch(e) {
                console.log(e)
            }
        })()
    }, [actualRoute, preContent, clientChange])
    
    return (
        <>
            {!!content.filter(Boolean).length && 
            <>
                <Spacer />
                <section id="events">
                    <div className="container">
                        <div className="title-wrapper text-center mb-8">
                            <p className="text-front-section-title font-serif font-semibold">Events You Shouldnt Miss</p>
                        </div>
                        <div className="grid grid-cols-12 md:gap-x-10 gap-y-10 mb-6 md:mb-4 overflow-x-hidden">
                            {
                                content?.map(article => {
                                    if(article) {
                                        return (
                                            <div className="md:col-span-6 lg:col-span-3 col-span-12 line-right-5 relative" key={`events-home-${article.id}`}>
                                                <div className="inner grid grid-cols-12 gap-x-6 md:gap-x-0">
                                                    <div className="col-span-6 md:col-span-12">
                                                        <div className="date pb-4 flex gap-x-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="14" viewBox="0 0 15 14" fill="none">
                                                                <path d="M1.125 4.14229C1.125 3.17103 1.91236 2.38367 2.88362 2.38367H12.1164C13.0877 2.38367 13.875 3.17103 13.875 4.14229V11.6164C13.875 12.5877 13.0877 13.375 12.1164 13.375H2.88362C1.91236 13.375 1.125 12.5877 1.125 11.6164V4.14229Z" stroke="#7F7F7F" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
                                                                <path d="M3.98267 0.624878V3.70246" stroke="#7F7F7F" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
                                                                <path d="M11.0173 0.624878V3.70246" stroke="#7F7F7F" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
                                                                <path d="M3.76294 5.90027H11.2371" stroke="#7F7F7F" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
                                                            </svg>
                                                            <p className="text-front-small text-front-soft-gray">{formatPublished(article?.meta_data?.start_date) ?? 'TBA'}</p>
                                                        </div>
                                                        <div className="image-wrapper md:mb-4">
                                                            <Image url={getFeaturedImageUrl(article)} ratio="100%" link={getPermalink(article)} alt={article?.featured_image_alt} />
                                                        </div>
                                                    </div>
                                                    <div className="col-span-6 md:col-span-12">
                                                        <div className="title-wrapper mb-4">
                                                            <Link to={getPermalink(article)}>
                                                                <p className="text-front-title text-front-grey font-serif">{article.title}</p>
                                                            </Link>
                                                        </div>
                                                        <div className="link-text-wrapper">
                                                            <TextLink text="Read More" uppercase color="gray" link={getPermalink(article)}></TextLink>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                })
                            }
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

export const AdminEventsHome: React.FC<{preContent: PreContentProps}> = ({preContent}) => {
    const [content, setContent] = useState<PreContentProps>([])
    const {generateContent} = useArticle()
    useEffect(() => {
        (async() => {
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
            <EventsHome preContent={content} admin={true} />
        )
    }
}

export default EventsHome
