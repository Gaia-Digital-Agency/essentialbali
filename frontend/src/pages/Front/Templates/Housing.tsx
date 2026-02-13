import React, {useState, useEffect} from "react"
import { getArticleByFields } from "../../../services/article.service"
import Image from "../../../components/front/Image"
import { useRoute } from "../../../context/RouteContext"
import { useTaxonomies } from "../../../context/TaxonomyContext"
import { ArticleProps } from "../../../types/article.type"
import { useSearchParams } from "react-router"
import { generatePagination } from "../../../lib/utils/pagination"
import { Link } from "react-router"
import pkg from "../../../lib/utils/Helmet"
const {Helmet} = pkg
const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || API_URL

type PaginationProps = {page: Array<string | number> | number | string, currentPage: number, onClick: (pag: number) => void}

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

const Housing: React.FC = () => {
    const rentalType = ["daily", "monthly", "yearly"]

    const {actualRoute} = useRoute()
    const {getCountryById, getCategoryById} = useTaxonomies()
    const [content, setContent] = useState<ArticleProps[]>()
    const [title, setTitle] = useState<string>()
    const [description, setDescription] = useState<string>()
    const [totalPages, setTotalPages] = useState<number>(1)

    const [searchParams, setSearchParams] = useSearchParams()

    const searchPage = searchParams.get('page')
    const currentPage = searchPage ? parseInt(searchPage) : 1

    const searchType = searchParams.get('type')
    const currentType = searchType

    // const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    const generateImageUrl = (image: string | undefined, id: number) => {
        if(image) {
            return `${IMAGE_URL}/${image}`
        }
        return `https://picsum.photos/id/${id*10}/1920/1080`
        // return '#'
    }

    const generateUrl = (article: ArticleProps) => {
        return `/${getCountryById(article.id_country)?.slug}/${getCategoryById(article.category_id)?.slug_title}/${article.slug}`
    }

    const isType = currentType ? {metaData_rentaltype: currentType} : {}
    const queryData = {
        id_country: actualRoute.country?.id,
        id_city: actualRoute.city?.id,
        id_region: actualRoute.region?.id,
        category: actualRoute.category?.id,
        limit: 6,
        page: currentPage,
        ...isType
    }

    useEffect(() => {
        (async () => {
            const getArticle = await getArticleByFields(queryData)
            if(getArticle?.articles) {
                setContent(getArticle.articles)
            } else {
                setContent([])
            }
            if(getArticle?.pagination) {
                setTotalPages(getArticle.pagination.totalPages)
            } else {
                setTotalPages(1)
            }
        })()
    }, [searchParams, actualRoute])

    useEffect(() => {
        setTitle(actualRoute.category?.sub_title)
        setDescription(actualRoute.category?.description)
    }, [actualRoute])

    const clickPagingHandler = (page: number) => {
        if(page > totalPages || page <= 0) return
        setSearchParams(`page=${page}`)
    }

    const clickTypeHandler = (type: string) => {
        if(type == currentType) {
            setSearchParams('type')
            return
        }
        setSearchParams(`type=${type}`)
    }

    return (
        <>
            <Helmet>
                <title>Housing - essentialbali</title>
            </Helmet>
            <section>
                <div className="image-wrapper mb-10">
                    <Image url="/logo.png" ratio="38%" alt="hero image housing" />
                </div>
                <div className="container">
                    <div className="grid grid-cols-12 mb-16">
                        <div className="md:col-span-10 md:col-start-2 col-span-12">
                            <div className="title-wrapper text-center mb-4">
                                <p className="font-serif text-front-hero">{title}</p>
                            </div>
                            <div className="description-wrapper text-center">
                                <p className="">{description}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex rent-type-wrapper gap-x-4 mb-10 pb-6 border-b border-b-front-black">
                        {rentalType.map(type => (
                            <div onClick={() => {clickTypeHandler(type)}} className={`box cursor-pointer py-3 px-8 text-front-small uppercase ${ type == currentType ? 'font-bold bg-front-red text-white' : 'border border-front-black' }`}>
                                {type} Rental
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-12 gap-8">
                        {
                            content?.map(article => (
                                <div className="md:col-span-4 col-span-12">
                                    <div className="inner shadow-xl">
                                        <div className="image-wrapper">
                                            <Image url={generateImageUrl(article.featured_image_url, article.id)} ratio="92%" link={generateUrl(article)} alt={article?.featured_image_alt} />
                                        </div>
                                        <div className="text-wrapper p-5">
                                            <div className="price-wrapper mb-2.5">
                                                <div className="box px-8 py-3 inline-block border border-front-red text-front-red text-front-small">
                                                    FROM {article.meta_data?.start_price ?? 'IDR 123.456'}
                                                </div>
                                            </div>
                                            <div className="title-wrapper mb-6">
                                                <p className="text-front-body-big font-serif">
                                                    <Link to={generateUrl(article)}>
                                                        {article.title}
                                                    </Link>
                                                </p>
                                            </div>
                                            <div className="flex justify-between">

                                                <div className="item-meta flex gap-x-5">

                                                    <div className="item flex items-center gap-x-2">
                                                        <div className="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                                <g clip-path="url(#clip0_110_3663)">
                                                                    <path d="M15.8346 7.75V3.33333H13.3346V5.5L10.0013 2.5L1.66797 10H4.16797V16.6667H8.33464V11.6667H11.668V16.6667H15.8346V10H18.3346L15.8346 7.75ZM8.33464 8.33333C8.33464 7.41667 9.08464 6.66667 10.0013 6.66667C10.918 6.66667 11.668 7.41667 11.668 8.33333H8.33464Z" fill="#b56576"/>
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_110_3663">
                                                                        <rect width="20" height="20" fill="white"/>
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>
                                                        </div>
                                                        <div className="text">
                                                            <p className="text-front-small">{article.meta_data?.housing_type ?? 'Villa'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="item flex items-center gap-x-2">
                                                        <div className="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                                <g clip-path="url(#clip0_110_3669)">
                                                                    <path d="M16.668 8.33329V4.16663H3.33464V8.33329H1.66797V14.1666H2.7763L3.33464 15.8333H4.16797L4.7263 14.1666H15.2846L15.8346 15.8333H16.668L17.2263 14.1666H18.3346V8.33329H16.668ZM9.16797 8.33329H5.0013V5.83329H9.16797V8.33329ZM15.0013 8.33329H10.8346V5.83329H15.0013V8.33329Z" fill="#b56576"/>
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_110_3669">
                                                                        <rect width="20" height="20" fill="white"/>
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>
                                                        </div>
                                                        <div className="text">
                                                            <p className="text-front-small">{article.meta_data?.bedroom_amount ?? '2'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="item flex items-center gap-x-2">
                                                        <div className="icon">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                                <g clip-path="url(#clip0_111_3678)">
                                                                    <path d="M5.83464 7.49996C6.75511 7.49996 7.5013 6.75377 7.5013 5.83329C7.5013 4.91282 6.75511 4.16663 5.83464 4.16663C4.91416 4.16663 4.16797 4.91282 4.16797 5.83329C4.16797 6.75377 4.91416 7.49996 5.83464 7.49996Z" fill="#b56576"/>
                                                                    <path d="M16.668 10.8333V4.02496C16.668 2.72496 15.6096 1.66663 14.3096 1.66663C13.6846 1.66663 13.0846 1.91663 12.643 2.35829L11.6013 3.39996C11.468 3.35829 11.3263 3.33329 11.1763 3.33329C10.843 3.33329 10.5346 3.43329 10.2763 3.59996L12.5763 5.89996C12.743 5.64163 12.843 5.33329 12.843 4.99996C12.843 4.84996 12.818 4.71663 12.7846 4.57496L13.8263 3.53329C13.9513 3.40829 14.1263 3.33329 14.3096 3.33329C14.693 3.33329 15.0013 3.64163 15.0013 4.02496V10.8333H9.29297C9.04297 10.6583 8.81797 10.4583 8.60964 10.2333L7.44297 8.94163C7.28464 8.76663 7.08464 8.62496 6.86797 8.52496C6.60963 8.39996 6.3263 8.33329 6.03464 8.33329C5.0013 8.34163 4.16797 9.17496 4.16797 10.2083V10.8333H1.66797V17.5H3.33464V18.3333H16.668V17.5H18.3346V10.8333H16.668Z" fill="#b56576"/>
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_111_3678">
                                                                        <rect width="20" height="20" fill="white"/>
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>
                                                        </div>
                                                        <div className="text">
                                                            <p className="text-front-small">{article.meta_data?.bathroom_amount ?? '3'}</p>
                                                        </div>
                                                    </div>

                                                </div>

                                                <div className="location-wrapper flex gap-x-2 items-center">
                                                    <div className="icon">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none">
                                                            <g clip-path="url(#clip0_111_4342)">
                                                                <path d="M10.3307 9.99996C9.41406 9.99996 8.66406 9.24996 8.66406 8.33329C8.66406 7.41663 9.41406 6.66663 10.3307 6.66663C11.2474 6.66663 11.9974 7.41663 11.9974 8.33329C11.9974 9.24996 11.2474 9.99996 10.3307 9.99996ZM10.3307 1.66663C6.83073 1.66663 3.66406 4.34996 3.66406 8.49996C3.66406 11.2666 5.88906 14.5416 10.3307 18.3333C14.7724 14.5416 16.9974 11.2666 16.9974 8.49996C16.9974 4.34996 13.8307 1.66663 10.3307 1.66663Z" fill="#323232"/>
                                                            </g>
                                                            <defs>
                                                                <clipPath id="clip0_111_4342">
                                                                    <rect width="20" height="20" fill="white" transform="translate(0.332031)"/>
                                                                </clipPath>
                                                            </defs>
                                                        </svg>
                                                    </div>
                                                    <div className="text-wrapper">
                                                        <p className="text-front-small">{article.meta_data?.location ?? 'Ubud'}</p>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>

                    <div className="pagination-wrapper flex justify-center gap-x-4 py-8 items-center">
                        <RenderPagination page={generatePagination(currentPage, totalPages)} currentPage={currentPage} onClick={clickPagingHandler}  />
                    </div>
                </div>
            </section>
        </>
    )
}

export default Housing