import React, { useEffect, useRef, useState } from "react"
import { ArticleProps } from "../../../types/article.type"
import { useRoute } from "../../../context/RouteContext"
import { getArticleByFields } from "../../../services/article.service"
import { useTaxonomies } from "../../../context/TaxonomyContext"
import { useSearchParams, Link } from "react-router"
import Advertisement from "../../../components/front/Advertisement"
import Image from "../../../components/front/Image"
import { generatePagination } from "../../../lib/utils/pagination"
import { formatPublished } from "../../../lib/utils/format"
import Newsletter from "../../../components/front/Newsletter"
import { useContent } from "../../../context/ContentContext"
import { Tag } from "../../../types/tags.type"
// import { getAllTags } from "../../../services/tags.service"
import { Helmet } from "react-helmet-async"
import useArticle from "../../../hooks/useArticle"

// type PagesProps = {page: number, currentPage: number, onClick: (pag: number) => void}
type PaginationProps = {page: Array<string | number> | number | string, currentPage: number, onClick: (pag: number) => void}

interface DirectoryArticleProps extends ArticleProps {
    // url: string,
    // featured_image_full_url: string,
    // // tags_data: Tag[] | Tag | undefined,
    updatedAt?: string
    tag?: Tag | undefined
}

type ArticleItemProps = {
    article: DirectoryArticleProps,
    tag?: Tag
}

const RenderPages:React.FC<PaginationProps> = ({page, onClick, currentPage}) => {
    return (
        <div className={`px-4 py-2 font-medium ${typeof page == 'string' ? '' : 'cursor-pointer'} ${currentPage == page ? 'text-front-red' : ''}`} onClick={() => {
            if(typeof page == 'string' || typeof page == 'object') return
            onClick(page)
        }}>
            {page}
        </div>
    )
}

const RenderPagination: React.FC<PaginationProps> = ({page, currentPage, onClick}) => {
    // if(content)
    return (
        <>
            <div className="prev-button cursor-pointer" onClick={() => {onClick(currentPage - 1)}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="12" viewBox="0 0 8 12" fill="none" style={{rotate: '180deg'}}>
                    <path d="M0.589844 10.59L5.16984 6L0.589844 1.41L1.99984 0L7.99984 6L1.99984 12L0.589844 10.59Z" fill="black"/>
                </svg>
            </div>
            {
                typeof page == 'object' &&
                page.map(pag => (<RenderPages page={pag} currentPage={currentPage} onClick={onClick} />))
            }
            <div className="next-button cursor-pointer" onClick={() => {onClick(currentPage + 1)}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="12" viewBox="0 0 8 12" fill="none">
                    <path d="M0.589844 10.59L5.16984 6L0.589844 1.41L1.99984 0L7.99984 6L1.99984 12L0.589844 10.59Z" fill="black"/>
                </svg>
            </div>
        </>
    )
}

const ArticleItem: React.FC<ArticleItemProps> = ({article, tag}) => {
    const {getPermalink, getFeaturedImageUrl} = useArticle()
    return (
        <>
            <div className="image-wrapper mb-5">
                <Image url={getFeaturedImageUrl(article)} ratio="100%" link={getPermalink(article)} />
            </div>
            {article.tags &&
                <div className="tag-wrapper mb-2 text-front-red">
                    {tag?.name ?? ''}
                </div>
            }
            <div className="title-wrapper mb-5">
                <Link to={getPermalink(article)} viewTransition>
                    <p className="text-front-subtitle font-serif">{article.title}</p>
                </Link>
            </div>
            <div className="date-wrapper flex gap-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="14" viewBox="0 0 15 14" fill="none">
                    <path d="M1.125 4.14229C1.125 3.17103 1.91236 2.38367 2.88362 2.38367H12.1164C13.0877 2.38367 13.875 3.17103 13.875 4.14229V11.6164C13.875 12.5877 13.0877 13.375 12.1164 13.375H2.88362C1.91236 13.375 1.125 12.5877 1.125 11.6164V4.14229Z" stroke="#7F7F7F" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3.98267 0.624878V3.70246" stroke="#7F7F7F" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M11.0173 0.624878V3.70246" stroke="#7F7F7F" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3.76294 5.90027H11.2371" stroke="#7F7F7F" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p className="text-front-small text-[#A9A9A9]">{formatPublished(article.updatedAt)}</p>
            </div>
        </>
    )
}

const LocalBali: React.FC<{isTrending?: boolean}> = ({isTrending = false}) => {
    const {actualRoute} = useRoute()
    const {taxonomies} = useTaxonomies()
    const {initialData} = useContent()
    const [content, setContent] = useState<ArticleProps[]>(initialData?.articles ?? [])
    const [title, setTitle] = useState<string>()
    const [description, setDescription] = useState<string>()
    const [totalPages, setTotalPages] = useState<number>(initialData?.pagination?.totalPages ?? 1)
    const [isClient, setIsClient] = useState<boolean>(false)
    const [tags, setTags] = useState<Tag[]>()
    const CATEGORY_SLUGS = ['experience', 'ultimate-guide', 'featured']
    // const [currentTag, setCurrentTag] = useState()

    const [searchParams, setSearchParams] = useSearchParams()
    const searchPage = searchParams.get('page')
    const currentPage = searchPage ? parseInt(searchPage) : 1

    const containerRef = useRef<HTMLDivElement>(null)

    // const queryEndpoint = {
    //     id_country: taxonomies.countries?.find(coun => (coun.id != actualRoute.country?.id)),
    //     // id_city: actualRoute.city?.id,
    //     // id_region: actualRoute.region?.id,
    //     category: taxonomies.categories?.filter(item => CATEGORY_SLUGS.includes(item.slug_title)).map(cat => (cat.id)),
    //     limit: 7,
    //     page: currentPage,
    //     // ...isTrendingParams
    // }

    useEffect(() => {
        if(actualRoute.category?.tags?.length) {
            setTags(actualRoute.category.tags)
        } else {
            setTags([])
        }
    }, [actualRoute])

    useEffect(() => {
        setIsClient(true)
        // (async () => {
            // const getTags = await getAllTags()
            // if(getTags.data && getTags.status_code) {
            //     setTags(getTags.data.slice(0, 16))
            // }
        // })()
        window.scrollTo(0,0);
    }, [])

    useEffect(() => {
        if(!isClient) return
        window.scrollTo(0, 0)
    }, [actualRoute, searchPage])

    useEffect(() => {
        if(!isClient) return
        // if(content.length && `${currentPage}` == searchPage) return
        // if(!shouldQuery) return;
        
        (async () => {
            const urlParams = new URLSearchParams()
            taxonomies.countries?.filter(coun => (coun.id != actualRoute.country?.id)).forEach(coun => {
                urlParams.append('id_country[]', `${coun.id}`)
            })
            taxonomies.categories?.filter(item => CATEGORY_SLUGS.includes(item.slug_title)).forEach(cat => {
                urlParams.append('category[]', `${cat.id}`)
            })
            urlParams.append('page', `${currentPage}`)
            urlParams.append('limit', '9')
            const getArticle = await getArticleByFields({}, urlParams)
            if(getArticle?.articles) {
                // const setArticle = getArticle.articles.map(article => ({...article}))
                setContent(getArticle.articles)
                setTotalPages(getArticle.pagination?.totalPages ?? 1)
            } else {
                setContent([])
            }
        })()
        // setShouldQuery(false)
        const theTitle = actualRoute.category?.sub_title
        const theDescription = actualRoute.category?.description
        setTitle(theTitle)
        setDescription(theDescription)
    }, [actualRoute, searchPage, isClient])

    const getTagById = (tag: number | undefined) => {
        return tags?.find(_tag => _tag.id == tag)
    }

    const clickPagingHandler = (page: number) => {
        if(page > totalPages || page <= 0) return
        setIsClient(true)
        setSearchParams(prev => {
            const newSearchParams = new URLSearchParams(prev)
            newSearchParams.set('page', `${page}`)
            return newSearchParams
        })
    }

    const renderArticle = () => {
        if(content.length) {
            return (
                content.map((article) => {
                    // let articleClassName = ''
                    // if(i == 0 || i == 6) {
                    //     articleClassName += 'md:col-span-8 '
                    // } else {
                    //     articleClassName += 'md:col-span-4 '
                    // }
                    // if(i == 3 || i == 0 || i == 6) {
                    //     articleClassName += 'col-span-12'
                    // } else {
                    //     articleClassName += 'col-span-6'
                    // }
                    let theTag
                    if(article?.tags?.length) {
                        theTag = article.tags[0]
                    } else {
                        theTag = undefined
                    }
                    return (
                        <>
                            <div className={'md:col-span-4 col-span-12'}>
                                <ArticleItem article={article} tag={getTagById(theTag) ?? undefined} />
                            </div>
                        </>
                    )
                })
            )
        }
        return (
            <div className="col-span-12">No article for this category</div>
        )
    }

    return (
        <>
            <Helmet>
                <title>{isTrending ? 'Trending' : ''}{actualRoute.category?.title ?? ''} - essentialbali</title>
                <meta name="description" content="essentialbali is the ultimate Bali area guide for travelers, expats, and locals, featuring the best dining, events, schools, wellness, and travel in Bali" />
            </Helmet>
            <section className="py-12">
                <div className="container">
                    <div className="ads-wrapper mb-12">
                        <Advertisement />
                    </div>
                    <div className="grid grid-cols-12 mb-12">
                        <div className="md:col-span-10 md:col-start-2 col-span-12">
                            <div className="title-wrapper text-center mb-4">
                                <p className="font-serif text-front-hero">{title}</p>
                            </div>
                            <div className="description-wrapper text-center">
                                <p className="">{description}</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-12 gap-5" ref={containerRef}>
                        {renderArticle()}
                    </div>
                    <div className="pagination-wrapper flex justify-center gap-x-4 py-8 items-center">
                        <RenderPagination page={generatePagination(currentPage, totalPages)} currentPage={currentPage} onClick={clickPagingHandler}  />
                    </div>
                </div>
                <div className="newsletter-wrapper bg-front-section-grey py-8 mt-6">
                    <Newsletter />
                </div>
            </section>
        </>
    )
}

export default LocalBali
