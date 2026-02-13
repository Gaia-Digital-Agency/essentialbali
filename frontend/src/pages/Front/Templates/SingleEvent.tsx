import React, { useEffect, useState } from "react"
import { ArticleApiResponseProps, ArticleProps } from "../../../types/article.type"
import { useNotification } from "../../../context/NotificationContext"
import Advertisement from "../../../components/front/Advertisement"
import { useRoute } from "../../../context/RouteContext"
import {FacebookShareButton, WhatsappShareButton, LinkedinShareButton} from 'react-share';
import { RedFacebookIcon, RedLinkedinIcon, RedWhatsappIcon, ShareIcon } from "../../../icons"
import Image from "../../../components/front/Image"
import { Link } from "react-router"
import { SwiperSlide, Swiper } from "swiper/react"
import { Pagination } from "swiper/modules"
import { useTaxonomies } from "../../../context/TaxonomyContext"
import { Tag } from "../../../types/tags.type"
import { getTagByIDs } from "../../../services/tags.service"
import { formatPublished } from "../../../lib/utils/format"
import Newsletter from "../../../components/front/Newsletter"
import Button from "../../../components/front/Button"
import { getArticleByFields } from "../../../services/article.service"
import useArticle from "../../../hooks/useArticle"
import pkg from "../../../lib/utils/Helmet"
import {format, parseISO} from 'date-fns'
import { useAuth } from "../../../context/AuthContext"
import { useContent } from "../../../context/ContentContext"
const {Helmet} = pkg

const SITE_URL = import.meta.env.VITE_SITE_URL || ''
const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL || ''
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || API_URL
import "swiper/swiper-bundle.css";

const DiscoverArticle: React.FC<{article: ArticleProps}> = ({article}) => {
    const {getCategoryById} = useTaxonomies()
    const {getFeaturedImageUrl, getPermalink} = useArticle()
    return (
        <>
            <div className="image-wrapper mb-5">
                <Image ratio="62%" url={getFeaturedImageUrl(article)} link={(getPermalink(article))} />
            </div>
            <div className="category-wrapper">
                <p className="uppercase text-front-red">{getCategoryById(article?.category_id)?.title}</p>
            </div>
            <div className="title-wrapper">
                <Link to={getPermalink(article)}>
                    <p className="text-front-subtitle font-serif">{article.title}</p>
                </Link>
            </div>
        </>
    )
}

const RelatedArticle: React.FC<{articles: ArticleProps[], theArticle: ArticleProps | null}> = ({articles, theArticle}) => {
    const { getCategoryById } = useTaxonomies()
    const {getFeaturedImageUrl, getPermalink} = useArticle()
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
                slidesPerView={4}
                spaceBetween={40}
                modules={[Pagination]}
                pagination={{
                    el: "#related-articles .swiper-pagination",
                    enabled: true,
                    clickable: true
                }}
            >
                {
                    filtered.map(article => {
                        return (
                            <SwiperSlide>
                                <div className="image-wrapper mb-5 line-right-5">
                                    <Image url={getFeaturedImageUrl(article)} link={getPermalink(article)} ratio="100%" />
                                </div>
                                <div className="category-wrapper mb-1">
                                    <p className="">{getCategoryById(article?.category_id)?.title}</p>
                                </div>
                                <div className="title-wrapper">
                                    <Link to={getPermalink(article)}>
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

const formatTime = (time: string) => {
    let m = 'AM'
    const [hour, minute] = time.split(':')
    let resHour = Number(hour)
    if(!hour || !minute) return
    if(Number(hour) > 11) {
        m = 'PM'
        resHour = Number(hour) == 12 ? 12 : Number(hour) - 12
    }
    return `${resHour}${m}`
}

const formatDate = (isoDate: string | undefined) => {
    if(!isoDate) return undefined
    const date: Date = parseISO(isoDate);
    return format(date, 'EEEE, d MMMM yyyy');
}

const EditButton: React.FC<{article: ArticleApiResponseProps | undefined}> = ({article}) => {
    if(!article) return <></>
    return (
        <div className="mb-4">
            <Button text="Edit article" link={`/admin/mst_article/edit/${article.id}`}></Button>
        </div>
    )
}

const SingleEvent: React.FC = () => {
    const {initialData} = useContent()
    const {setNotification} = useNotification()
    const {actualRoute} = useRoute()
    const {getFeaturedImageUrl} = useArticle()
    const [content, setContent] = useState<ArticleApiResponseProps | undefined>(initialData?.article ?? undefined)
    const [relatedArticle, setRelatedArticle] = useState<ArticleProps[]>(initialData?.related ?? [])
    const [discoverArticle, setDiscoverArticle] = useState<ArticleProps[]>(initialData?.discover ?? [])
    const [currentPage, setCurrentPage] = useState<string>()
    // const [isClient, setIsClient] = useState<boolean>(false)
    const [tags, setTags] = useState<Tag[]>([])
    const {userDetails} = useAuth()

    const renderEditButton = () => {
        if(userDetails?.user_level == 'super_admin') {
            return <EditButton article={content}  />
        }
        if(userDetails?.user_level == 'admin_country') {
            if(content?.id_country == userDetails.id_country) {
                return <EditButton article={content} />
            }
        }
        if(userDetails?.user_level == 'admin_city') {
            if(content?.id_city == userDetails.id_city) {
                return <EditButton article={content} />
            }
        }
    }

    useEffect(() => {
        (async () => {
            try {
                if(content?.tags?.length) {
                    const getTag = await getTagByIDs(content?.tags)
                    if(getTag){
                        setTags(getTag)
                    }
                }
            } catch(e) {
                console.log(e)
            }

            try {
                const getArticle = await getArticleByFields({
                    category: actualRoute?.category?.id,
                    limit: 11
                })
        
                if(getArticle?.articles) {
                    // const setArticle = getArticle.articles.map(article => ({...article, featured_image_full_url: generateImageUrl(article.featured_image_url, article.id), url: `/${getCountryById(article.id_country)?.slug}/${getCategoryById(article.category_id)?.slug_title}/${article.slug}`, category: getCategoryById(article.category_id)}))
                    setRelatedArticle(getArticle.articles)
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
                    // const setArticle = getArticle.articles.map(article => ({...article, featured_image_full_url: generateImageUrl(article.featured_image_url, article.id), url: `/${getCountryById(article.id_country)?.slug}/${getCategoryById(article.category_id)?.slug_title}/${article.slug}`, category: getCategoryById(article.category_id)}))
                    setDiscoverArticle(getArticle.articles)
                }
            } catch(e) {
                console.log(e)
            }
        })()
    }, [content])

    useEffect(() => {
        setCurrentPage(window.location.href)
        setContent(actualRoute.article)
    }, [])

    const shareClickHandler = async () => {
        if(currentPage) {
            await navigator.clipboard.writeText(currentPage)
            setNotification({message: 'Copied URL to clipboard', type: 'neutral'})
        }
    }
    const renderTags = () => {
        if(tags.length) {
            return tags.map(tag => (
                <div className="box px-8 py-2 bg-[#EEEEEE] uppercase">
                    {tag.name}
                </div>
            ))
        }
    }

    const renderDiscover = () => {
        if(discoverArticle) {
            const filtered = discoverArticle.filter(article => (article.id != content?.id))
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
                <div className="container">
                    <div className="grid grid-cols-12 lg:gap-x-10 py-12">
                        <div className="lg:col-span-8 lg:col-start-3 col-span-12 mb-12">
                            <Advertisement />
                        </div>

                        <div className="col-span-12 mb-6">
                            <div className="flex justify-between items-center">
                                <div className="item">
                                    <p className="text-[#222222]">
                                        {formatPublished(content?.updatedAt)}
                                    </p>
                                </div>
                                <div className="item">
                                    <ShareIcon className="cursor-pointer" onClick={shareClickHandler} />
                                </div>
                            </div>
                        </div>


                        <div className="lg:col-span-9 col-span-12">
                            <div className="thumbnail-wrapper mb-6">
                                <Image url={getFeaturedImageUrl(content ?? undefined)} ratio="56.25%" isLazy={false} fetchPriority="high" />
                            </div>
                            <div className="author-wrapper flex justify-between mb-6 items-center">
                                <div className="item">
                                    <p>By {content?.author_name}</p>
                                </div>
                                <div className="item flex gap-x-4">
                                    {renderTags()}
                                </div>
                            </div>
                            <div className="title-wrapper mb-6">
                                <h1 className="text-front-article-title font-serif">{content?.title}</h1>
                            </div>
                            <div className="date-information mb-8">
                                {content?.meta_data?.start_date || content?.meta_data?.start_time &&
                                <div className="title mb-4">
                                    <p className="text-front-subtitle font-serif">Date & Time</p>
                                </div>
                                }
                                {
                                    content?.meta_data?.start_date &&
                                    <div className="item flex gap-x-4 mb-2">
                                        <div className="icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="14" viewBox="0 0 15 14" fill="none">
                                                <path d="M1.125 4.14229C1.125 3.17103 1.91236 2.38367 2.88362 2.38367H12.1164C13.0877 2.38367 13.875 3.17103 13.875 4.14229V11.6164C13.875 12.5877 13.0877 13.375 12.1164 13.375H2.88362C1.91236 13.375 1.125 12.5877 1.125 11.6164V4.14229Z" stroke="#7F7F7F" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
                                                <path d="M3.98267 0.624878V3.70246" stroke="#7F7F7F" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
                                                <path d="M11.0173 0.624878V3.70246" stroke="#7F7F7F" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
                                                <path d="M3.76294 5.90027H11.2371" stroke="#7F7F7F" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                        </div>
                                        <div className="text">
                                            {content?.meta_data?.start_date ? formatDate(`${content?.meta_data?.start_date}`) : 'Saturday, 16 September 2025'}
                                        </div>
                                    </div>
                                }
                                {
                                    content?.meta_data?.start_time &&
                                    <div className="item flex gap-x-4">
                                        <div className="icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" fill="none">
                                                <g clip-path="url(#clip0_670_5700)">
                                                    <path d="M8.74994 0.625H6.24994C5.90619 0.625 5.62494 0.90625 5.62494 1.25C5.62494 1.59375 5.90619 1.875 6.24994 1.875H8.74994C9.09369 1.875 9.37494 1.59375 9.37494 1.25C9.37494 0.90625 9.09369 0.625 8.74994 0.625ZM7.49994 8.75C7.84369 8.75 8.12494 8.46875 8.12494 8.125V5.625C8.12494 5.28125 7.84369 5 7.49994 5C7.15619 5 6.87494 5.28125 6.87494 5.625V8.125C6.87494 8.46875 7.15619 8.75 7.49994 8.75ZM11.8937 4.61875L12.3624 4.15C12.5999 3.9125 12.6062 3.51875 12.3624 3.275L12.3562 3.26875C12.1124 3.025 11.7249 3.03125 11.4812 3.26875L11.0124 3.7375C10.0437 2.9625 8.82494 2.5 7.49994 2.5C4.49994 2.5 1.94994 4.975 1.87494 7.975C1.79369 11.15 4.33744 13.75 7.49994 13.75C10.6124 13.75 13.1249 11.2312 13.1249 8.125C13.1249 6.8 12.6624 5.58125 11.8937 4.61875ZM7.49994 12.5C5.08119 12.5 3.12494 10.5437 3.12494 8.125C3.12494 5.70625 5.08119 3.75 7.49994 3.75C9.91869 3.75 11.8749 5.70625 11.8749 8.125C11.8749 10.5437 9.91869 12.5 7.49994 12.5Z" fill="#7F7F7F"/>
                                                </g>
                                                <defs>
                                                    <clipPath id="clip0_670_5700">
                                                        <rect width="15" height="15" fill="white"/>
                                                    </clipPath>
                                                </defs>
                                            </svg>
                                        </div>
                                        <div className="text">
                                            {content?.meta_data?.start_time ? `${formatTime(`${content?.meta_data?.start_time}`)} ` : ''}
                                            {content?.meta_data?.end_time ? `- ${formatTime(`${content?.meta_data?.end_time}`)}` : ''}
                                        </div>
                                    </div>
                                }
                            </div>
                            <div className="share-buttons-wrapper mb-8 flex items-center gap-x-5">
                                <p>Share:</p>
                                {currentPage &&
                                <>
                                    <FacebookShareButton url={currentPage}>
                                        <RedFacebookIcon className="w-[24px] h-[24px]" />
                                    </FacebookShareButton>
                                    <LinkedinShareButton url={currentPage}>
                                        <RedLinkedinIcon className="w-[24px] h-[24px]" />
                                    </LinkedinShareButton>
                                    <WhatsappShareButton url={currentPage}>
                                        <RedWhatsappIcon className="w-[24px] h-[24px]" />
                                    </WhatsappShareButton>
                                </>
                                }
                            </div>
                            <div className="content-wrapper mb-8" dangerouslySetInnerHTML={{__html: content?.article_post ?? ''}}></div>
                        </div>


                        <div className="lg:col-span-3 col-span-12">
                            {renderEditButton()}
                            <div className="ads-wrapper mb-12">
                                <Advertisement ratio="vertical" />
                            </div>
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
                            relatedArticle && 
                            <RelatedArticle articles={relatedArticle} theArticle={content ?? null} />
                        }
                        <div className="button-wrapper text-center pt-12 pb-8">
                            <Button text="VIEW ALL" link={`${actualRoute.country?.slug}/${actualRoute.category?.slug_title}`} />
                        </div>
                        <div className="py-8">
                            <hr style={{borderColor: '#5F5F5F'}} />
                        </div>
                        <Newsletter />
                    </div>
                </div>

            </article>
        </>
    )
}

export default SingleEvent