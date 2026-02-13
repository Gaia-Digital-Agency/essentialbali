import useArticle from "../../hooks/useArticle";
import { ArticleApiResponseProps } from "../../types/article.type";
import { Link } from "react-router-dom";
import Image from "./Image";
import TextLink from "./TextLink";
import { useTaxonomies } from "../../context/TaxonomyContext";
// import Skeleton from "react-loading-skeleton";
type TrendingsProps = {
    content: Array<ArticleApiResponseProps | undefined | 0>,
    admin?: boolean
}

type TrendingMainProps = {
    content: ArticleApiResponseProps | undefined | 0,
    title: string,
    admin?: boolean
}

export const Trendings: React.FC<TrendingsProps> = ({content, admin = false}) => {
    const {getCityById, getCountryById} = useTaxonomies()
    const {getFeaturedImageUrl, getPermalink} = useArticle()

    const renderArticle = (article: ArticleApiResponseProps | undefined | 0, i: number) => {
        if(article) {
            return (
                <div className={`md:col-span-6 lg:col-span-3 col-span-12 relative${(i + 1) < content.length ? ' line-right-5' : ''}`} key={`trendings-${i}`}>
                    <div className="inner grid grid-cols-12 gap-x-6 md:gap-x-0">
                        <div className="col-span-6 md:col-span-12">
                            <div className="image-wrapper md:mb-10">
                                <Image url={getFeaturedImageUrl(article)} ratio="100%" link={admin ? undefined : getPermalink(article)} alt={article?.featured_image_alt} />
                            </div>
                        </div>
                        <div className="col-span-6 md:col-span-12">
                            <div className="location-wrapper mb-2">
                                <p className="text-front-body text-front-red">{getCityById(article?.id_city) ? getCityById(article.id_city)?.name : getCountryById(article.id_country)?.name}</p>
                            </div>
                            <div className="text-wrapper">
                                <Link to={admin ? '' : getPermalink(article)}>
                                    <p className="text-front-title font-serif">{article.title}</p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )
        } else {
            return <></>
        }
    }
    return (
        <>
        <div className="container">
            <div className="grid grid-cols-12 md:gap-x-10 gap-y-10 md:overflow-x-hidden md:overflow-y-visible pb-2 py-8 md:py-0">
                {content.map((article, i) => {
                    return renderArticle(article, i)
                })}
            </div>
        </div>
        </>
    )
}


export const TrendingMain: React.FC<TrendingMainProps> = ({title, content, admin = false}) => {
    const {getCategoryById} = useTaxonomies()
    const {getPermalink, getFeaturedImageUrl} = useArticle()
    const getCategory = (id: number) => {
        return getCategoryById(id)
    }
    if(content) {
        return (
            <>
            <div className="md:container mx-auto !px-0 md:!px-7">
                <div className="title-wrapper text-center mb-8">
                    <h3 className="text-front-section-title font-serif font-semibold">Trending in <span className="text-front-red">{title}</span></h3>
                </div>
                <div className="trending-main-wrapper md:mb-6">
                    <div className="grid grid-cols-12 items-center">
                        <div className="md:col-span-6 col-span-12">
                            <div className="image-wrapper">
                                <Image url={getFeaturedImageUrl(content)} ratio="110%" link={admin ? undefined : getPermalink(content)} alt={content?.featured_image_alt} />
                            </div>
                        </div>

                        <div className="md:col-span-6 col-span-12 h-full">
                            <div className="text-wrapper px-10 py-8 text-center h-full flex flex-col justify-center bg-front-light-grey">
                                <div className="category-wrapper mb-6">
                                    <Link to={admin ? '' :`${getCategory(content.category_id)?.slug_title}`}>
                                        <p className="text-front-body text-front-red uppercase before-red-line inline">{getCategory(content.category_id)?.title}</p>
                                    </Link>
                                </div>
                                <div className="article-title-wrapper mb-3">
                                    <Link to={admin ? '' : getPermalink(content)}>
                                        <p className="text-front-black text-front-main-title font-serif">{content.title}</p>
                                    </Link>
                                </div>
                                <div className="article-description-wrapper mb-3">
                                    <Link to={admin ? '' : getPermalink(content)}>
                                        <p className="text-front-black text-front-body-big">{content.sub_title}</p>
                                    </Link>
                                </div>
                                <div className="text-link-wrapper">
                                    <TextLink text="READ MORE" link={admin ? '' : getPermalink(content)}></TextLink>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
            </>
        )
    } else {
        return (
            <>loading</>
        )
    }
}