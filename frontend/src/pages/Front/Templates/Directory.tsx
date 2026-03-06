import React, { useEffect, useRef, useState } from "react"
import { ArticleProps } from "../../../types/article.type"
import { useRoute } from "../../../context/RouteContext"
import { getArticleByFields } from "../../../services/article.service"
import { useTaxonomies } from "../../../context/TaxonomyContext"
import { useSearchParams, Link } from "react-router"
// import Advertisement from "../../../components/front/Advertisement"
import Image from "../../../components/front/Image"
import { generatePagination } from "../../../lib/utils/pagination"
import { formatPublished } from "../../../lib/utils/format"
import Newsletter from "../../../components/front/Newsletter"
import { useContent } from "../../../context/ContentContext"
import { Category } from "../../../types/category.type"
import { Tag } from "../../../types/tags.type"
// import { getAllTags } from "../../../services/tags.service"
import useArticle from "../../../hooks/useArticle"
import pkg from "../../../lib/utils/Helmet"
const {Helmet} = pkg
import { getCategoryWithFields } from "../../../services/category.service"

const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL

type PageItemProps = { 
  page: string | number, 
  currentPage: number, 
  onClick: (page: number) => void 
}

type PaginationProps = { 
  pages: Array<string | number>, 
  currentPage: number, 
  onClick: (page: number) => void 
}

const RenderPages: React.FC<PageItemProps> = ({ page, onClick, currentPage }) => {
  const isCurrent = Number(currentPage) === Number(page)
  const isDots = typeof page === 'string' && page === '...'
  
  return (
    <div 
      className={`px-4 py-2 font-medium ${isDots ? '' : 'cursor-pointer'} ${isCurrent ? 'text-front-red' : ''}`} 
      onClick={() => {
        if (isDots) return
        onClick(Number(page))
      }}
    >
      {page}
    </div>
  )
}

const RenderPagination: React.FC<PaginationProps> = ({ pages, currentPage, onClick }) => {
  return (
    <>
      <div className="cursor-pointer prev-button" onClick={() => onClick(currentPage - 1)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="12" viewBox="0 0 8 12" fill="none" style={{ rotate: '180deg' }}>
          <path d="M0.589844 10.59L5.16984 6L0.589844 1.41L1.99984 0L7.99984 6L1.99984 12L0.589844 10.59Z" fill="black" />
        </svg>
      </div>
      {pages.map((pag, i) => (
        <RenderPages key={`page-${i}-${pag}`} page={pag} currentPage={currentPage} onClick={onClick} />
      ))}
      <div className="cursor-pointer next-button" onClick={() => onClick(currentPage + 1)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="8" height="12" viewBox="0 0 8 12" fill="none">
          <path d="M0.589844 10.59L5.16984 6L0.589844 1.41L1.99984 0L7.99984 6L1.99984 12L0.589844 10.59Z" fill="black" />
        </svg>
      </div>
    </>
  )
}

const ArticleItem: React.FC<ArticleItemProps> = ({article, tag}) => {
    // console.log(article.updatedAt, article.title, formatPublished(article.updatedAt))
    const {getPermalink, getFeaturedImageUrl} = useArticle()
    const imageRef = useRef<any>(null)

    return (
        <div 
            className="relative h-full group"
            onMouseEnter={() => imageRef.current?.zoomIn()}
            onMouseLeave={() => imageRef.current?.zoomOut()}
        >
            <div className="mb-5 image-wrapper">
                <Image 
                    url={getFeaturedImageUrl(article)} 
                    ratio="100%" 
                    link={getPermalink(article)} 
                    ref={imageRef}
                />
            </div>
            {article.tags &&
                <div className="mb-2 tag-wrapper text-front-red">
                    {tag?.name ?? ''}
                </div>
            }
            <div className="mb-2 title-wrapper">
                <Link to={getPermalink(article)} viewTransition>
                    <p className="text-front-subtitle font-serif transition-all duration-300 group-hover:[text-shadow:0_0_0.3px_currentColor]">
                        {article.title}
                    </p>
                </Link>
            </div>
            <div className="mb-5 subtitle-wrapper">
                <p className="leading-normal text-front-small text-front-soft-gray">{article.sub_title}</p>
            </div>
            <div className="flex date-wrapper gap-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="14" viewBox="0 0 15 14" fill="none">
                    <path d="M1.125 4.14229C1.125 3.17103 1.91236 2.38367 2.88362 2.38367H12.1164C13.0877 2.38367 13.875 3.17103 13.875 4.14229V11.6164C13.875 12.5877 13.0877 13.375 12.1164 13.375H2.88362C1.91236 13.375 1.125 12.5877 1.125 11.6164V4.14229Z" stroke="#7F7F7F" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3.98267 0.624878V3.70246" stroke="#7F7F7F" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M11.0173 0.624878V3.70246" stroke="#7F7F7F" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3.76294 5.90027H11.2371" stroke="#7F7F7F" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p className="text-front-small text-[#A9A9A9]">{formatPublished(article.updatedAt)}</p>
            </div>
        </div>
    )
}

const Directory: React.FC<{isTrending?: boolean}> = ({isTrending = false}) => {
    const {actualRoute, getLocationRouteUrl, clientChange} = useRoute()
    const {taxonomies} = useTaxonomies()
    const {initialData} = useContent()
    const [content, setContent] = useState<ArticleProps[]>(initialData?.articles ?? [])
    const [title, setTitle] = useState<string>()
    const [description, setDescription] = useState<string>()
    const [totalPages, setTotalPages] = useState<number>(initialData?.pagination?.totalPages ?? 1)
    const [isClient, setIsClient] = useState<boolean>(false)
    // const [isSubCat, setIsSubCat] = useState<boolean>()
    const [parentCat, setParentCat] = useState<Category | undefined>(undefined)
    const [subCategories, setSubCategories] = useState<Category[] | undefined>([])
    const [tags, setTags] = useState<Tag[]>()
    // const [currentTag, setCurrentTag] = useState()

    const [searchParams, setSearchParams] = useSearchParams()
    const searchPage = searchParams.get('page')
    const currentPage = searchPage ? parseInt(searchPage) : 1
    // const CATEGORY_SLUG = 'directory'
    // const theCategory = taxonomies?.categories?.find(cat => (cat.slug_title == CATEGORY_SLUG))
    const theCategory = actualRoute.category
    const searchSubCat = searchParams.get('subcategory')
    const currentCat = searchSubCat ? parseInt(searchSubCat) : theCategory?.id
    const searchTag = searchParams.get('tag')
    const currentTag = searchTag ? parseInt(searchTag) : null

    const containerRef = useRef<HTMLDivElement>(null)
    
    const isTrendingParams = isTrending ? {isTrending: true} : {category: currentCat, tag: currentTag}
    const queryEndpoint = {
        id_country: actualRoute.country?.id,
        id_city: actualRoute.city?.id,
        id_region: actualRoute.region?.id,
        limit: 12,
        page: currentPage,
        ...isTrendingParams
    }

    useEffect(() => {
        if(actualRoute.category?.tags?.length) {
            setTags(actualRoute.category.tags)
        } else {
            if(actualRoute.category?.id_parent) {
                const check = taxonomies.categories?.find(cat => (cat.id == actualRoute.category?.id_parent))?.tags
                setTags(check ?? [])
            } else {
                setTags([])
            }
        }
    }, [actualRoute])

    useEffect(() => {
        setIsClient(true)
        window.scrollTo(0,0);
        // (async () => {
            // const getTags = await getAllTags()
            // if(getTags.data && getTags.status_code) {
            //     setTags(getTags.data.slice(0, 16))
            // }
        // })()
    }, [])

    useEffect(() => {
        if(!isClient) return
        window.scrollTo(0, 0)
    }, [actualRoute, searchPage])

    useEffect(() => {
        if(!clientChange) return
        // if(content.length && `${currentPage}` == searchPage) return
        // if(!shouldQuery) return;
        
        (async () => {
            const getArticle = await getArticleByFields({
                ...queryEndpoint
            })
            if(getArticle?.articles) {
                // const setArticle = getArticle.articles.map(article => ({...article}))
                setContent(getArticle.articles)
                setTotalPages(getArticle.pagination?.totalPages ?? 1)
            } else {
                setContent([])
            }
        })()
        ;(async() => {
            if(actualRoute.category) {
                const getCategory = await getCategoryWithFields(actualRoute?.category?.id, {
                    id_country: actualRoute.country?.id,
                    id_city: actualRoute.city?.id,
                    id_region: actualRoute.region?.id,
                })
                if(getCategory) {
                    setTitle(getCategory.sub_title)
                    setDescription(getCategory.description)
                } else {
                    setTitle(actualRoute.category.sub_title)
                    setDescription(actualRoute.category.description)
                }
            }
        })()

        if(actualRoute.category?.id_parent) {
            // setIsSubCat(true)
            const parentCategory = taxonomies?.categories?.find(cat => (cat.id == actualRoute.category?.id_parent))
            const subCat = taxonomies.categories?.filter( cat => (cat.id_parent == parentCategory?.id) )
            setParentCat(parentCategory)
            setSubCategories(subCat)
        } else {
            // setIsSubCat(false)
            const parentCategory = actualRoute.category
            setParentCat(parentCategory)
            setSubCategories(taxonomies?.categories?.filter(cat => (cat.id_parent == actualRoute.category?.id)));
        }
        // setShouldQuery(false)
        // const theTitle = actualRoute.category?.sub_title
        // const theDescription = actualRoute.category?.description
        // setTitle(theTitle)
        // setDescription(theDescription)
        // setSubCategories(taxonomies?.categories?.filter(cat => (cat.id_parent == actualRoute.category?.id)))
    }, [actualRoute, searchPage, clientChange])

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
    // const subCatClickHandler = (subCat: number) => {
    //     if(`${subCat}` == searchParams.get('subcategory')) return
    //     if(subCat == 0) {
    //         setSearchParams('subcategory')
    //         setIsClient(true)
    //         return
    //     }
    //     setIsClient(true)
    //     // setSearchParams(`subcategory=${subCat}`)
    //     setSearchParams(prev => {
    //         const newSearchParams = new URLSearchParams(prev)
    //         newSearchParams.set('subcategory', `${subCat}`)
    //         return newSearchParams
    //     })
    //     return
    // }
    const tagClickHandler = (subCat: number) => {
        if(`${subCat}` == searchParams.get('tag')) {
            setSearchParams('tag')
            setIsClient(true)
            return
        }
        if(subCat == 0) {
            setSearchParams('tag')
            setIsClient(true)
            return
        }
        setIsClient(true)
        // setSearchParams(`tag=${subCat}`)
        setSearchParams(prev => {
            const newSearchParams = new URLSearchParams(prev)
            newSearchParams.set('tag', `${subCat}`)
            return newSearchParams
        })
        return
    }
    // console.log(parentCat)
    const subCategoriesRender = () => {
        if(!subCategories?.length || !subCategories || isTrending) return
        return (
            <>
            <div className="flex mb-10 border-b border-b-[#BDBDBD]">
                {!!parentCat &&
                    <Link className={`px-5 py-3 cursor-pointer text-front-small ${actualRoute.category?.id == parentCat?.id ? 'is-active text-front-red' : 'text-[#4B4B4B]'}`} to={`${getLocationRouteUrl()}/${parentCat.slug_title}`}>{parentCat.title}</Link>
                }
                {subCategories.map(subCat => (
                    <>
                        <Link className={`px-5 py-3 cursor-pointer text-front-small ${actualRoute.category?.id == subCat.id ? 'is-active text-front-red' : 'text-[#4B4B4B]'}`} to={`${getLocationRouteUrl()}/${subCat.slug_title}`}>{subCat.title}</Link>
                    </>
                ))}
                {/* <div onClick={() => {subCatClickHandler(0)}} className={`px-5 py-3 cursor-pointer text-front-small ${currentCat == theCategory?.id ? 'is-active text-front-red' : 'text-[#4B4B4B]'}`}>{theCategory?.title}</div> */}
                {/* {subCategories?.map(cat => {
                    return (
                        <div onClick={() => {subCatClickHandler(cat.id)}} className={`px-5 py-3 cursor-pointer text-front-small ${`${cat.id}` == searchParams.get('subcategory') ? 'is-active text-front-red' : 'text-[#4B4B4B]'}`}>{cat.title}</div>
                    )
                })} */}
            </div>
            </>
        )
    }

    const tagsRender = () => {
        if(isTrending) return
        return (
            <>
            <div className="mb-10 overflow-x-auto outer">
                <div className="grid justify-center grid-cols-8 pb-10 gap-x-8 gap-y-10 w-max md:w-full">
                    {
                        tags?.map((tag) => {
                            // if(i % 2 == 0) return
                            return (
                                <>
                                    <div className={`item tag-wrapper tag-selector cursor-pointer ${tag.id == currentTag ? 'active' : ''}`} onClick={(() => {tagClickHandler(tag.id)})}>
                                        <div className="mb-5 text-center image-wrapper">
                                            <img src={`${API_URL}/${tag.icon}`} className="w-[70px] h-[70px] mx-auto rounded-full bg-[#D9D9D9]" alt="" />
                                        </div>
                                        <div className="text-center text-wrapper">
                                            <p className="text-front-small">{tag.name}</p>
                                        </div>
                                    </div>
                                </>
                            )
                        })
                    }
                </div>
            </div>
            </>
        )
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
                            <div className={'lg:col-span-3 md:col-span-4 col-span-12'}>
                                <ArticleItem article={article} tag={getTagById(theTag) ?? undefined} />
                            </div>
                        </>
                    )
                })
            )
        }
        return (
            <div className="flex items-center justify-center col-span-12 font-serif">No article for this category</div>
        )
    }

    return (
        <>
            <Helmet>
                <title>{isTrending ? 'Trending' : ''}{actualRoute.category?.title ?? ''} - essentialbali</title>
                <meta name="description" content="essentialbali is the ultimate Bali area guide for travelers, expats, and locals, featuring the best dining, events, schools, wellness, and travel in Bali" />
            </Helmet>
            <section className="py-12 bg-front-icewhite">
                <div className="container">
                    <div className="mb-12 ads-wrapper">
                        {/* <Advertisement /> */}
                    </div>
                    <div className="grid grid-cols-12 mb-12">
                        <div className="col-span-12 md:col-span-10 md:col-start-2">
                            <div className="mb-4 text-center title-wrapper">
                                <p className="font-serif text-front-hero">{title}</p>
                            </div>
                            <div className="text-center description-wrapper">
                                <p className="">{description}</p>
                            </div>
                        </div>
                    </div>
                    {subCategoriesRender()}
                    {tagsRender()}
                    <div className="grid grid-cols-12 gap-5" ref={containerRef}>
                        {renderArticle()}
                    </div>
                    <div className="flex items-center justify-center py-8 pagination-wrapper gap-x-4">
                        <RenderPagination pages={generatePagination(currentPage, totalPages)} currentPage={currentPage} onClick={clickPagingHandler}  />
                    </div>
                </div>
                <div className="py-8 mt-6 newsletter-wrapper bg-front-icewhite">
                    <Newsletter />
                </div>
            </section>
        </>
    )
}

export default Directory