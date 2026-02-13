import React, {useEffect, useState} from "react"
import { getArticleByFields } from "../../../services/article.service"
import { ArticleProps, ArticleApiResponseProps } from "../../../types/article.type"
import Advertisement from "../../../components/front/Advertisement"
import Newsletter from "../../../components/front/Newsletter"
import Image from "../../../components/front/Image"
import { Link } from "react-router"
import { Category } from "../../../types/category.type"
import Button from "../../../components/front/Button"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import { formatPublished } from "../../../lib/utils/format"
import {FacebookShareButton, WhatsappShareButton, LinkedinShareButton} from 'react-share';
import { RedFacebookIcon, RedLinkedinIcon, RedWhatsappIcon, ShareIcon } from "../../../icons"
import { useRoute } from "../../../context/RouteContext"
import { useTaxonomies } from "../../../context/TaxonomyContext"
import { useNotification } from "../../../context/NotificationContext"
import pkg from "../../../lib/utils/Helmet"
const {Helmet} = pkg
import useArticle from "../../../hooks/useArticle"
// import { useContent } from "../../../context/ContentContext"
const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL
const SITE_URL = import.meta.env.VITE_SITE_URL || ''
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || API_URL

interface AdditionalArticleProps extends ArticleProps {
    featured_image_full_url: string,
    url: string,
    category?: Category,
}

const DiscoverArticle: React.FC<{article: AdditionalArticleProps}> = ({article}) => {
    return (
        <>
            <div className="image-wrapper mb-5">
                <Image ratio="62%" url={article.featured_image_full_url} link={article.url} />
            </div>
            <div className="category-wrapper">
                <p className="uppercase text-front-red">{article?.category?.title}</p>
            </div>
            <div className="title-wrapper">
                <Link to={article.url}>
                    <p className="text-front-subtitle font-serif">{article.title}</p>
                </Link>
            </div>
        </>
    )
}

const RelatedArticle: React.FC<{articles: AdditionalArticleProps[], theArticle: ArticleProps | null}> = ({articles, theArticle}) => {
    if(!theArticle) return
    const filtered = articles.filter(article => (article.id != theArticle.id))
    if(filtered.length == 10) {
        filtered.pop()
    }
    return (
        <>
        <div id="related-articles" className="relative pb-12">
            <div className="swiper-pagination"></div>
            <Swiper
                slidesPerView={1}
                spaceBetween={10}
                modules={[Pagination]}
                pagination={{
                    el: "#related-articles .swiper-pagination",
                    enabled: true,
                    clickable: true
                }}
                breakpoints={{
                    768: {
                        slidesPerView: 2,
                        spaceBetween: 20
                    },
                    1024: {
                        slidesPerView: 4,
                        spaceBetween: 40
                    }
                }}
            >
                {
                    filtered.map(article => {
                        return (
                            <SwiperSlide>
                                <div className="image-wrapper mb-5 line-right-5">
                                    <Image url={article.featured_image_full_url} link={article.url} ratio="100%" />
                                </div>
                                <div className="category-wrapper mb-1">
                                    <p className="">{article?.category?.title}</p>
                                </div>
                                <div className="title-wrapper">
                                    <Link to={article.url}>
                                        <p className="font-serif text-front-title">{article.title}</p>
                                    </Link>
                                </div>
                            </SwiperSlide>
                        )
                    })
                }
            </Swiper>
        </div>
        </>
    )
}

const SingleHousing: React.FC = () => {
    // const {initialData} = useContent()
    const {actualRoute} = useRoute()
    const {getCategoryById, getCountryById} = useTaxonomies()
    // const {availableCategories} = useOutletContext<AvailableCategoriesProps>()
    // const {locations} = useOutletContext<LocationsContextProps>()
    const [content, setContent] = useState<ArticleApiResponseProps>()
    const [discover, setDiscover] = useState<AdditionalArticleProps[]>()
    const [related, setRelated] = useState<AdditionalArticleProps[]>()
    const [currentUrl, setCurrentUrl] = useState<string>()
    const {setNotification} = useNotification()
    const {getDeepestLocation} = useArticle()

    const deepestLocation = getDeepestLocation(actualRoute.article, 'city')

    const generateImageUrl = (image: string | undefined, id: number) => {
        if(image) {
            return `${IMAGE_URL}/${image}`
        }
        return `https://picsum.photos/id/${id*10}/1920/1080`
    }

    useEffect(() => {
        setCurrentUrl(window.location.href)
    }, [])

    useEffect(() => {
        window.scrollTo(0,0)

        try {
            setContent(actualRoute?.article)
        } catch (e) {
            console.log(e)
        }
        // try {
        //     (async () => {
        //         if(!actualRoute.article) return
        //         const getArticle = await getArticleBySlug(actualRoute.article)
        //         if(getArticle) {
        //             setContent(getArticle)
        //         }
        //     })()
        // } catch (e) {
        //     console.log(e)
        // }
    }, [actualRoute])

    useEffect(() => {
        if(!content) return
        (async () => {
            try {
                const getArticle = await getArticleByFields({
                    category: actualRoute?.category?.id,
                    limit: 11
                })
                if(getArticle?.articles) {
                    const setArticle = getArticle.articles.map(article => ({...article, featured_image_full_url: generateImageUrl(article.featured_image_url, article.id), url: `/${getCountryById(article.id_country)?.slug}/${getCategoryById(article.category_id)?.slug_title}/${article.slug}`, category: getCategoryById(article.category_id)}))
                    setRelated(setArticle)
                }
            } catch(e) {
                console.log(e)
            }

            try {
                const getArticle = await getArticleByFields({
                    id_country: actualRoute?.country?.id,
                    limit: 4,
                })
                if(getArticle?.articles) {
                    const setArticle = getArticle.articles.map(article => ({...article, featured_image_full_url: generateImageUrl(article.featured_image_url, article.id), url: `/${getCountryById(article.id_country)?.slug}/${getCategoryById(article.category_id)?.slug_title}/${article.slug}`, category: getCategoryById(article.category_id)}))
                    setDiscover(setArticle)
                }
            } catch(e) {
                console.log(e)
            }
        })()
    }, [content])

    const renderDiscover = () => {
        if(discover) {
            const filtered = discover.filter(article => (article.id != content?.id))
            if(filtered.length == 4) {
                filtered.pop()
            }
            return filtered?.map(article => {
                return (
                    <>
                        <div className="discover-article-wrapper mb-6">
                            <DiscoverArticle article={article} />
                        </div>
                    </>
                )
            })
        }
    }

    const shareClickHandler = async () => {
        if(currentUrl) {
            await navigator.clipboard.writeText(currentUrl)
            setNotification({message: 'Copied URL to clipboard', type: 'neutral'})
        }
    }

    return (
        <>
        <Helmet>
            <title>{actualRoute.article?.title} - essentialbali</title>
            <meta name="description" content={String(content?.meta_data?.meta_description ?? content?.sub_title ?? '')} />
            <link rel="canonical" href={`${SITE_URL}/${actualRoute.country?.slug}/${actualRoute.category?.slug_title}/${actualRoute.article?.slug}`} />
            <meta property="og:type" content="article" />
            <meta property="og:title" content={`${actualRoute.article?.title} - essentialbali`} />
            <meta property="og:description" content={actualRoute.article?.sub_title} />
            <meta property="og:url" content={`${SITE_URL}/${actualRoute.country?.slug}/${actualRoute.category?.slug_title}/${actualRoute.article?.slug}`} />
            <meta property="og:image" content={`${IMAGE_URL}/${actualRoute.article?.featured_image_16_9_url || actualRoute.article?.featured_image_url || 'images/placeholder.png'}`} />
            <meta property="og:site_name" content="essentialbali" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={`${actualRoute.article?.title} - essentialbali`} />
            <meta name="twitter:description" content={actualRoute.article?.sub_title} />
            <meta name="twitter:image" content={`${IMAGE_URL}/${actualRoute.article?.featured_image_16_9_url || actualRoute.article?.featured_image_url || 'images/placeholder.png'}`} />
        </Helmet>
        <article>
            <div className="container mb-24">
                <div className="grid grid-cols-12 pt-12 gap-x-10">
                    <div className="col-span-12 mb-6">
                        <p className="text-front-small uppercase">
                            <Link to={'/'}>Home</Link> / <Link to={`/${deepestLocation?.slug}`}>{deepestLocation?.name}</Link> / <Link to={`/${actualRoute?.country?.slug}/${actualRoute?.category?.slug_title}`}>{actualRoute?.category?.title}</Link>
                        </p>
                    </div>
                    <div className="md:col-span-9 col-span-12">
                        <div className="author-wrapper flex mb-6 justify-between">
                            <div className="item flex gap-x-6">
                                <div className="author flex gap-x-2.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="16" viewBox="0 0 15 16" fill="none">
                                        <g clipPath="url(#clip0_83_51)">
                                            <rect width="15" height="15" transform="translate(0 0.5)" fill="white"/>
                                            <path d="M1.875 11.2812V13.625H4.21875L11.1312 6.71249L8.7875 4.36874L1.875 11.2812ZM13.3813 4.46249L11.0375 2.11874L9.45625 3.70624L11.8 6.04999L13.3813 4.46249Z" fill="#7F7F7F"/>
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_83_51">
                                                <rect width="15" height="15" fill="white" transform="translate(0 0.5)"/>
                                            </clipPath>
                                        </defs>
                                    </svg>
                                    <p className="text-[#A9A9A9] text-front-small">{content?.author_name}</p>
                                </div>
                                <div className="author flex gap-x-2.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="14" viewBox="0 0 15 14" fill="none">
                                        <path d="M1.125 4.14229C1.125 3.17103 1.91236 2.38367 2.88362 2.38367H12.1164C13.0877 2.38367 13.875 3.17103 13.875 4.14229V11.6164C13.875 12.5877 13.0877 13.375 12.1164 13.375H2.88362C1.91236 13.375 1.125 12.5877 1.125 11.6164V4.14229Z" stroke="#7F7F7F" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M3.98267 0.624878V3.70246" stroke="#7F7F7F" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M11.0173 0.624878V3.70246" stroke="#7F7F7F" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M3.76294 5.90027H11.2371" stroke="#7F7F7F" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                    <p className="text-[#A9A9A9] text-front-small">{formatPublished(content?.createdAt)}</p>
                                </div>
                            </div>

                            <div className="item">
                                <ShareIcon className="cursor-pointer" onClick={shareClickHandler} />
                            </div>
                        </div>
                        <div className="title-wrapper mb-8">
                            <h1 className="font-serif text-front-hero">{content?.title}</h1>
                        </div>
                        <div className="share-buttons-wrapper mb-8 flex items-center gap-x-5">
                            <p>Share:</p>
                            {currentUrl &&
                            <>
                                <FacebookShareButton url={currentUrl}>
                                    <RedFacebookIcon className="w-[24px] h-[24px]" />
                                </FacebookShareButton>
                                <LinkedinShareButton url={currentUrl}>
                                    <RedLinkedinIcon className="w-[24px] h-[24px]" />
                                </LinkedinShareButton>
                                <WhatsappShareButton url={currentUrl}>
                                    <RedWhatsappIcon className="w-[24px] h-[24px]" />
                                </WhatsappShareButton>
                            </>
                            }
                        </div>
                        <div className="content-wrapper mb-8" dangerouslySetInnerHTML={{__html: content?.article_post ?? ''}} />

                    </div>
                    <div className="md:col-span-3 col-span-12">
                        <Advertisement ratio="vertical" />
                        <div className="spacer py-6"></div>
                        <p className="font-serif text-front-article-title">Discover More</p>
                        <div className="spacer py-2"></div>
                        {renderDiscover()}
                    </div>
                </div>
            </div>
            <div className="outer bg-front-section-grey py-8">
                <div className="container">
                    <div className="title-wrapper mb-6 text-center">
                        <p className="font-serif text-front-main-title"><span className="text-front-red">Related</span> Articles</p>
                    </div>
                    {
                        related && 
                        <RelatedArticle articles={related} theArticle={content ?? null} />
                    }
                    <div className="button-wrapper text-center pt-16 pb-8">
                        <Button text="VIEW ALL" link={`${actualRoute.country?.slug}/${actualRoute.category?.slug_title}`} />
                    </div>
                    <div className="py-8">
                        <hr style={{borderColor: '#5F5F5F'}} />
                    </div>
                    <Newsletter></Newsletter>
                </div>
            </div>
        </article>
        </>
    )
}

export default SingleHousing