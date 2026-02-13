import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import ComponentCard from "../../../components/common/ComponentCard";
import { getTemplateByUrl, createTemplate, editTemplateByUrl } from "../../../services/template.service";
import { getArticleByFields } from "../../../services/article.service";
import { CityProps, CountryProps, RegionProps } from "../../../layout/TemplateLayout";
import { ArticleProps } from "../../../types/article.type";
import { Modal } from "../../../components/ui/modal";
import { useModal } from "../../../hooks/useModal";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";
import Select from "../../../components/form/Select";
import { useNavigationPrompt } from "../../../hooks/useNavigationPrompt";
import { useTaxonomies } from "../../../context/TaxonomyContext";
import { useNotification } from "../../../context/NotificationContext";
import ReactSelect from "react-select"


function isEmpty(obj: object) {
  for (var prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      return false;
    }
  }

  return true
}

type ContentRefProps = {key: "heroImage" | "trending" | "mostPopular" | "events" | "ultimateGuide" | 'overseas', index: number}
type ArticleCardProps = {
    initArticle: ArticleProps | undefined | {},
    contentRef: ContentRefProps,
    onSetArticle: (article: ArticleProps | null, contentRef: ContentRefProps) => void,
    className: string
}

type ArticleSelectorProps = {
    // articles: ArticleProps[],
    onSelect: (article: ArticleProps | null) => void
}

const ArticleCard: React.FC<ArticleCardProps> = ({initArticle, contentRef, onSetArticle, className}) => {
    const {isOpen, openModal, closeModal} = useModal()
    // const [article, setArticle] = useState<ArticleProps | false>(false)

    const selectHandler = (theArticle: ArticleProps | null) => {
        closeModal()
        onSetArticle(theArticle, contentRef)
    }

    const renderArticle = () => {
        if(initArticle && !isEmpty(initArticle)) {
            return (
                <div className={className}>
                    <div className={`box p-8 shadow text-center`}>
                        <div className="title-wrapper">
                            <p>
                                {
                                    (initArticle as ArticleProps).title
                                }
                            </p>
                            <Button onClick={openModal}>Set Article</Button>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <div className={className}>
                    <div className={`box p-8 shadow text-center`}>
                        <div className="title-wrapper">
                            <p>Select Article</p>
                            <Button variant="outline" onClick={openModal}>Set Article</Button>
                        </div>
                    </div>
                </div>
            )
        }
    }
    return (
        <>
            {renderArticle()}
            <Modal isOpen={isOpen} onClose={closeModal}>
                <div className="inner px-8">
                    <ArticleSelector onSelect={selectHandler} />
                </div>
            </Modal>
        </>
    )
}

const ArticleSelector: React.FC<ArticleSelectorProps> = ({onSelect}) => {
    // const {locations} = useOutletContext<LocationsContextProps>()
    const {adminTaxonomies, taxonomies} = useTaxonomies()
    const [selectedArticle, setSelectedArticle] = useState<ArticleProps | null>(null)
    const [selectedCountry, setSelectedCountry] = useState<CountryProps>()
    const [selectedCity, setSelectedCity] = useState<CityProps>()
    const [selectedRegion, setSelectedRegion] = useState<RegionProps>()
    const [readyGetArticle, setReadyGetArticle] = useState<boolean>(false)
    const [availableArticle, setAvailableArticle] = useState<ArticleProps[]>([])
    const [filteredArticle, setFilteredArticle] = useState<ArticleProps[]>([])
    // const [availableCategories, setAvailableCategories] = useState<Category[]>()
    const [page] = useState<number>(0)

    const [searchParams] = useSearchParams()
    const urlSplit = searchParams.get('url')?.split('/').filter(loc => loc)

    // useEffect(() => {
    //     (async () => {
    //         const getCategory = await getAllCategory()
    //         if(getCategory.data) {
    //             setAvailableCategories(getCategory.data)
    //         }
    //     })()
    // }, [])

    useEffect(() => {
        if(!urlSplit?.length) {
            setReadyGetArticle(true)
            return
        }
        const country = adminTaxonomies.countries?.find(coun => (coun.slug == urlSplit[0]))
        if(country) {
            let temp = {...country} as CountryProps
            temp.cities = adminTaxonomies.cities?.filter(cit => (cit.id_parent == country.id))
            temp.cities?.map(cit => ({...cit, regions: adminTaxonomies.regions?.filter(reg => reg.id == cit.id)}))
            setSelectedCountry(temp)
            if(!urlSplit[1]) {
                setReadyGetArticle(true)
                return
            
            }
            const city = temp.cities?.find(cit => (cit.slug == urlSplit[1]))
            if(city) {
                setSelectedCity(city)
                if(!urlSplit[2]) {
                    setReadyGetArticle(true)
                    return
                }
                const region = city.regions?.filter(reg => (reg.slug == urlSplit[2]))[0]
                if(region) {
                    setSelectedRegion(region)
                    setReadyGetArticle(true)
                }
            }
        }
    }, [])

    useEffect(() => {
        if(!readyGetArticle) return
        (async () => {
            const getArticles = await getArticleByFields({
                id_country: selectedCountry?.id ?? undefined,
                id_city: selectedCity?.id ?? undefined,
                id_region: selectedRegion?.id ?? undefined,
                limit: 50,
                page: page
            })
            if(getArticles?.articles) {
                setAvailableArticle(getArticles.articles)
                setFilteredArticle(getArticles.articles)
            }
        })()
    }, [readyGetArticle])

    const clickHandler = () => {
        if(!selectedArticle) return
        onSelect(selectedArticle)
        setSelectedArticle(null)
        setFilteredArticle(availableArticle)
    }

    const catChangeHandler = (val: string | number) => {
        const sanitizeVal = typeof val == 'string' ? parseInt(val) : val
        const filterCat = availableArticle.filter(article => (article.category_id == sanitizeVal))
        setFilteredArticle(filterCat)
    }
    if(filteredArticle && taxonomies.categories) {
        return (
            <>
                {/* {availableArticle.map(article => article.title)} */}
                
                {/* <Select onChange={selectChangeHandler} options={availableArticle.map(article => {
                    return {value: article.id, label: article.title}
                })}></Select> */}
                <div className="inner py-5">
                    <p className="mb-4">Filter Category</p>
                    <Select onChange={catChangeHandler} defaultValue="0" options={taxonomies.categories.map(cat => ({value: cat.id, label: cat.title}))} />
                </div>
                <div className="inner py-6">
                    <ReactSelect
                        menuIsOpen={true}
                        styles={{
                            menu: () => {
                                return {position: 'relative'}
                            }
                        }}
                        options={
                            filteredArticle?.map(article => ({value: article, label: article.title}))
                        }
                        onChange={
                            (newValue) => {
                                const article = newValue?.value as ArticleProps
                                setSelectedArticle(article)
                            }
                        }
                    />
                </div>
    
                {/* <div className="grid grid-cols-12 gap-8 p-8">
                    {
                        filteredArticle?.map(article => {
                            return (
                                <div className="col-span-4">
                                    <div className={`box py-4 shadow ${selectedArticle?.id == article.id ? 'border border-blue-600' : ''}`} onClick={() => {selectChangeHandler(article.id)}}>
                                        <div className="title-wrapper text-center">
                                            <p>
                                                {article.title}
                                            </p>
                                            <p className="text-xs">
                                                {getCategoryById(article.category_id)?.title}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div> */}
    
                <Button onClick={clickHandler} disabled={!selectedArticle}>Save</Button>
                {/* <Button onClick={deleteHandler} >Delete</Button> */}
            </>
        )
    }
}

const LocationTemplate: React.FC = () => {
    const [searchParams] = useSearchParams()
    const [content, setContent] = useState({heroImage: [{}], trending: [{}], mostPopular: [{}], events: [{}], ultimateGuide: [{}], overseas: [{}]})
    const [isTemplateAvailable, setIsTemplateAvailable] = useState<boolean>(false)

    const {setBlock} = useNavigationPrompt()
    const {setNotification} = useNotification()

    useEffect(() => {
        (async () => {
            try {
                if(searchParams.get('url') && searchParams.get('template') == 'Home') {
                    const getTemplate = await getTemplateByUrl(`${searchParams.get('url')}`)
                    if(getTemplate?.status_code == 200 && getTemplate.data?.content) {
                        setContent(JSON.parse(getTemplate.data.content))
                        setIsTemplateAvailable(true)
                    }
                }
            } catch(e) {
                console.log(e)
            }
        })()
    }, [])

    const messageHandler = (message: string = 'Action Success', type: 'fail' | 'neutral' = 'neutral') => {
        setNotification({message: message, type: type, isClosed: false})
    }

    const saveHandler = async () => {
        try {
            const templateUrl = searchParams.get('url')
            if(templateUrl == null) return
            if(isTemplateAvailable) {
                const edit = await editTemplateByUrl(templateUrl, 'Home', JSON.stringify(content))
                if(edit) {
                    messageHandler()
                    setBlock(false)
                    return
                } else {
                    messageHandler('Failed to edit', 'fail')
                }
            } else {
                const create = await createTemplate(templateUrl, 'Home', JSON.stringify(content))
                if(create) {
                    messageHandler()
                    setBlock(false)
                    return
                } else {
                    messageHandler('Failed to create', 'fail')
                }
            }
        } catch(e) {
            console.log(e)
        }
    }
    const setArticle = (article: ArticleProps | null, contentRef: {key: "heroImage" | "trending" | "mostPopular" | "events" | "ultimateGuide" | 'overseas', index: number}) => {
        const copyContent = {...content}
        if(article == null) {
            copyContent[contentRef.key][contentRef.index] = {}
        } else {
            copyContent[contentRef.key][contentRef.index] = article
        }
        setContent(copyContent)
        setBlock(true)
    }
    const clearSection = (contentRef: "heroImage" | "trending" | "mostPopular" | "events" | "ultimateGuide" | 'overseas') => {
        const copyContent = {...content}
        copyContent[contentRef] = [{}]
        setContent(copyContent)
        setBlock(true)
    }
    if(searchParams.get('template')) {
        return (
            <>
                <div className="grid grid-cols-12 gap-x-10">
                    <div className="col-span-8">
                        <ComponentCard className="mb-8">
                            <Label>Hero Image</Label>
                            <div className="grid grid-cols-12 gap-x-8">
                                <ArticleCard className="col-span-4" initArticle={content.heroImage[0] ? Object.keys(content.heroImage[0]).length ? content.heroImage[0] : undefined : undefined} contentRef={{key: 'heroImage', index: 0}} onSetArticle={setArticle} />
                                <ArticleCard className="col-span-4" initArticle={content.heroImage[1] ? Object.keys(content.heroImage[1]).length ? content.heroImage[1] : undefined : undefined} contentRef={{key: 'heroImage', index: 1}} onSetArticle={setArticle} />
                                <ArticleCard className="col-span-4" initArticle={content.heroImage[2] ? Object.keys(content.heroImage[2]).length ? content.heroImage[2] : undefined : undefined} contentRef={{key: 'heroImage', index: 2}} onSetArticle={setArticle} />
                            </div>
                            <Button variant="outline" onClick={() => clearSection('heroImage')}>Clear Section</Button>
                        </ComponentCard>
                        <ComponentCard className="mb-8">
                            <Label>Trending</Label>
                            <div className="grid grid-cols-12 gap-x-8 gap-y-6">
                                <ArticleCard className="col-span-12" initArticle={content.trending[0]} contentRef={{key: 'trending', index: 0}} onSetArticle={setArticle} />
                                <ArticleCard className="col-span-3" initArticle={content.trending[1]} contentRef={{key: 'trending', index: 1}} onSetArticle={setArticle} />
                                <ArticleCard className="col-span-3" initArticle={content.trending[2]} contentRef={{key: 'trending', index: 2}} onSetArticle={setArticle} />
                                <ArticleCard className="col-span-3" initArticle={content.trending[3]} contentRef={{key: 'trending', index: 3}} onSetArticle={setArticle} />
                                <ArticleCard className="col-span-3" initArticle={content.trending[4]} contentRef={{key: 'trending', index: 4}} onSetArticle={setArticle} />
                            </div>
                            <Button variant="outline" onClick={() => clearSection('trending')}>Clear Section</Button>
                        </ComponentCard>
                        {
                            searchParams.get('url') != '/' &&
                            <ComponentCard className="mb-8">
                                <Label>Most Popular Place</Label>
                                <div className="grid grid-cols-12 gap-x-8 gap-y-6">
                                    <ArticleCard className="col-span-3" initArticle={content.mostPopular[0]} contentRef={{key: 'mostPopular', index: 0}} onSetArticle={setArticle} />
                                    <ArticleCard className="col-span-3" initArticle={content.mostPopular[1]} contentRef={{key: 'mostPopular', index: 1}} onSetArticle={setArticle} />
                                    <ArticleCard className="col-span-3" initArticle={content.mostPopular[2]} contentRef={{key: 'mostPopular', index: 2}} onSetArticle={setArticle} />
                                    <ArticleCard className="col-span-3" initArticle={content.mostPopular[3]} contentRef={{key: 'mostPopular', index: 3}} onSetArticle={setArticle} />
                                    <ArticleCard className="col-span-3" initArticle={content.mostPopular[4]} contentRef={{key: 'mostPopular', index: 4}} onSetArticle={setArticle} />
                                </div>
                                <Button variant="outline" onClick={() => clearSection('mostPopular')}>Clear Section</Button>
                            </ComponentCard>
                        }
                        <ComponentCard className="mb-8">
                            <Label>Events</Label>
                            <div className="grid grid-cols-12 gap-x-8 gap-y-6">
                                <ArticleCard className="col-span-3" initArticle={content.events[0]} contentRef={{key: 'events', index: 0}} onSetArticle={setArticle} />
                                <ArticleCard className="col-span-3" initArticle={content.events[1]} contentRef={{key: 'events', index: 1}} onSetArticle={setArticle} />
                                <ArticleCard className="col-span-3" initArticle={content.events[2]} contentRef={{key: 'events', index: 2}} onSetArticle={setArticle} />
                                <ArticleCard className="col-span-3" initArticle={content.events[3]} contentRef={{key: 'events', index: 3}} onSetArticle={setArticle} />
                            </div>
                            <Button variant="outline" onClick={() => clearSection('events')}>Clear Section</Button>
                        </ComponentCard>
                        <ComponentCard className="mb-8">
                            <Label>Ultimate Guide</Label>
                            <div className="grid grid-cols-12 gap-x-8 gap-y-6">
                                <ArticleCard className="col-span-3" initArticle={content.ultimateGuide[0]} contentRef={{key: 'ultimateGuide', index: 0}} onSetArticle={setArticle} />
                                <ArticleCard className="col-span-3" initArticle={content.ultimateGuide[1]} contentRef={{key: 'ultimateGuide', index: 1}} onSetArticle={setArticle} />
                                <ArticleCard className="col-span-3" initArticle={content.ultimateGuide[2]} contentRef={{key: 'ultimateGuide', index: 2}} onSetArticle={setArticle} />
                                <ArticleCard className="col-span-3" initArticle={content.ultimateGuide[3]} contentRef={{key: 'ultimateGuide', index: 3}} onSetArticle={setArticle} />
                            </div>
                            <Button variant="outline" onClick={() => clearSection('ultimateGuide')}>Clear Section</Button>
                        </ComponentCard>
                        <ComponentCard className="mb-8">
                            <Label>Area Highlights</Label>
                            <div className="grid grid-cols-12 gap-x-8 gap-y-6">
                                <ArticleCard className="col-span-3" initArticle={content.overseas[0]} contentRef={{key: 'overseas', index: 0}} onSetArticle={setArticle} />
                                <ArticleCard className="col-span-3" initArticle={content.overseas[1]} contentRef={{key: 'overseas', index: 1}} onSetArticle={setArticle} />
                                <ArticleCard className="col-span-3" initArticle={content.overseas[2]} contentRef={{key: 'overseas', index: 2}} onSetArticle={setArticle} />
                                <ArticleCard className="col-span-3" initArticle={content.overseas[3]} contentRef={{key: 'overseas', index: 3}} onSetArticle={setArticle} />
                                <ArticleCard className="col-span-3" initArticle={content.overseas[4]} contentRef={{key: 'overseas', index: 4}} onSetArticle={setArticle} />
                                <ArticleCard className="col-span-3" initArticle={content.overseas[5]} contentRef={{key: 'overseas', index: 5}} onSetArticle={setArticle} />
                                <ArticleCard className="col-span-3" initArticle={content.overseas[6]} contentRef={{key: 'overseas', index: 6}} onSetArticle={setArticle} />
                                <ArticleCard className="col-span-3" initArticle={content.overseas[7]} contentRef={{key: 'overseas', index: 7}} onSetArticle={setArticle} />
                            </div>
                            <Button variant="outline" onClick={() => clearSection('overseas')}>Clear Section</Button>
                        </ComponentCard>

                    </div>
                    <div className="col-span-4">
                        <ComponentCard>
                            <Label>Save</Label>
                            <Button onClick={saveHandler}>Save</Button>
                        </ComponentCard>
                    </div>
                </div>
            </>
        )
    } else {
        return (
            <>You're not supposed to be here</>
        )
    }
}

export default LocationTemplate
