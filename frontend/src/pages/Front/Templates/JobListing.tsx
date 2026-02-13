import React, {useState, useEffect, PropsWithChildren} from "react";
import { getArticleByFields } from "../../../services/article.service";
import { useNavigate } from "react-router";
import { ArticleProps } from "../../../types/article.type";
import { useTaxonomies } from "../../../context/TaxonomyContext";
import { useRoute } from "../../../context/RouteContext";
import Image from "../../../components/front/Image";
import { timeAgo, getCurrencySymbol } from "../../../lib/utils/format";
import Button from "../../../components/front/Button";
import Newsletter from "../../../components/front/Newsletter";
import { Link } from "react-router";
import pkg from "../../../lib/utils/Helmet"
import { useTime } from "../../../context/TimeContext";
const {Helmet} = pkg

// const Spacer: React.FC = () => (<div className="spacer py-12"></div>)

const TagsBox: React.FC<{text: string | number}> = ({text}) => {

    return (
        <>
            <div className="px-2.5 py-1.5 bg-[#eee]">
                <p className="font-medium text-[#202020]">{text}</p>
            </div>
        </>
    )
}

const ArticleCard: React.FC<{article: ArticleProps & {createdAt?: string}}> = ({article}) => {
    const {getCategoryById, getCountryById} = useTaxonomies()
    const {initialData} = useTime()

    const generateUrl = (article: ArticleProps) => {
        return `/${getCountryById(article.id_country)?.slug}/${getCategoryById(article.category_id)?.slug_title}/${article.slug}`
    }
    let metadata
    if(typeof article?.meta_data == 'string') {
        metadata = JSON.parse(article?.meta_data)
    } else {
        metadata = article?.meta_data
    }
    if(article) {
        const salaryTime = () => {
            const salary = metadata?.salary_time
            if(salary) {
                return `${salary}`.slice(0, 1)
            }
            return 'm'
        }
        return (
            <>
                <div className="md:col-span-6 col-span-12">
                    <div className="inner py-8 px-6 border border-[#cecece]">
                        
                        <div className="title-wrapper flex items-center gap-x-5 mb-8">
                            <div className="image-wrapper w-[87px]">
                                <Image url={metadata?.company_logo ?? '/logo.png'} ratio="87px" link={generateUrl(article)} />
                            </div>
                            <div className="title-wrapper flex-1">
                                <div className="title">
                                    <p className="text-front-body-big font-bold uppercase">
                                        <Link to={generateUrl(article)} viewTransition>
                                            {article.title}
                                        </Link>
                                    </p>
                                    <p className="text-front-body-big text-[#767676]">{metadata?.company_name ?? 'Company A'} | {metadata?.company_location ?? 'Bali, Uluwatu'}</p>
                                </div>
                            </div>
                        </div>
    
                        <div className="tags-wrapper flex gap-x-2.5 mb-2.5">
                            <TagsBox text={metadata?.job_type ?? 'Fulltime'} />
                            <TagsBox text={metadata?.experience ? `${metadata.experience} Years` : '1 Years'} />
                        </div>
                        <div className="date-wrapper mb-10">
                            <p className="text-[#767676] text-front-small">{timeAgo(article.createdAt, initialData)}</p>
                        </div>

                        <div className="footer-wrapper flex justify-between items-end">
                            <div className="item">
                                <p className="">
                                    <span className="text-[22px] text-front-red font-bold">
                                        {getCurrencySymbol(metadata?.salary_currency ?? 'USD')}
                                        {metadata?.salary_range ?? '1000'}
                                    </span>
                                    <span className="text-front-small">
                                        /{salaryTime()}
                                    </span>
                                </p>
                            </div>
                            <div className="item">
                                <Button borderOnly={true} text="APPLY NOW" link={generateUrl(article)} />
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}

const JobListing: React.FC<PropsWithChildren> = ({children}) => {
    const {actualRoute} = useRoute()
    const {taxonomies} = useTaxonomies()
    const [content, setContent] = useState<ArticleProps[]>([])
    const [page, setPage] = useState<number>(1)
    const [totalPage, setTotalPage] = useState<number>(0)
    const [title, setTitle] = useState<string>()
    const [description, setDescription] = useState<string>()
    const CATEGORY_SLUG = 'job-listing'
    const LIMIT_ARTICLE = 6
    const theCategory = taxonomies?.categories?.find(cat => (cat.slug_title == CATEGORY_SLUG))
    const navigate = useNavigate()


    useEffect(() => {
        (async () => {
            const getArticle = await getArticleByFields({
                id_country: actualRoute?.country?.id,
                id_city: actualRoute?.city?.id,
                id_region: actualRoute?.region?.id,
                limit: LIMIT_ARTICLE,
                page: page,
                category: theCategory?.id,
            })
            if(getArticle?.articles) {
                setContent(prev => {
                    const newUniqueArticles = getArticle.articles.filter(newArticle =>
                        !prev.some(prevArticle => prevArticle.id === newArticle.id)
                    );
                    return [...prev, ...newUniqueArticles];
                });

                setTotalPage(getArticle.pagination?.totalPages ?? 1)
            }
        })()
        setTitle(theCategory?.sub_title)
        setDescription(theCategory?.description)
    }, [taxonomies, actualRoute, page])

    // useEffect(() => {
    //     if(transition) return
    //     if(isTransitioning) {
    //         setTransition (true)
    //     }
    // }, [isTransitioning])

    const moreClickHandler = () => {
        setPage(page+1)
    }

    const renderChildren = () => {
        if(children) {
            return (
                <>
                    <div className="fixed z-[100] inset-0 transition">
                        <div className="absolute overlay z-[100] inset-0 bg-[rgba(12,12,12,.4)]" onClick={() => {navigate('..', {relative: 'path', viewTransition: true})}}></div>
                        <div className="absolute rounded-xl z-[100] max-h-[90vh] overflow-scroll left-0 right-0 bottom-0">
                            {children}
                        </div>
                    </div>
                </>
            )
        }
    }
    return (
        <>
            <Helmet>
                <title>Job Listing - essentialbali</title>
            </Helmet>
            <div className="image-wrapper mb-10">
                <Image url="/logo.png" ratio="38%" />
            </div>
            <div className="page-container py-10">
                <div className="container mb-24">
                    <div className="grid grid-cols-12 mb-20">
                        <div className="col-span-6 col-start-4 text-center">
                            <p className="font-serif text-front-hero mb-4">{title}</p>
                            <p className="text-front-body">{description}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-12 gap-5 mb-16">
                        {content?.map(article => <ArticleCard article={article} />)}
                    </div>
                    {
                        totalPage > page &&
                        <div className="button-wrapper text-center">
                            <Button text="VIEW MORE" onClick={moreClickHandler} />
                        </div>
                    }
                </div>
                <div className="outer bg-front-section-grey py-8">
                    <Newsletter />
                </div>
            </div>
            {renderChildren()}
        </>
    )
}
export default JobListing