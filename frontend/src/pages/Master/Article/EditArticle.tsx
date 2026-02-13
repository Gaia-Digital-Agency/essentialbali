// Import Library / Framework
import React, { useEffect, useState, ReactElement } from "react"
import { useParams, useOutletContext, useNavigate } from "react-router"
// Import Types
import { ArticleStatusProps } from "../../../types/article.type"
import { DeltaStatic, EmitterSource } from 'react-quill-new'
import { Category } from "../../../types/category.type"
// Import Services
import { getArticleById, editArticleById, createArticle } from "../../../services/article.service"
// Import Layout Context
import { ContextPageAdminButtonText } from "../../../layout/ArticleAdmin"
// Import Hooks
import { useNavigationPrompt } from "../../../hooks/useNavigationPrompt"
import { useModal } from "../../../hooks/useModal"
// Import UIs
// import 'react-quill-new/dist/quill.snow.css';
import Input from "../../../components/form/input/InputField"
import { AdminFeaturedImage } from "../../../components/ui/featured-image/FeaturedImage"
import QuillWysiwyg from "../../../components/ui/quill-wysiwyg/QuillWysiwyg"
import ComponentCard from "../../../components/common/ComponentCard"
import Select from "../../../components/form/Select"
import Button from "../../../components/ui/button/Button"
import { AssetMedia } from "../../../types/media.type"
import Switch from "../../../components/form/switch/Switch"
import { METADATA_TYPE, MetaDataCategory, MetaDataMap } from "./MetaData"
import { InfoIcon } from "../../../icons"
import 'react-calendar/dist/Calendar.css';
import { Tag } from "../../../types/tags.type"
import { getAllTags } from "../../../services/tags.service"
import { Link } from "react-router"

import ReactSelect from "react-select"
import { useNotification } from "../../../context/NotificationContext"
import { useTaxonomies } from "../../../context/TaxonomyContext"

import { DatePicker, TimePicker } from "rsuite"
import "rsuite/DatePicker/styles/index.css";
// import MultiSelect from "../../../components/form/MultiSelect"
// import ReactSelect from 'react-select'
import toSlug from "../../../lib/utils/slugify"
import TextArea from "../../../components/form/input/TextArea"


const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL

type SelectedMetaDataType = MetaDataCategory | undefined
type SelectInputProps = {label: string, value: number | string}

const InputWrapper = ({label, children, tooltip}: {label: string, children: ReactElement, tooltip?: string}) => {
    return (
        <div className="input-wrapper">
            <div className="label-wrapper mb-4 flex gap-x-2 items-center">
                <p className="text-xl">{label}</p>
                {
                    tooltip &&
                    <DefaultTooltip message={tooltip} />
                }
            </div>
            {children}
        </div>
    )
}

const DefaultTooltip: React.FC<{message: string}> = ({message}) => {
  return (
    <div className="relative inline-block group">
        <InfoIcon />
      <div className="invisible absolute w-48 text-wrap z-50 bottom-full left-1/2 mb-2.5 border border-black -translate-x-1/2 opacity-0 transition-opacity duration-300 group-hover:visible group-hover:opacity-100">
        <div className="relative">
          <div className="drop-shadow-4xl whitespace-nowrap rounded-lg bg-white px-3 py-2 text-md font-medium text-gray-700 dark:bg-[#1E2634] dark:text-white">
            {message}
          </div>
          <div className="absolute -bottom-1 left-1/2 h-3 w-4 -translate-x-1/2 rotate-45 bg-white dark:bg-[#1E2634]"></div>
        </div>
      </div>
    </div>
  );
}

const transformCategories = (categories: Category[] | undefined) => {
    if(!categories) return
    const map = new Map()
    const roots = []

    for (const cat of categories) {
        map.set(cat.id, { label: cat.title, value: cat.id, children: [] })
    }

    for (const cat of categories) {
        const node = map.get(cat.id)
        if (cat.id_parent === 0 || cat.id_parent === null) {
            roots.push(node)
        } else {
            const parent = map.get(cat.id_parent)
            if (parent) parent.children.push(node)
        }
    }


    return roots.map(cat => {
        if (cat.children.length > 0) {
            return {
                label: cat.label,
                options: [
                    { label: cat.label, value: cat.value, level: 0 },
                    ...cat.children.map((c: {value: string, label: string}) => ({
                        label: c.label,
                        value: c.value,
                        level: 1
                    }))
                ]
            }
        }
        return { label: cat.label, value: cat.value, level: 0 }
    })
}


const EditArticle: React.FC<{action: "add" | "edit"}> = ({action}) => {

    const [articleId, setArticleId] = useState<number>(0)
    const [htmlContent, setHTMLContent] = useState<string | undefined>(undefined)
    const [featuredImage, setFeaturedImage] = useState<{id: number | undefined, url: string | undefined}>()
    const [featuredImage169, setFeaturedImage169] = useState<{id: number | undefined, url: string | undefined}>()
    const [featuredImage43, setFeaturedImage43] = useState<{id: number | undefined, url: string | undefined}>()
    const [title, setTitle] = useState<string>('')
    const [subtitle, setSubtitle] = useState<string>('')
    const [category, setCategory] = useState<number>(0)
    const [tags, setTags] = useState<number[]>([])
    const [status, setStatus] = useState<ArticleStatusProps>("draft")
    const [slug, setSlug] = useState<string>('')
    const [isSlugManuallyInput, setIsSlugManuallyInput] = useState<boolean>(false)
    const [country, setCountry] = useState<number>(0)
    const [city, setCity] = useState<number>(0)
    const [region, setRegion] = useState<number>(0)
    const [metaData, setMetaData] = useState<Record<string, any> | undefined>()
    const [pinned, setPinned] = useState<0 | 1>(0)

    const [selectedMetaData, setSelectedMetaData] = useState<SelectedMetaDataType>()
    // const [availableCategories, setAvailableCategories] = useState<Category[]>()
    // const [inputCategories, setInputCategories] = useState<SelectInputProps[]>([])
    const [availableCountries, setAvailableCountries] = useState<SelectInputProps[]>([])
    const [availableCities, setAvailableCities] = useState<SelectInputProps[]>([])
    const [availableRegions, setAvailableRegions] = useState<SelectInputProps[]>([])
    const [availableTags, setAvailableTags] = useState<Tag[]>([])
    // const [readyInput, setReadyInput] = useState<boolean>(false)
    const {setPageAdminButtonText} = useOutletContext<ContextPageAdminButtonText>()
    const {setNotification} = useNotification()
    const {taxonomies, adminTaxonomies} = useTaxonomies()
    const {id} = useParams<{id: string | undefined}>()
    const params = useParams()

    const {closeModal, openModal} = useModal(false)
    const navigation = useNavigate()
    const {setBlock} = useNavigationPrompt()


    // Legacy redirect warnings removed for essentialbali
    console.log(params)
    useEffect(() => {
        try {
            if(id) {
                if(!id) throw new Error('Article Id is not provided for edit')
                setArticleId(parseInt(id))
            } else {
                setPageAdminButtonText('')
                // setReadyInput(true)
            }

            (async () => {
                try {
                    const getTags = await getAllTags()
                    if(getTags.data && getTags.status_code == 200) {
                        setAvailableTags(getTags.data)
                    }
                } catch(e) {
                    console.log(e)
                }
            })()
            return
        } catch (e) {
            console.log(e)
        }
    }, [params])
    useEffect(() => {
        if(!adminTaxonomies) return
        try {
            // const getCountries = await getAllLocationByType('country')
            // if(getCountries.status_code != 200) throw Error('unexpected error')
            // const countries = getCountries.data.map(val => {
            //     return {label: val.name, value: val.id}
            // })
            setAvailableCountries(adminTaxonomies.countries?.map(coun => ({value: coun.id, label: coun.name})) ?? [])
        } catch(e) {
            console.log(e)
        }
    }, [adminTaxonomies])
    useEffect(() => {
        if(!id) {
            setHTMLContent('')
            return
        }
        (async () => {
            // try {
                const getArticle = await getArticleById(parseInt(id))

                if(getArticle) {
                    // setReadyInput(true)
                    setHTMLContent(getArticle.article_post ?? '')
                    setFeaturedImage({id: getArticle?.featured_image_id, url: getArticle?.featured_image_url})
                    setFeaturedImage43({id: getArticle?.featured_image_4_3_id, url: getArticle?.featured_image_4_3_url})
                    setFeaturedImage169({id: getArticle?.featured_image_16_9_id, url: getArticle?.featured_image_16_9_url})
                    setTitle(getArticle.title)
                    setSubtitle(getArticle.sub_title)
                    setStatus(getArticle.status)
                    setCategory(getArticle.category_id)
                    if(typeof getArticle.tags == 'string') {
                        setTags(JSON.parse(getArticle.tags))
                    } else {
                        setTags(getArticle.tags ?? [])
                    }
                    setSlug(getArticle.slug)
                    setIsSlugManuallyInput(true)
                    setCountry(getArticle.id_country)
                    setCity(getArticle.id_city ?? 0)
                    setRegion(getArticle.id_region ?? 0)
                    setPinned(getArticle.pinned ?? 0)
                    if(typeof getArticle?.meta_data == 'string') {
                        setMetaData(JSON.parse(getArticle.meta_data))
                    } else {
                        setMetaData(getArticle?.meta_data ?? undefined)
                    }
                }
            // } catch (e) {
            //     console.log(e)
            // }
            
        })()

    }, [articleId])

    useEffect(() => {
        (async () => {
            if(country && !availableCities.length) {
                try {

                    setAvailableCities(adminTaxonomies.cities?.filter(cit => (cit.id_parent == country))?.map(cit => ({value: cit.id, label: cit.name})) ?? [])
                } catch (e) {
                    console.log(e)
                }
            }
            if(city && !availableRegions.length) {
                try {
                    setAvailableRegions(adminTaxonomies.regions?.filter(reg => (reg.id_parent == city)).map(reg => ({value: reg.id, label: reg.name})) ?? [])
                } catch (e) {
                    console.log(e)
                }
            }
        })()
    }, [country, city])

    useEffect(() => {
        if(taxonomies.categories && category) {
            const categoriesSelected = [] as Category[]
            // if(category)
            const getCategorySlug = taxonomies.categories.find(cat => (cat.id == category))
            let theMetaData = null
            if(!getCategorySlug) return
            if(getCategorySlug?.id_parent) {
                const parentCat = taxonomies.categories.find(cat => (cat.id == getCategorySlug.id_parent))
                if(parentCat) {
                    theMetaData = MetaDataMap[parentCat?.slug_title]
                }
            } else {
                categoriesSelected.push(getCategorySlug)
                categoriesSelected.push(...taxonomies.categories.filter(cat => (cat.id_parent == getCategorySlug.id)))
                console.log(categoriesSelected)
                // const categoriesSlug = taxonomies.categories.filter(cat => (cat.slug_title == category))
                // const theMetaData = MetaDataMap[getCategorySlug]
                categoriesSelected.forEach(cat => {
                    if(cat.slug_title in MetaDataMap) {
                        theMetaData = MetaDataMap[cat.slug_title]
                    }
                })
            }
            if(theMetaData) {
                setSelectedMetaData(theMetaData)
            } else {
                setSelectedMetaData(undefined)
            }
        }
    }, [category])

    const renderMetadata = () => {
        if(!selectedMetaData) return
        const valueChangeHandler = (value: any, keyReference: string) => {
            if(keyReference == 'whole_day' && value) {
                console.log(keyReference, value)
                setMetaData((prev) => ({...prev, "start_time": '00:00', "end_time": "23:59"}))
            }
            const sanitizeValue = typeof value == 'boolean' ? Number(value) : value
            setMetaData((prev) => ({...prev, [keyReference]: sanitizeValue}))
        }
        const checkWholeDay = () => {
            // console.log(metaData, metaData['whole_day'], 'wholde_day')
            if(metaData && metaData['whole_day']) return true
            return false
            // return false
        }
        const renderInput = (type: string, key: string) => {
            // if(!metaData) return
            console.log(metaData)
            switch (type) {
                case METADATA_TYPE.STRING:
                    return (
                        <Input
                            onChange={e => valueChangeHandler(e.target.value, key)}
                            value={metaData ? metaData[key] ?? '' : ''}
                        />
                    )

                case METADATA_TYPE.DATE:
                    const value = metaData ? metaData[key] ? `${metaData[key]}` : null : null
                    return (
                        <DatePicker
                            onChange={e => {
                                valueChangeHandler(e?.toISOString().split('T')[0], key)
                            }}
                            value={value ? new Date(value) : null}
                        />
                    )

                case METADATA_TYPE.NUMBER:
                    return (
                        <Input
                            type="number"
                            onChange={e => valueChangeHandler(Number(e.target.value), key)}
                            value={metaData ? metaData[key] ?? undefined : undefined}
                        />
                    )

                case METADATA_TYPE.MULTISELECT:
                    return (
                        <ReactSelect 
                        isMulti
                        placeholder={key}
                        onChange={e => valueChangeHandler(e.map(u => (u.value)), key)}
                        options={selectedMetaData[key]?.options ? selectedMetaData[key]?.options.map(option => ({value: option, label: option})) : []} 
                        value={metaData ? metaData[key]?.map((w: string) => ({value: w, label: w})) : undefined}
                        />
                    )
                case METADATA_TYPE.ENUM:
                    if(selectedMetaData[key].options?.length) {
                        return (
                            <Select
                                options={selectedMetaData[key]?.options?.map((option: string) => ({
                                    value: option,
                                    label: option
                                }))}
                                onChange={e => valueChangeHandler(e, key)}
                                value={metaData ? metaData[key] ?? '' : ''}
                            />
                        )
                    } else {
                        return <>Something wrong with the select</>
                    }

                case METADATA_TYPE.IMAGE:
                    const imageUrl = metaData ? metaData[key] ? `${metaData[key]}` : '' : ''
                    // if(typeof metaData[key] != 'string') return <AdminFeaturedImage url="#" onSave={file => valueChangeHandler(`${API_URL}/${file.path}`, key)} ratio="100%" width="250px" />
                    return (
                        <AdminFeaturedImage
                            url={
                                imageUrl
                            }
                            onSave={file => valueChangeHandler(`${API_URL}/${file.path}`, key)}
                            ratio="100%"
                            width="250px"
                        />
                    )
                
                case METADATA_TYPE.TRUE_FALSE:
                    return (
                        <Switch label={key} defaultChecked={metaData ? Boolean(metaData[key]) : false} onChange={e => {valueChangeHandler(e, key)}} />
                    )

                case METADATA_TYPE.TIME:
                    const time = metaData ? new Date(new Date().setHours(Number(`${metaData[key]}`.split(':')[0]), Number(`${metaData[key]}`.split(':')[1]))) : null
                    return (
                        <TimePicker label={key} className={`time-input ${key}`} onChange={e => {
                            const hour = e?.getHours()
                            const fixedHour = `${hour}`.length == 1 ? `0${hour}` : hour
                            const minute = e?.getMinutes()
                            const fixedMinute = `${minute}`.length == 1 ? `0${minute}` : minute
                            
                            valueChangeHandler(`${fixedHour}:${fixedMinute}`, key)
                        }} value={time}
                        disabled={checkWholeDay()}></TimePicker>
                    )

                default:
                    return <></>
            }
        }

        if(selectedMetaData) {
            return Object.keys(selectedMetaData).map((key) => {
                return (
                    <>
                        <InputWrapper label={`Metadata ${key}`} key={`metadata-${key}`} tooltip={selectedMetaData[key]?.tooltip}>
                            <>
                                {renderInput(selectedMetaData[key]?.type, key)}
                            </>
                        </InputWrapper>
                        </>
                    )
                })
        }
        return (
            <></>
        )
    }

    const renderCity = () => {
        if(availableCities.length && country) {
            return (
                <InputWrapper label="City">
                    <Select options={availableCities} defaultValue={city ? `${city}` : undefined} placeholder="Select City" onChange={cityChangeHandler}></Select>
                </InputWrapper>
            )
        }
    }
    const renderRegion = () => {
        if(availableRegions.length && city) {
            return (
                <InputWrapper label="Region">
                    <Select options={availableRegions} defaultValue={region ? `${region}` : undefined} placeholder="Select Region" onChange={regionChangeHandler}></Select>
                </InputWrapper>
            )
        }
    }

    // Input Handler
    const contentChangeHandler = (html: string, delta: DeltaStatic, source: EmitterSource) => {
        setHTMLContent(html)
        if(source == 'user') {
            setBlock(true)
        }
        if(delta) {
            
        }
    }

    const titleChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value)
        if(!isSlugManuallyInput) {
            // const processedString = e.target.value.replaceAll(' ', '-').toLowerCase().replaceAll(/[*+~.()'"!:,@]/g, '')
            const processedString = toSlug(e.target.value)
            setSlug(processedString)
        }
        // Set slug automatically if Slug hasnt set manually by admin
        setBlock(true)
        return
    }

    const slugChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(new RegExp(/[*+~.,()'"!:@]/g).test(e.target.value) && isSlugManuallyInput) {
            setNotification({message: 'slug cannot contains these characters * + ~ . , ( ) \' " ! : @', type: 'fail'})
        }
        const val = toSlug(e.target.value)
        // setSlug(e.target.value.replaceAll(/[*+~.()'"!:@]/g, ''))
        setSlug(val)
        // to prevent automatic set slug on title change
        setIsSlugManuallyInput(true)
        setBlock(true)
    }
    const statusChangeHandler = (value: string | number) => {
        setStatus(value as ArticleStatusProps)
        setBlock(true)
    }

    const categoryChangeHandler = (newValue: {value?: number | undefined, label?: string | undefined, level?: number | undefined}) => {
        if(!newValue.value) return
        setCategory(typeof newValue.value == "string" ? parseInt(newValue.value) : newValue.value)
        setBlock(true)
    }

    const countryChangeHandler = (value: string | number) => {
        if(value != country) {
            setCountry(typeof value == "string" ? parseInt(value) : value)
            setCity(0)
            setRegion(0)
            setAvailableCities([])
            setAvailableRegions([])
            setBlock(true)
        }
    }

    const cityChangeHandler = (value: string | number) => {
        if(value !== city) {
            setCity(typeof value == "string" ? parseInt(value) : value)
            setRegion(0)
            setAvailableRegions([])
            setBlock(true)
        }
    }
    const regionChangeHandler = (value: string | number) => {
        if(value !== region) {
            setRegion(typeof value == "string" ? parseInt(value) : value)
            setBlock(true)
        }
    }

    const featuredImageHandler = (file: AssetMedia) => {
        setFeaturedImage({url: `${API_URL}/${file.path}`, id: file.id})
        closeModal()
        setBlock(true)
    }

    const featuredImageHandler43 = (file: AssetMedia) => {
        setFeaturedImage43({url: `${API_URL}/${file.path}`, id: file.id})
        closeModal()
        setBlock(true)
    }

    const featuredImageHandler169 = (file: AssetMedia) => {
        setFeaturedImage169({url: `${API_URL}/${file.path}`, id: file.id})
        closeModal()
        setBlock(true)
    }

    const subtitleChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSubtitle(e.target.value)
        setBlock(true)
    }

    const metaTitleHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMetaData(oldMeta => {
            return {...oldMeta, meta_title: e.target.value}
        })
        setBlock(true)
    }
    const metaDescriptionHandler = (e: string) => {
        setMetaData(oldMeta => {
            return {...oldMeta, meta_description: e}
        })
        setBlock(true)
    }

    const saveArticleHandler = async (isPublish: boolean = false) => {
        if(isPublish) {
            setStatus('published')
        }
        const data: any = {
            article_post: htmlContent,
            featured_image: featuredImage?.id,
            featured_image_id: featuredImage?.id,
            featured_image_url: featuredImage?.url,

            featured_image_4_3: featuredImage43?.id,
            featured_image_4_3_id: featuredImage43?.id,
            featured_image_4_3_url: featuredImage43?.url,

            featured_image_16_9: featuredImage169?.id,
            featured_image_16_9_id: featuredImage169?.id,
            featured_image_16_9_url: featuredImage169?.url,
            
            title: title,
            sub_title: subtitle,
            category_id: category,
            tags: tags,
            status: isPublish ? 'published' : status,
            slug: slug,
            id_country: country,
            meta_data: metaData,
            pinned: pinned
        }
        if(city) {
            data.id_city = city
        } else {
            data.id_city = null
        }
        if(region) {
            data.id_region = region
        } else {
            data.id_region = null
        }
        const checkWholeDay = selectedMetaData ? !!selectedMetaData['whole_day'] : false
        if(checkWholeDay) {
            if(!data.meta_data) {
                data.meta_data = {}
            }
            data.meta_data.whole_day = data.meta_data.whole_day ? Number(!!data.meta_data.whole_day) : 0
        }
        // console.log(selectedMetaData,'selectedMetaData')
        try {
            if(action == 'edit') {
                const editArticle = await editArticleById(articleId, {...data, id: articleId})
                if(editArticle) {
                    setNotification({message: "Success Edit Article", type: 'neutral'})
                } else {
                    throw Error()
                }
            }
            if(action == 'add') {
                const addArticle = await createArticle(data)
                if(addArticle) {
                    setNotification({message: "Success Edit Article", type: 'neutral'})
                    setPageAdminButtonText('Add Article')
                    setTimeout(() => {
                        navigation(`/admin/mst_article/edit/${addArticle.id}`)
                    }, 2000)
                } else {
                    throw Error()
                }
            }
            setBlock(false)
            return
        } catch(e) {
            setNotification({message: `Failed to ${action} article`, type: 'fail'})
            console.log(e)
        }
        return
    }

    const tagsChangeHandler = (e: any) => {
        setTags(e.map((tag: {value: string | number, label: string}) => (tag.value)))
    }
    const renderTags = () => {
        if(!availableTags.length) return
        return (
            <InputWrapper label="Tags">
                <ReactSelect options={availableTags.map(tag => ({label: tag.name, value: tag.id}))} isMulti={true} onChange={tagsChangeHandler} value={availableTags.filter(tag => tags.includes(tag.id)).map(tag => ({value: tag.id, label: tag.name}))} />
            </InputWrapper>
        )
    }
    // if(readyInput) {
        return (
            <>
                <div className="grid grid-cols-12 gap-x-12">
                    <div className="col-span-8">
                        <ComponentCard>
                            <InputWrapper label="Title *">
                                <Input required placeholder="Title" value={title} onChange={titleChangeHandler} />
                            </InputWrapper>
                            <InputWrapper label="Slug *">
                                <Input required placeholder="Slug" value={slug} onChange={slugChangeHandler} />
                            </InputWrapper>
                            <InputWrapper label="Subtitle">
                                <Input placeholder="Subtitle" value={subtitle} onChange={subtitleChangeHandler}></Input>
                            </InputWrapper>
                            <InputWrapper label="Content *">
                            <>
                                {
                                    htmlContent !== undefined &&
                                    <>
                                        <QuillWysiwyg onChange={contentChangeHandler} value={htmlContent}  />
                                    </>
                                }
                            </>
                            </InputWrapper>
                            <div className="spacer py-6"></div>
                            {renderMetadata()}
                        </ComponentCard>
                        <br />
                        <ComponentCard>
                            <InputWrapper label="Meta Title">
                                <Input placeholder={title} value={metaData?.meta_title || ""} onChange={metaTitleHandler}></Input>
                            </InputWrapper>
                            <InputWrapper label="Meta Description">
                                <TextArea value={metaData?.meta_description || ""} placeholder="Meta Description" onChange={metaDescriptionHandler}></TextArea>
                                {/* <Input placeholder={title} value={metaData?.meta_title || ""}></Input> */}
                            </InputWrapper>
                        </ComponentCard>
                    </div>



                    <div className="col-span-4">
                        <ComponentCard>
                            <InputWrapper label="Post Status">
                                <Select value={status} options={[{value: 'published', label: 'Publish'}, {value: 'draft', label: 'Draft'}, {value: 'archived', label: 'Archive'}, {value: 'bin', label: 'Bin'}]} onChange={statusChangeHandler} />
                            </InputWrapper>
                            <InputWrapper label="Featured Image 1:1">
                                <AdminFeaturedImage url={featuredImage?.url ? `${featuredImage?.url}` : '#'} onClick={openModal} onSave={featuredImageHandler}></AdminFeaturedImage>
                            </InputWrapper>
                            <InputWrapper label="Featured Image 16:9">
                                <AdminFeaturedImage url={featuredImage169?.url ? `${featuredImage169?.url}` : '#'} onClick={openModal} onSave={featuredImageHandler169}></AdminFeaturedImage>
                            </InputWrapper>
                            <InputWrapper label="Featured Image 4:3">
                                <AdminFeaturedImage url={featuredImage43?.url ? `${featuredImage43?.url}` : '#'} onClick={openModal} onSave={featuredImageHandler43}></AdminFeaturedImage>
                            </InputWrapper>
                            <InputWrapper label="Category *">
                                <ReactSelect required options={transformCategories(taxonomies.categories)} placeholder="Select Category" value={{value: category, label: taxonomies.categories?.find(cat => (cat.id == category))?.title, level: taxonomies.categories?.find(cat => (cat.id == category))?.id_parent ? 1 : 0}} onChange={(newValue) => {categoryChangeHandler({...newValue})}} classNames={{
                                    option: (props) => {
                                        if(props.data?.level == 1) {
                                            return 'text-front-small ml-2 before-dash'
                                        }
                                        return ''
                                    }
                                }} />
                                {/* <Select options={inputCategories} defaultValue={category ? `${category}` : undefined} placeholder="Select Category" onChange={categoryChangeHandler}></Select> */}
                            </InputWrapper>
                            <InputWrapper label="Bali Area *">
                                <Select required options={availableCountries} value={country ? availableCountries.find(coun => coun.value == country)?.value : undefined} placeholder="Select Bali Area" onChange={countryChangeHandler}></Select>
                            </InputWrapper>
                            {renderCity()}
                            {renderRegion()}
                            {renderTags()}
                            <Switch checked={Boolean(pinned)} onChange={(props) => {setPinned(props ? 1 : 0)}} label="Pin Article" ></Switch>
                            <div className="justify-end flex gap-x-8 ">
                                {
                                    status !== 'published' &&
                                    <Button onClick={async () => {
                                        saveArticleHandler(true)
                                    }}>Go Publish</Button>
                                }
                                <Button onClick={async () => {saveArticleHandler()}}>
                                    Save
                                </Button>
                                {
                                    !!id &&
                                    <Button>
                                        <Link target="_blank" to={`/${taxonomies?.countries?.find(tax => tax.id == country)?.slug}/${taxonomies.categories?.find(cat => cat.id == category)?.slug_title}/${slug}`}>
                                            View Article
                                        </Link>
                                    </Button>
                                }
                            </div>
                        </ComponentCard>
                    </div>
                </div>
            </>
        )
    // } else {
    //     return (
    //         <></>
    //     )
    // }
}

export default EditArticle
