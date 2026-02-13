import React, { ReactNode, useEffect, useRef, useState } from "react"
import { createTemplate, editTemplateByUrl, getTemplateByUrl } from "../../../services/template.service"
import { useNavigate, useSearchParams } from "react-router"
import { ArticleApiResponseProps } from "../../../types/article.type"
import ReactSelect from 'react-select'
import { AdminHeroImage } from "../../../components/front/HeroImage"
import ComponentCard from "../../../components/common/ComponentCard"
import { useSidebar } from "../../../context/SidebarContext"
import { getArticleByFields } from "../../../services/article.service"
import { useTaxonomies } from "../../../context/TaxonomyContext"
import { useNotification } from "../../../context/NotificationContext"
import { useModal } from "../../../hooks/useModal"
import { Modal } from "../../../components/ui/modal"
import {DragDropContext, Droppable, Draggable} from '@hello-pangea/dnd'
import Button from "../../../components/ui/button/Button"
import { AdminTrending } from "../../../components/front/Trending"
import { HomeTemplate, HomeTemplateKey, HomeTemplateProps} from "../../../lib/map/TemplatesMap"
import { TrashBinIcon } from "../../../icons"
import { AdminMostPopular } from "../../../components/front/MostPopular"
import { AdminEventsHome } from "../../../components/front/EventsHome"
import { AdminUltimateGuide } from "../../../components/front/UltimateGuide"
import { useNavigationPrompt } from "../../../hooks/useNavigationPrompt"

type ArticleSelectorProps = {
    modalKey: HomeTemplateKey,
    onSave: (articles: Array<ArticleApiResponseProps | 0>, key: HomeTemplateKey) => void,
    preContent: Array<ArticleApiResponseProps | 0>
}

// type MenuProps = {article: ArticleApiResponseProps}

const reorder = (list: Array<ArticleApiResponseProps | 0>, startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
};

const grid = 8

const getItemStyle = (isDragging: boolean, draggableStyle: object) => ({
    // some basic styles to make the items look a bit nicer
    // userSelect: "none",
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? "lightgreen" : "#f1f1f1",

    // styles we need to apply on draggables
    ...draggableStyle
});
const getListStyle = (isDraggingOver: boolean) => ({
    background: isDraggingOver ? "lightblue" : "white",
    padding: grid,
    width: 800
});

const ArticleSelector: React.FC<ArticleSelectorProps> = ({modalKey, onSave, preContent}) => {
    const [selectedArticle, setSelectedArticle] = useState<Array<ArticleApiResponseProps | 0>>([])
    const [availableArticles, setAvailableArticles] = useState<ArticleApiResponseProps[]>([])
    const [render, setRender] = useState<ReactNode[]>([])
    const [searchParams] = useSearchParams()
    const {setNotification} = useNotification()
    const {adminTaxonomies, taxonomies} = useTaxonomies()
    const url = searchParams.get('url')
    if(!url) {
        setNotification({message: 'url is not set', type: "fail"})
        return
    }

    const onDragEnd = (result: any) => {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        const items = reorder(
            selectedArticle,
            result.source.index,
            result.destination.index
        );
        setSelectedArticle(items)
    }

    useEffect(() => {
        const locations = url?.split('/').filter(Boolean);
        (async () => {
            const get = await getArticleByFields({
                id_country: adminTaxonomies.countries?.find(coun => (coun.slug == locations[0]))?.id ?? undefined,
                id_city: adminTaxonomies.cities?.find(coun => (coun.slug == locations[1]))?.id ?? undefined,
                id_region: adminTaxonomies.regions?.find(coun => (coun.slug == locations[1]))?.id ?? undefined,
                category: taxonomies.categories?.find(cat => (HomeTemplate[modalKey].query?.category?.slug == cat.slug_title))?.id ?? undefined
            })
            if(get?.articles) {
                setAvailableArticles(get.articles)
            } else {
                setNotification({message: 'something is wrong, cannot get the articles from server', type: 'fail'})
            }
        })()
    }, [])

    const deleteHandler = (id: number, i: number) => {
        setSelectedArticle(() => {
            const copySelected = [...selectedArticle]
            return copySelected.map(select => {
                if(select === 0 || select?.id == id) return 0
                return select
            })
        })
        setRender(() => {
            const copyRender = [...render]
            copyRender[i] = 0
            return copyRender
        })
    }

    const renderArticle = (article: ArticleApiResponseProps | 0, index: number) => {
        const articleItem = () => {
            if(!article) return
            return (
                <div className="flex justify-between">
                    <div className="title">
                        <p>{article.title}</p>
                    </div>
                    <div className="icon" onClick={() => {deleteHandler(article.id, index)}}>
                        <TrashBinIcon></TrashBinIcon>
                    </div>

                </div>
            )
        }

        const blankItem = () => {
            return (
                <div className="flex">
                    <p>Select an article to fill here</p>
                </div>
            )
        }

        const renderItem = () => {
            if(article) return articleItem();
            return blankItem();
        }

        return (
            <>
                <Draggable key={`draggable-${index}`} draggableId={`draggable-${index}`} index={index}>
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{...getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style ?? {}
                            ), marginBottom: '1rem', backgroundColor: article ? 'rgb(241, 241, 241)' : 'transparent', border: article ? '' : '2px dashed #000'}}
                        >
                         {renderItem()}   
                        </div>
                    )}
                </Draggable>
                            
            </>
        )
    }

    const saveHandler = () => {
        onSave(selectedArticle, modalKey)
    }

    useEffect(() => {
        setSelectedArticle([])
        setRender([])
        preContent.forEach((content, i) => {
            setSelectedArticle(prev => {
                return [...prev, content]
            })
            setRender(prev => {
                return [...prev, renderArticle(content, i)]
            })
        })
    }, [])

    // useEffect(() => {
    //     if(availableArticles.length && !render.length) {
    //         const rules = HomeTemplate[modalKey].rules
    //         for(let i = 0; rules.limit > i; i++) {
    //             articlesRow.push(renderArticle(availableArticles[i], i))
    //             setRender(prev => ([...prev, renderArticle(availableArticles[i], i)]))
    //             setSelectedArticle(prev => [...prev, availableArticles[i]])
    //         }
    //     }
    // }, [availableArticles])

    useEffect(() => {
        if(selectedArticle.length) {
            setRender(() => {
                const rowsRender = [] as ReactNode[]
                selectedArticle.forEach((article, i) => {
                    rowsRender.push(renderArticle(article, i))
                })
                return rowsRender
            })
        }
    }, [selectedArticle])

    const selectHandler = (value: ArticleApiResponseProps) => {
        console.log(value)
        setSelectedArticle(() => {
            const copySelected = [...selectedArticle]
            const index = selectedArticle.findIndex(select => select == 0)
            if(index > -1) {
                copySelected[index] = value
            }
            return copySelected
        })
        // setRender(selectedArticle.map((article, i) => renderArticle(article,i)))
    }

    const changeHandler = (value: ArticleApiResponseProps | undefined) => {
        if(!value) return
        if(!selectedArticle.filter(art => (art == 0)).length) {
            setNotification({message: "Remove one of the selected article first before selecting", type: 'fail'})
            return
        }
        selectHandler(value)
    }

    if(!render.length) return 
    return (
        <>
            <ComponentCard title={modalKey}>
                <div className="grid grid-cols-12">
                    <div className="col-span-6">
                        <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="droppable">
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            style={getListStyle(snapshot.isDraggingOver)}
                                        >
                                            {render}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                            <Button onClick={saveHandler}>Save</Button>
                    </div>
                    <div className="col-span-6">
                        <ReactSelect
                        options={availableArticles.map(article => {
                            return {value: article, label: article.title}
                        })}
                        styles={{
                            menu: () => {
                                return {position: 'relative'}
                            }
                        }}
                        menuIsOpen={true}
                        onChange={(newValue) => {changeHandler(newValue?.value)}}
                        value={undefined}
                        />
                    </div>
                </div>
            </ComponentCard>
        </>
    )
}

const LocationTemplateExp: React.FC = () => {
    const [templateContent, setTemplateContent] = useState<HomeTemplateProps>(HomeTemplate)
    const isAvailable = useRef<boolean>(false)
    const [modalKey, setModalKey] = useState<HomeTemplateKey | false>(false)
    const [isDirty, setIsDirty] = useState<boolean>(false)
    const [searcParams] = useSearchParams()
    const navigate = useNavigate()
    const {isOpen, closeModal, openModal} = useModal(true)
    const {closeSidebar} = useSidebar()
    const {setBlock} = useNavigationPrompt()
    const {setNotification} = useNotification()

    useEffect(() => {
        closeSidebar();
        (async () => {
            const url = searcParams.get('url')
            if(!url) {
                navigate('/admin/mst_templates')
                return
            }
            const get = await getTemplateByUrl(`/v2${url}`)
            if(get?.status_code == 200 && get.data?.content) {
                setTemplateContent((JSON.parse(get.data.content) as HomeTemplateProps))
                isAvailable.current = true
            } else {
                setTemplateContent(HomeTemplate)
                isAvailable.current = false
            }
        })()
    }, [])

    useEffect(() => {
        setBlock(isDirty)
    }, [isDirty])

    const saveHandler = (articles: Array<ArticleApiResponseProps | 0>, key: HomeTemplateKey) => {
        setTemplateContent(prev => {
            // const copyContent = {...templateContent}
            // copyContent[key]?.articles = articles
            return {...prev, [key]: {...prev[key], articles: articles}}
        })
        setIsDirty(true)
        setModalKey(false)
        closeModal()
    }
    const clickHandler = (key: HomeTemplateKey) => {
        setModalKey(key)
        openModal()
    }
    const closeHandler = () => {
        setModalKey(false)
        closeModal()
    }
    console.log(templateContent?.ultimateGuide.articles, 'trending')
    const renderModal = () => {
        if(!modalKey) return <></>
        return (
            <Modal isOpen={isOpen} onClose={closeHandler}>
                <ArticleSelector modalKey={modalKey} onSave={saveHandler} preContent={templateContent?.[modalKey].articles}></ArticleSelector>
            </Modal>
        )
    }

    const saveTemplateHandler = async () => {
        const url = searcParams.get('url')
        if(isAvailable.current && url) {
            const edit = await editTemplateByUrl(`/v2${url}`, 'Home', JSON.stringify(templateContent))
            if(edit) {
                setNotification({message: 'Action Success', type: 'neutral'})
            } else {
                setNotification({message: 'Action Failed', type: "fail"})
            }
        }
        if(!isAvailable.current && url) {
            const create = await createTemplate(`/v2${url}`, 'Home', JSON.stringify(templateContent))
            if(create) {
                setNotification({message: 'Action Success', type: 'neutral'})
            } else {
                setNotification({message: 'Action Failed', type: "fail"})
            }
        }
        setIsDirty(false)
    }
    return(
        <>
            <Button onClick={saveTemplateHandler}>Save Template</Button>
            <div className="spacer py-6"></div>
            <ComponentCard title="Hero Image" buttonText="Edit Articles" buttonOnClick={() => {clickHandler('heroImage')}}>
                <AdminHeroImage preContent={templateContent?.heroImage.articles} />
            </ComponentCard>
            <div className="spacer py-6"></div>
            <ComponentCard title="Trending" buttonText="Edit Articles" buttonOnClick={() => {clickHandler('trending')}}>
                <AdminTrending preContent={templateContent?.trending.articles} />
            </ComponentCard>
            <div className="spacer py-6"></div>
            <ComponentCard title="Most Popular" buttonText="Edit Articles" buttonOnClick={() => {clickHandler('mostPopular')}}>
                <AdminMostPopular preContent={templateContent?.mostPopular.articles} />
            </ComponentCard>
            <div className="spacer py-6"></div>
            <ComponentCard title="Events" buttonText="Edit Articles" buttonOnClick={() => {clickHandler('events')}}>
                <AdminEventsHome preContent={templateContent?.events.articles} />
            </ComponentCard>
            <div className="spacer py-6"></div>
            <ComponentCard title="Ultimate Guide" buttonText="Edit Articles" buttonOnClick={() => {clickHandler('ultimateGuide')}}>
                <AdminUltimateGuide preContent={templateContent?.ultimateGuide.articles} />
            </ComponentCard>
            {/* <div className="spacer py-6"></div> */}
            {/* <ComponentCard title="Local Bali" buttonText="Edit Articles" buttonOnClick={() => {clickHandler('overseas')}}>
                <AdminLocalBali preContent={templateContent?.overseas.articles} />
            </ComponentCard> */}
            <div className="spacer py-6"></div>
            {renderModal()}
        </>
    )
}

export default LocationTemplateExp
