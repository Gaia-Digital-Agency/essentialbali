import React, { useEffect, useState} from "react"
import { CustomVerticalTabs, CustomVerticalTabsChild } from "../../../components/ui/tabs/CustomVerticalTabs"
import { getLocationsByParentID, getLocationByID } from "../../../services/location.service"
import { useNavigate, useOutletContext, useParams, useSearchParams } from "react-router"
import { ArticleProps } from "../../../types/article.type"
import { deleteArticle, getArticleByFields } from "../../../services/article.service"
import { Link } from "react-router"
import { JSX } from "@fullcalendar/core/preact.js"
import Button from "../../../components/ui/button/Button"
import Select from "../../../components/form/Select"
import { Category } from "../../../types/category.type"
import { getAllCategory } from "../../../services/category.service"
import { generatePagination } from "../../../lib/utils/pagination"
import { useAuth } from "../../../context/AuthContext"
import { ContextPageAdminButtonText } from "../../../layout/ArticleAdmin"

type BaseLocationProps = {
    id: number,
    name: string,
    slug: string,
    articles?: ArticleProps[] | undefined,
    totalPages?: number
    // id_parent: number,
    // name_parent: string
}

interface LocationProps extends BaseLocationProps {
    child?: BaseLocationProps[]
}

interface RenderArticleProps extends ArticleProps {
    name_country?: string,
    name_city?: string,
    name_region?: string
}

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



const RenderArticle = ({article, onClick, category}: {article: RenderArticleProps, onClick: () => void, category?: Category | undefined}) => {

    return (
        <>
            <div className="article-post p-6 shadow rounded flex justify-between items-center">
                <div className="inner">
                    <div className="title-wrap">
                        <p className="text-xl">{article.title}</p>
                    </div>
                    <div className="attr-wrap">
                        <p className="text-md">{article.name_country} / {article?.name_city} / {article?.name_region} - <span className="text-sm text-front-gray">{article.status}</span></p>
                    </div>
                    {
                        category &&
                        <div className="category-wrap">
                            <p className="text-md text-front-red">{category.title}</p>
                        </div>
                    }
                </div>
                <div className="action flex items-center gap-x-4">
                    <Button className="bg-red-600" onClick={onClick}>Remove</Button>
                    {/* <Button> */}
                        <Link className="px-5 py-3.5 text-sm inline-flex items-center justify-center gap-2 rounded-lg transition bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300" to={`/admin/mst_article/edit/${article.id}`}>Edit</Link>
                    {/* </Button> */}
                </div>
            </div>
        </>
    )
}
const FormArticle: React.FC = () => {
    const {setPageAdminButtonText} = useOutletContext<ContextPageAdminButtonText>()
    const [ stateCountry, setStateCountry ] = useState<BaseLocationProps>()
    const [cities, setCities] = useState<LocationProps[]>([]);
    const { country } = useParams();
    const [availableCategories, setAvailableCategories] = useState<Category[]>()
    const [searchParams, setSearchParams] = useSearchParams()
    const {userDetails} = useAuth()
    const navigate = useNavigate()
    const searchPage = searchParams.get('page')
    const currentPage = searchPage ? parseInt(searchPage) : 1
    const LIMIT = 25


    useEffect(() => {
        setPageAdminButtonText('Add Article')
        if (!country) return;
        const urlCat = searchParams.get('category')
        let category = undefined
        if(urlCat) {
            category = typeof urlCat == 'string' ? parseInt(urlCat) : urlCat
        }
        const fetchAllData = async () => {
            try {

                const countryRes = await getLocationByID('country', parseInt(country))
                if(countryRes.status_code !== 200 || !countryRes.data) {
                    return
                }
                const dataCountry = countryRes.data
                const getArticleFromCountry = await getArticleByFields({id_country: parseInt(country), status: ['draft', 'published'], category: category, page: currentPage, limit: LIMIT})
                if(getArticleFromCountry?.articles) {
                    setStateCountry({id: dataCountry.id, name: dataCountry.name, slug: dataCountry.slug, articles: getArticleFromCountry.articles, totalPages: getArticleFromCountry.pagination?.totalPages})
                } else {
                    setStateCountry({id: dataCountry.id, name: dataCountry.name, slug: dataCountry.slug, articles: []})
                }

                const cityRes = await getLocationsByParentID('city', parseInt(country));
                if (cityRes.status_code !== 200 || !cityRes.data) {
                    return;
                }
                
                const initialCities: LocationProps[] = cityRes.data;

                const cityDataPromises = initialCities.map(async (city) => {
                    const regionsPromise = getLocationsByParentID('region', city.id);
                    const cityArticlesPromise = getArticleByFields({ id_city: city.id, id_country: parseInt(country), status: ['draft', 'published'], category: category, limit: LIMIT, page: currentPage });
                    
                    const [regionsRes, cityArticlesRes] = await Promise.all([regionsPromise, cityArticlesPromise]);
                    
                    let regions: LocationProps[] = [];
                    if (regionsRes.status_code === 200 && regionsRes.data) {
                        const regionsWithArticlesPromises = regionsRes.data.map(async (region: LocationProps) => {
                            const regionArticlesRes = await getArticleByFields({
                                id_city: city.id,
                                id_region: region.id,
                                id_country: parseInt(country), 
                                status: ['draft', 'published'],
                                category: category,
                                limit: LIMIT,
                                page: currentPage
                            });
                            
                            return {
                                ...region,
                                articles: regionArticlesRes?.articles || [],
                                totalPages: regionArticlesRes?.pagination?.totalPages
                            };
                        });
                        
                        regions = await Promise.all(regionsWithArticlesPromises);
                    }

                    return {
                        ...city,
                        articles: cityArticlesRes?.articles || [],
                        totalPages: cityArticlesRes?.pagination?.totalPages,
                        child: regions,
                    };
                });

                const finalCitiesData = await Promise.all(cityDataPromises);
                setCities(finalCitiesData);

            } catch (e) {
                console.log(e);
            }
        };

        fetchAllData();

    }, [country, searchParams]);

    useEffect(() => {
        if(userDetails) {
            if(userDetails.user_level == 'super_admin') return
            if(userDetails.id_country && `${userDetails.id_country}` !== country) {
                navigate(`/admin/mst_article/${userDetails.id_country}`)
            }
        }
    }, [userDetails])

    useEffect(() => {
        (async () => {
            try {
                const getCategory = await getAllCategory()
                if(getCategory.data) {
                    setAvailableCategories(getCategory.data)
                }
            } catch(e) {
                console.log(e)
            }
        })()
    }, [])

    const resetPage = () => {
        setSearchParams('page=')
    }

    const removeArticleHandler = async (id: number) => {
        try {
            const article = await deleteArticle(id)
            if(article) {
                const copyCities = [...cities]
                setCities(copyCities.map(city => {
                    const newChild = city.child?.map(child => {
                        return {...child, articles: child.articles?.filter(artic => artic.id != id)}
                    })
                    return {...city, articles: city.articles?.filter(art => art.id != id), child: newChild}
                }))
                // const copyCountry = {...stateCountry}
                setStateCountry((prev) => {
                    if(!prev) return
                    return {...prev, articles: prev.articles?.filter(art => art.id != id)}
                })
            }
        } catch (e) {
            console.log(e)
        }
    }

    const clickPagingHandler = (page: number) => {
        // if(page > totalPages || page <= 0) return
        setSearchParams(`page=${page}`)
    }
    const tabComponents = () => {
        // if(!cities) return
        return cities.reduce((acc, city) => {
            acc.push(
                <CustomVerticalTabsChild level={1} key={city.id} title={city.name}>
                    {city.articles?.map(val => (
                        <RenderArticle key={val.id} onClick={() => {removeArticleHandler(val.id)}} article={val} category={availableCategories?.filter(cat => (cat.id == val.category_id))[0]} />
                    ))}
                    <div className="pagination-wrapper flex justify-center gap-x-4 py-8 items-center">
                        <RenderPagination page={generatePagination(currentPage, city.totalPages)} currentPage={currentPage} onClick={clickPagingHandler}  />
                    </div>
                </CustomVerticalTabsChild>
            );

            if (city.child) {
                const regionTabs = city.child.map(region => (
                    <CustomVerticalTabsChild level={2} key={`${city.id}-${region.id}`} title={region.name}>
                    {region.articles?.map(reg => (
                        <RenderArticle key={reg.id} onClick={() => {removeArticleHandler(reg.id)}} article={reg} category={availableCategories?.filter(cat => (cat.id == reg.category_id))[0]} />
                    ))}
                    <div className="pagination-wrapper flex justify-center gap-x-4 py-8 items-center">
                        <RenderPagination page={generatePagination(currentPage, region.totalPages)} currentPage={currentPage} onClick={clickPagingHandler}  />
                    </div>
                    </CustomVerticalTabsChild>
                ));
                acc.push(...regionTabs);
            }

            return acc;
        }, [] as JSX.Element[]);
    }

    const categoryChangeHandler = (val: string | number) => {
        if(val) {
            setSearchParams(`?category=${val}`)
        } else {
            setSearchParams('')
        }
    }

    const renderArticleFromState = () => {
        if(stateCountry?.articles) {
            return (
                <>
                    {stateCountry?.articles?.map(article => {
                        return <RenderArticle onClick={() => {removeArticleHandler(article.id)}} article={article} category={availableCategories?.filter(cat => (cat.id == article.category_id))[0]} />
                    })}
                    <div className="pagination-wrapper flex justify-center gap-x-4 py-8 items-center">
                        <RenderPagination page={generatePagination(currentPage, stateCountry.totalPages)} currentPage={currentPage} onClick={clickPagingHandler}  />
                    </div>
                </>

            )

        } 
        return (
            <p>
                No article Found
            </p>
        )
    }

    if(cities) {
        return (
            <>
                <div className="grid grid-cols-12">
                    <div className="col-span-4">
                        <div className="category-select">
                            {
                                availableCategories &&
                                <Select placeholder="Select a Category" options={availableCategories.map(cat => ({label: cat.title, value: cat.id}))} onChange={categoryChangeHandler} />
                            }
                        </div>
                    </div>
                </div>
                <CustomVerticalTabs onClick={resetPage}>
                    <CustomVerticalTabsChild level={0} title={stateCountry?.name ?? ''}>
                        {renderArticleFromState()}
                    </CustomVerticalTabsChild>
                        {...tabComponents()}
                        
                </CustomVerticalTabs>
            </>
        )
    } else {
        return (
            <></>
        )
    }
}

export default FormArticle