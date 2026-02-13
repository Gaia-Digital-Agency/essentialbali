import React, {useEffect, useRef, useState} from "react"
import { ArticleApiResponseProps } from "../../../types/article.type"
import { useSearchParams } from "react-router"
import { getArticleByFields } from "../../../services/article.service"
import { getCategoryWithFields } from "../../../services/category.service"
import Image from "../../../components/front/Image"
import { Tag } from "../../../types/tags.type"
// import { getAllTags } from "../../../services/tags.service"
import { Link } from "react-router"
import { formatPublished } from "../../../lib/utils/format"
import { generatePagination } from "../../../lib/utils/pagination"
import Advertisement from "../../../components/front/Advertisement"
import Newsletter from "../../../components/front/Newsletter"
import { useRoute } from "../../../context/RouteContext"
import { useTime } from "../../../context/TimeContext"
import { useTaxonomies } from "../../../context/TaxonomyContext"
import { Category } from "../../../types/category.type"
import useArticle from "../../../hooks/useArticle"
import {DateRangePicker} from 'rsuite'
import 'rsuite/DateRangePicker/styles/index.css';
import pkg from "../../../lib/utils/Helmet"
const {Helmet} = pkg

type PaginationProps = {page: Array<string | number> | number | string, currentPage: number, onClick: (pag: number) => void}

type ArticleItemProps = {
    article: ArticleApiResponseProps,
    tag?: Tag | undefined,
    index: number
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
    // let ratio = '' as '16_9' | null
    // if(index == 0 || index == 6) {
    //     ratio = '16_9'
    // } else {
    //     ratio = null
    // }

    return (
        <>
            <div className="image-wrapper mb-5">
                <Image url={getFeaturedImageUrl(article)} ratio="100%" link={getPermalink(article)} />
            </div>
            {article.tags &&
                <div className="tag-wrapper mb-2 text-front-red">
                    {tag?.name}
                </div>
            }
            <div className="title-wrapper mb-2">
                <Link to={getPermalink(article)}>
                    <p className="text-front-subtitle font-serif">{article.title}</p>
                </Link>
            </div>
            <div className="subtitle-wrapper mb-5">
                <p className="text-front-small text-front-soft-grey leading-normal">{article.sub_title}</p>
            </div>
            <div className="date-wrapper flex gap-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="14" viewBox="0 0 15 14" fill="none">
                    <path d="M1.125 4.14229C1.125 3.17103 1.91236 2.38367 2.88362 2.38367H12.1164C13.0877 2.38367 13.875 3.17103 13.875 4.14229V11.6164C13.875 12.5877 13.0877 13.375 12.1164 13.375H2.88362C1.91236 13.375 1.125 12.5877 1.125 11.6164V4.14229Z" stroke="#7F7F7F" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3.98267 0.624878V3.70246" stroke="#7F7F7F" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11.0173 0.624878V3.70246" stroke="#7F7F7F" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3.76294 5.90027H11.2371" stroke="#7F7F7F" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-front-small text-[#A9A9A9]">{formatPublished(article.updatedAt)}</p>
            </div>
        </>
    )
}

const getFormatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
}

const getThisWeek = (date: string) => {
    const today = new Date(date)
    const day = today.getDay() || 7
    const start = new Date(today)
    const end = new Date(today)

    start.setDate(today.getDate() - (day - 1))
    end.setDate(today.getDate() + (7 - day))

    return [getFormatDate(start), getFormatDate(end)]
}

const getThisMonth = (date: string) => {
    const today = new Date(date)
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    return [getFormatDate(start), getFormatDate(end)]
}


const determineDate = (date?: string | Array<string> | null, currentDate?: string | null) => {
    if(!date || !currentDate) return null
    const today = new Date(currentDate)
    let dateFilter = [null, null] as string[] | null[]
    if(date == 'today') {
        dateFilter[0] = getFormatDate(today)
        dateFilter[1] = getFormatDate(today)
    }
    if(date == 'week') {
        dateFilter = getThisWeek(currentDate)
        // dateFilter[0] = monday
        // dateFilter[1] = sunday
    }
    if(date == 'month') {
        dateFilter = getThisMonth(currentDate)
        // dateFilter[0] = start
        // dateFilter[1] = end
    }
    if(typeof date == 'object') {
        dateFilter[0] = date[0]
        dateFilter[1] = date[1] ?? null
    }
    // return dateFilter.filter(Boolean)
    return dateFilter
}

const RenderArticle: React.FC<{articles?: ArticleApiResponseProps[], tags?: Tag[]}> = ({articles, tags}) => {
    if(!articles?.length) return (<>Article not found</>)
    return (
        <>
        {articles?.map((article, i) => {
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
                return (
                    <>
                        <div className={'md:col-span-4 col-span-12'}>
                            <ArticleItem article={article} index={i} tag={tags?.find(tag => tag.id==(article?.tags ? article.tags[0] : 0))} />
                        </div>
                    </>
                )
            })}
        </>
    )
}
const Deals: React.FC = () => {
    const {actualRoute} = useRoute()
    const {taxonomies} = useTaxonomies()
    const [content, setContent] = useState<ArticleApiResponseProps[]>()
    const [title, setTitle] = useState<string>()
    const [description, setDescription] = useState<string>()
    const [searchParams, setSearchParams] = useSearchParams()
    const [subCategories, setSubCategories] = useState<Category[]>()
    const [totalPages, setTotalPages] = useState<number>(1)
    const [tags, setTags] = useState<Tag[]>()
    const {initialData} = useTime()
    const CATEGORY_SLUG = 'deals'
    const theCategory = taxonomies?.categories?.find(cat => (cat.slug_title == CATEGORY_SLUG))

    const containerRef = useRef<HTMLDivElement>(null)

    const paramsPage = searchParams.get('page')
    const currentPage = paramsPage ? parseInt(paramsPage) : 1

    const paramsCat = searchParams.get('subcategory')
    const currentCat = paramsCat ? parseInt(paramsCat) : theCategory?.id

    const paramsDate = searchParams.get('date')
    const currentDate = paramsDate ? paramsDate?.split(',').length > 1 ? paramsDate.split(',') : paramsDate : null


    useEffect(() => {
        (async () => {
            const params = {
                metaData_start_date: null,
                metaData_end_date: null
            } as any
            const getDate = determineDate(currentDate, initialData)
            if(getDate && getDate[0]) {
                params.metaData_start_date = getDate[0]
            }
            if(getDate && getDate[1]) {
                params.metaData_end_date = getDate[1]
            }
            if(!params.metaData_start_date) delete params.metaData_start_date
            if(!params.metaData_end_date) delete params.metaData_end_date
            const getArticle = await getArticleByFields({
                id_country: actualRoute?.country?.id ?? undefined,
                id_city: actualRoute?.city?.id ?? undefined,
                id_region: actualRoute?.region?.id ?? undefined,
                category: currentCat,
                limit: 9,
                page: currentPage,
                ...params
            })
            if(getArticle?.articles) {
                setContent(getArticle.articles)
                setTotalPages(getArticle.pagination?.totalPages ?? 1)
            } else {
                setContent([])
                setTotalPages(1)
            }
        })()
    }, [searchParams, actualRoute])
    useEffect(() => {
        // (async () => {
            // const getTags = await getAllTags()
            // if(getTags.data && getTags.status_code) {
            //     setTags(getTags.data)
            // }
        // })()
        window.scrollTo(0,0);
        if(actualRoute.category?.tags?.length) {
            setTags(actualRoute.category.tags)
        } else {
            setTags([])
        }
    }, [actualRoute])

    useEffect(() => {
        ( async () => {
            if(!theCategory) return
            const getCat = await getCategoryWithFields(theCategory?.id, {id_country: actualRoute?.country?.id, id_city: actualRoute?.city?.id, id_region: actualRoute?.region?.id})
            if(getCat) {
                setTitle(getCat.sub_title)
                setDescription(getCat.description)
            }
        })()
    }, [actualRoute])

    useEffect(() => {
        setSubCategories(taxonomies.categories?.filter(cat => (cat.id_parent == actualRoute?.category?.id)));
        window.scrollTo(0,0);
    }, [])

    const subCatClickHandler = (page: number) => {
        if(page > totalPages || page <= 0) return
        setSearchParams(`subcategory=${page}`)
    }

    const subCategoriesRender = () => {
        if(!subCategories?.length || !subCategories) return
        return (
            <>
            <div className="flex mb-10 border-b border-b-[#BDBDBD]">
                <div onClick={() => {subCatClickHandler(0)}} className={`px-5 py-3 cursor-pointer text-front-small ${currentCat == theCategory?.id ? 'is-active text-front-red' : 'text-[#4B4B4B]'}`}>{theCategory?.title}</div>
                {subCategories?.map(cat => {
                    return (
                        <div onClick={() => {subCatClickHandler(cat.id)}} className={`px-5 py-3 cursor-pointer text-front-small ${`${cat.id}` == searchParams.get('subcategory') ? 'is-active text-front-red' : 'text-[#4B4B4B]'}`}>{cat.title}</div>
                    )
                })}
            </div>
            </>
        )
    }

    const clickPagingHandler = (page: number) => {
        if(page > totalPages || page <= 0) return
        setSearchParams(`page=${page}`)
    }

    const dateFilterRender = () => {
        const clickHandler = (date: string | undefined) => {
            if(searchParams.get('date') == date || !date) {
                setSearchParams(prev => {
                    const oldParams = new URLSearchParams(prev)
                    oldParams.delete('date')
                    return oldParams
                })                
                return
            }
            setSearchParams(prev => {
                const oldParams = new URLSearchParams(prev)
                oldParams.set('date', date)
                return oldParams
            })
        }
        return (
            <>
                <div className="flex mb-8 gap-x-6">
                    <div className={`button-date text-front-small px-5 py-2 rounded-full cursor-pointer ${searchParams.get('date') == 'today' ? 'text-[#4b4b4b] bg-[#efefef]' : 'text-[#959595] bg-[#f5f5f5]'}`} onClick={() => {clickHandler('today')}}>
                        Today
                    </div>
                    <div className={`button-date text-front-small px-5 py-2 rounded-full cursor-pointer ${searchParams.get('date') == 'week' ? 'text-[#4b4b4b] bg-[#efefef]' : 'text-[#959595] bg-[#f5f5f5]'}`} onClick={() => {clickHandler('week')}}>
                        This Week
                    </div>
                    <div className={`button-date text-front-small px-5 py-2 rounded-full cursor-pointer ${searchParams.get('date') == 'month' ? 'text-[#4b4b4b] bg-[#efefef]' : 'text-[#959595] bg-[#f5f5f5]'}`} onClick={() => {clickHandler('month')}}>
                        This Month
                    </div>
                    <div className={`button-date text-front-small cursor-pointer`}>
                        <div className="flex">
                            <div className="text-wrapper rounded-l-full py-2 px-4 text-[#4b4b4b] bg-[#efefef]">
                                Select Date
                            </div>
                            <DateRangePicker aria-setsize={20} className="deals-date-range" format="yyyy/MM/dd" onChange={(e) => {clickHandler(e?.map(dat => (getFormatDate(new Date(dat)))).join(','))}} />
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <>
            <Helmet>
                <title>Deals - essentialbali</title>
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
                    {subCategoriesRender()}
                    {dateFilterRender()}
                    <div className="grid grid-cols-12 gap-5" ref={containerRef}>
                        <RenderArticle articles={content} tags={tags} />
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

export default Deals