import React, {useEffect, useRef, useState} from "react";
import { ArticleProps } from "../../../types/article.type";
import { getArticleByFields } from "../../../services/article.service";
import { useRoute } from "../../../context/RouteContext";
import Advertisement from "../../../components/front/Advertisement";
import { useTaxonomies } from "../../../context/TaxonomyContext";
import { getCategoryWithFields } from "../../../services/category.service";
import Image from "../../../components/front/Image";
import { formatPublished } from "../../../lib/utils/format";
import TextLink from "../../../components/front/TextLink";
import Button from "../../../components/front/Button";
import Newsletter from "../../../components/front/Newsletter";
import gsap from "gsap";
import { Checkbox, CheckboxGroup, DateRangePicker, RangeSlider, Whisper, Tooltip, Radio } from "rsuite";
import "rsuite/RangeSlider/styles/index.css";
import "rsuite/DateRangePicker/styles/index.css";
import "rsuite/Checkbox/styles/index.css";
import "rsuite/CheckboxGroup/styles/index.css";
import "rsuite/Tooltip/styles/index.css";
import "rsuite/Radio/styles/index.css";
import { Link, useLocation, useSearchParams } from "react-router";
import { Category } from "../../../types/category.type";
import pkg from "../../../lib/utils/Helmet"
const {Helmet} = pkg
const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || API_URL

const generateImageUrl = (image: string | undefined, id: number) => {
    if(image) {
        return `${IMAGE_URL}/${image}`
    }
    return `https://picsum.photos/id/${id*10}/1920/1080`
}

const ArticleCard: React.FC<{article: ArticleProps & {createdAt?: string}}> = ({article}) => {
    const {getCountryById, getCategoryById} = useTaxonomies()
    const generateUrl = (article: ArticleProps) => {
        return `/${getCountryById(article.id_country)?.slug}/${getCategoryById(article.category_id)?.slug_title}/${article.slug}`
    }
    return (
        <>
            <div className="grid grid-cols-12 mb-16 gap-y-12 lg:gap-x-6">
                <div className="lg:col-span-6 col-span-12 order-2 lg:order-1">
                    <div className="date-wrapper mb-2 flex gap-x-4">
                        <div className="item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="14" viewBox="0 0 15 14" fill="none">
                                <path d="M1.125 4.14229C1.125 3.17103 1.91236 2.38367 2.88362 2.38367H12.1164C13.0877 2.38367 13.875 3.17103 13.875 4.14229V11.6164C13.875 12.5877 13.0877 13.375 12.1164 13.375H2.88362C1.91236 13.375 1.125 12.5877 1.125 11.6164V4.14229Z" stroke="#7F7F7F" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M3.98267 0.624878V3.70246" stroke="#7F7F7F" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M11.0173 0.624878V3.70246" stroke="#7F7F7F" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M3.76294 5.90027H11.2371" stroke="#7F7F7F" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div className="item">
                            <p className="text-front-small text-[#a9a9a9]">{formatPublished(article?.meta_data?.start_date) ?? 'TBA'}</p>
                        </div>
                    </div>
                    <div className="title-wrapper mb-6">
                        <p className="text-front-article-title font-serif">{article.title}</p>
                    </div>
                    <div className="subtitle-wrapper mb-6">
                        <p>{article.sub_title}</p>
                    </div>
                    <div className="button-wrapper">
                        <TextLink link={generateUrl(article)} color="gray" text="READ MORE" />
                    </div>
                </div>
                <div className="lg:col-span-6 col-span-12 order-1 lg:order-2">
                    <div className="image-wrapper">
                        <Image link={generateUrl(article)} url={generateImageUrl(article.featured_image_url, article.id)} />
                    </div>
                </div>
            </div>
        </>
    )
}

type TimeProps = 'morning' | 'afternoon' | 'night';



const Events: React.FC = () => {
    const [content, setContent] = useState<ArticleProps[]>([])
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalPage, setTotalPage] = useState<number>(1)
    const [title, setTitle] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [minPrice, setMinPrice] = useState<number>(0)
    const [maxPrice, setMaxPrice] = useState<number>(5000)
    const [filterDays, setFilterDays] = useState<any>([])
    const [time, setTime] = useState<TimeProps | undefined>(undefined)
    const [filterDate, setFilterDate] = useState<Array<string> | undefined>([])
    // const [activeSubCat, setActiveSubCat] = useState<Category | undefined>(undefined)
    // const [theCategory, setTheCategory] = useState<Category>()
    const {actualRoute, getLocationRouteUrl} = useRoute()
    const {taxonomies} = useTaxonomies()
    const [searchParams, setSearchParams] = useSearchParams()
    const [availableSubCat, setAvailableSubCat] = useState<Category[]>() 
    const CATEGORY_SLUG = 'events'
    // const theCategory = taxonomies.categories?.find(cat => (cat.slug_title == CATEGORY_SLUG))
    const parentCat = taxonomies.categories?.find(cat => (CATEGORY_SLUG == cat.slug_title))
    const theCategory = actualRoute.category
    const filterWrapperRef = useRef<HTMLDivElement>(null)
    // const availableSubCat = taxonomies.categories?.filter(cat => (cat.id_parent == theCategory?.id))
    const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    const contentWrapperRef = useRef<HTMLDivElement>(null)

    const {search} = useLocation()
    useEffect(() => {
        const contentWrapperEl = contentWrapperRef.current
        if(contentWrapperEl) {
            window.scrollTo(0,contentWrapperEl.offsetTop);
        }
        const sub = taxonomies.categories?.filter(cat => (cat.id_parent == parentCat?.id))
        setAvailableSubCat(sub)
    }, [actualRoute])

    useEffect(() => {
        // const subCat = searchParams.get('subcat')
        // if(subCat) {
        //     setActiveSubCat(taxonomies.categories?.find(cat => (`${cat.id}` == subCat)) ?? undefined)
        // } else {
        //     setActiveSubCat(undefined)
        // }
        const minPriceParams = searchParams.get('minprice')
        if(minPriceParams) {
            setMinPrice(Number(minPriceParams))
            setMinPrice(0)
        }
        const maxPriceParams = searchParams.get('maxprice')
        if(maxPriceParams) {
            setMaxPrice(Number(maxPriceParams))
        } else {
            setMaxPrice(5000)
        }

        const timeParams = searchParams.get('time')
        if(timeParams) {
            setTime((timeParams as TimeProps))
        } else {
            setTime(undefined)
        }

        const dateParams = searchParams.get('date')
        if(dateParams) {
            // setFilterDate(dateParams)
        }
        const dayParams = searchParams.getAll('day[]')
        if(dayParams) {
            setFilterDays(dayParams)
        } else {
            setFilterDays([])
        }


    }, [searchParams, actualRoute])
    useEffect(() => {
        (async() => {
            const params = new URLSearchParams()
            const minPriceParams = searchParams.get('minprice')
            const maxPriceParams = searchParams.get('maxprice')
            const timeParams = searchParams.get('time')
            const dateParams = searchParams.get('date')
            const dayParams = searchParams.getAll('day[]')
            const subParams = searchParams.get('subcat')
            if(minPriceParams) params.append('metaData_price[]', minPriceParams);
            if(maxPriceParams) params.append('metaData_price[]', maxPriceParams);
            if(dateParams) params.append('metaData_date', dateParams);
            if(subParams) {
                params.append('category', `${subParams}`)
            } else {
                params.append('category', `${theCategory?.id}`)
            }
            if(timeParams) {
                switch (timeParams) {
                    case "morning" :
                        params.append('metaData_start_time', '06:00');
                        params.append('metaData_end_time', '12:00');
                        break;
                    case "afternoon" :
                        params.append('metaData_start_time', '12:00');
                        params.append('metaData_end_time', '18:00');
                        break;
                    case "night" :
                        params.append('metaData_start_time', '18:00');
                        params.append('metaData_end_time', '24:00');
                        break;
                }
            }
            if(dayParams) {
                dayParams.forEach(day => {
                    params.append('metaData_multi_day[]', day);
                });
            }
            const getArticle = await getArticleByFields({
                id_country: actualRoute.country?.id,
                id_city: actualRoute.city?.id,
                id_region: actualRoute.region?.id,
                // category: theCategory?.id,
                limit: 4,
                page: currentPage
            }, params)

            if(getArticle?.articles) {
                if(getArticle?.pagination?.page == 1) {
                    setContent(getArticle.articles)
                } else {
                    setContent(prev => {
                        const newUniqueArticles = getArticle.articles.filter(newArticle =>
                            !prev.some(prevArticle => prevArticle.id === newArticle.id)
                        );
                        const newArticle = newUniqueArticles.map(article => ({...article}))
                        return [...prev, ...newArticle];
                    });
                }
            } else {
                setContent([])
            }
            if(getArticle?.pagination) {
                setTotalPage(getArticle.pagination.totalPages)
            } else {
                setTotalPage(1)
            }
            if(theCategory) {
                const getCategory = await getCategoryWithFields(theCategory?.id, {
                    id_country: actualRoute.country?.id,
                    id_city: actualRoute.city?.id,
                    id_region: actualRoute.region?.id,
                })
                if(getCategory) {
                    setTitle(getCategory.sub_title)
                    setDescription(getCategory.description)
                }
            }
        })()
    }, [currentPage, actualRoute, searchParams])

    const pageClickHandler = () => {
        setCurrentPage(currentPage+1)
    }

    const renderButton = () => {
        if(totalPage <= currentPage) return
        return (
            <Button text="VIEW MORE" onClick={pageClickHandler} />
        )
    }

    useEffect(() => {
        const wrapperEl = filterWrapperRef.current
        if(!wrapperEl) return

        const accordionClickHandler = (e: MouseEvent) => {
            const _box = e.currentTarget as HTMLElement
            const box = _box.parentNode as HTMLDivElement
            const content = box.querySelector('.content-wrapper')
            if(!content) return
            const isOpen = box.classList.contains('open')
            if(isOpen) {
                gsap.to(content, {
                    height: '0'
                })
                box.classList.remove('open')
            } else {
                gsap.to(content, {
                    height: 'auto'
                })
                box.classList.add('open')
            }
        }

        const boxes = wrapperEl.querySelectorAll<HTMLDivElement>('.box')
        boxes.forEach((box: HTMLDivElement) => {
            // box.getElementsByClassName('content.wrapper')
            const content = box.querySelector('.content-wrapper')
            if(content) gsap.set(content, {height: 0});
            box.classList.remove('open');
            (box.querySelector('.title') as HTMLDivElement)?.addEventListener('click', accordionClickHandler)
        })

        return () => {
            boxes.forEach((box: HTMLDivElement) => {
                (box.querySelector('.title') as HTMLDivElement)?.removeEventListener('click', accordionClickHandler)
            })
        }
    }, [])

    const formatPrice = () => {
        
        if(minPrice == maxPrice) {
            return (
                <>
                    {minPrice == 0 ? 'Free' : `$${minPrice}`}
                </>
            )
        }
        return (
            <>
                {`${minPrice == 0 ? 'Free' : `$${minPrice}`}`} - ${`${maxPrice}`}
            </>
        )
    }

    const applyFilterDate = () => {
        if(filterDate) {
            setSearchParams(prev => {
                const url = new URLSearchParams(prev)
                url.set('dates', filterDate[0] + ',' + filterDate[1])
                return url
            })
        } else {
            setSearchParams(prev => {
                const url = new URLSearchParams(prev)
                url.delete('date')
                return url
            })
        }
        if(filterDays) {
            setSearchParams(prev => {
                const url = new URLSearchParams(prev)
                url.delete('day[]')
                filterDays.forEach((day: string) => {
                    url.append('day[]', day)
                })
                return url
            })
        } else {
            setSearchParams(prev => {
                const url = new URLSearchParams(prev)
                url.delete('day[]')
                return url
            })
        }
    }

    const applyTimeFilter = (time?: TimeProps | undefined) => {
        if(time) {
            setSearchParams(prev => {
                const url = new URLSearchParams(prev)
                url.set('time', time)
                return url
            })
        } else {
            setSearchParams(prev => {
                const url = new URLSearchParams(prev)
                url.delete('time')
                return url
            })
        }
    }

    const applyPriceFilter = () => {
        setSearchParams(prev => {
            const url = new URLSearchParams(prev)
            url.set('minprice', `${minPrice}`)
            url.set('maxprice', `${maxPrice}`)
            return url
        })
    }

    // const applySubCatFilter = () => {
    //     setSearchParams(prev => {
    //         const url = new URLSearchParams(prev)
    //         url.set('subcat', `${activeSubCat?.id}`)
    //         return url
    //     })
    // }

    // useEffect(() => {
    //     applyTimeFilter()
    // }, [time])

    const clearAllFilter = () => {
        setTime(undefined)
        setFilterDate(undefined)
        setFilterDays([])
        setMaxPrice(5000)
        setMinPrice(0)
        // setActiveSubCat(undefined)
        setSearchParams()
    }

    return (
        <>
            <Helmet>
                <title>Events - essentialbali</title>
                <meta name="description" content="essentialbali is the ultimate Bali area guide for travelers, expats, and locals, featuring the best dining, events, schools, wellness, and travel in Bali" />
            </Helmet>
            <section>
                <div className="container py-16">
                    <Advertisement />

                    <div className="grid grid-cols-12 py-12" ref={contentWrapperRef}>
                        <div className="lg:col-span-6 col-span-12 lg:col-start-4 text-center">
                            <p className="font-serif text-front-hero mb-4">{title}</p>
                            <p className="text-front-body">{description}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 lg:gap-x-20 gap-y-12 py-12">
                        <div className="lg:col-span-3 col-span-12">
                            <div className="title-wrapper mb-12">
                                <p className="font-serif text-front-title">Filters</p>
                            </div>
                            <div className="filter-wrapper" ref={filterWrapperRef}>
                                    {
                                        !!availableSubCat?.length &&
                                            <div className="box py-5 cursor-pointer border-t border-[#9e9e9e]">
                                                <div className="flex justify-between items-center title mb-4">
                                                    <p className="">Event Category</p>
                                                    <p className="text-front-subtitle">+</p>
                                                </div>
                                                <div className="content-wrapper overflow-hidden">
                                                    <div className="inner py-2">
                                                        {!!parentCat && 
                                                        <div className={`mb-4 text-front-grey ${actualRoute.category?.id == parentCat.id ? 'text-front-red' : ''}`}>
                                                            <Link to={getLocationRouteUrl() + '/' + parentCat.slug_title + search}>All {parentCat.title}</Link>
                                                        </div>
                                                        }
                                                        {availableSubCat.map(cat => (
                                                            <div className={`mb-4 text-front-grey ${actualRoute.category?.id == cat.id ? 'text-front-red' : ''}`}> 
                                                                <Link to={getLocationRouteUrl() + '/' + cat.slug_title + search}>{cat.title}</Link>
                                                            </div>
                                                            // <Radio onClick={() => {setActiveSubCat(cat); applySubCatFilter()}} checked={activeSubCat?.slug_title == cat.slug_title} value={cat.slug_title}>{cat.title}</Radio>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        
                                    }
                                <div className="box py-5 cursor-pointer border-t border-[#9e9e9e]">
                                    <div className="flex justify-between items-center title">
                                        <p className="">Day</p>
                                        <div className="dropdown">
                                            <p className="text-front-subtitle">+</p>
                                        </div>
                                    </div>
                                    <div className="content-wrapper overflow-hidden">
                                        <div className="inner py-2">
                                            <DateRangePicker format="yyyy/MM/dd" value={filterDate ? [new Date(filterDate[0]), new Date(filterDate[1])] : null} onChange={e => {setFilterDate(e?.map(date => (date.toISOString().split('T')[0])))}} />
                                            <CheckboxGroup value={filterDays} onChange={value => setFilterDays([...value])}>
                                                {DAYS.map(day => (
                                                    <Checkbox value={day} className="capitalize">{day}</Checkbox>
                                                ))}
                                            </CheckboxGroup>
                                            <Button text="Apply filter" onClick={applyFilterDate}></Button>
                                        </div>
                                    </div>
                                </div>
                               <div className="box py-5 cursor-pointer border-t border-[#9e9e9e]">
                                    <div className="flex justify-between items-center title">
                                        <p className="">Time</p>
                                        <p className="text-front-subtitle">+</p>
                                    </div>
                                    <div className="content-wrapper overflow-hidden">
                                        <div className="inner py-2">
                                            <div className="flex flex-col">
                                                <Whisper followCursor speaker={<Tooltip>06.00-12.00</Tooltip>}>
                                                    <Radio onClick={() => {setTime('morning'); applyTimeFilter('morning')}} checked={time == 'morning'} value={'morning'}>Morning</Radio>
                                                </Whisper>
                                                <Whisper followCursor speaker={<Tooltip>12.00-18.00</Tooltip>}>
                                                    <Radio onClick={() => {setTime('afternoon'); applyTimeFilter('afternoon')}} checked={time == 'afternoon'} value={'afternoon'}>Afternoon</Radio>
                                                </Whisper>
                                                <Whisper followCursor speaker={<Tooltip>18.00-24.00</Tooltip>}>
                                                    <Radio onClick={() => {setTime('night'); applyTimeFilter('night')}} checked={time == 'night'} value={'night'}>Night</Radio>
                                                </Whisper>
                                            </div>
                                            <Button text="Clear filter" onClick={() => {setTime(undefined); applyTimeFilter()}}></Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="box py-5 cursor-pointer border-t border-[#9e9e9e]">
                                    <div className="flex justify-between items-center title">
                                        <p className="">Price</p>
                                        <p className="text-front-subtitle">+</p>
                                    </div>
                                    <div className="content-wrapper overflow-hidden">
                                        <div className="inner px-2 py-4">
                                            <RangeSlider min={0} max={5000} value={[minPrice, maxPrice]} onChange={e => {setMinPrice(e[0]); setMaxPrice(e[1])}} />
                                            <div className="confirm-box pt-6">
                                                <p className="mb-4">{formatPrice()}</p>
                                                <Button text="Apply filter" onClick={applyPriceFilter} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button text="Clear all filters" onClick={clearAllFilter}></Button>
                                {/* <div className="box py-5 cursor-pointer border-t border-[#9e9e9e]">
                                    <div className="flex justify-between items-center title">
                                        <p className="">Event Status</p>
                                        <p className="text-front-subtitle">+</p>
                                    </div>
                                    <div className="content-wrapper overflow-hidden">
                                        <div className="inner py-2">
                                            <p>1</p>
                                            <p>3</p>
                                            <p>2</p>
                                        </div>
                                    </div>
                                </div> */}
                            </div>
                        </div>
                        <div className="lg:col-span-9 col-span-12">
                            {content.map(article => <ArticleCard article={article} />)}
                            {!content.length && <>Article in this category is not found</>}
                        </div>
                    </div>
                    <div className="button-wrapper flex justify-center gap-x-6">
                        {renderButton()}
                        <Button text="SUBMIT YOUR EVENT" borderOnly={true} />
                    </div>
                </div>
                <div className="newsletter-wrapper bg-front-section-grey py-8 mt-6">
                    <Newsletter />
                </div>
            </section>
        </>
    )
}

export default Events