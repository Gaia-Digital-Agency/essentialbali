import React, { useEffect, useRef, useState } from "react";
import { useViewTransitionState } from "react-router";
import { useRoute } from "../../../context/RouteContext";
import { ArticleProps } from "../../../types/article.type";
import Image from "../../../components/front/Image";
import { getCurrencySymbol } from "../../../lib/utils/format";
import Input from "../../../components/form/input/InputField";
import Button from "../../../components/front/Button";
import { Link } from "react-router";
import PhoneInput from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { applyJob } from "../../../services/job.service";
import { useNotification } from "../../../context/NotificationContext";
import pkg from "../../../lib/utils/Helmet"
const {Helmet} = pkg

const SITE_URL = import.meta.env.VITE_SITE_URL || ''
const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL || ''
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || API_URL



const TagsBox: React.FC<{text: string | number}> = ({text}) => {

    return (
        <>
            <div className="px-2.5 py-1.5 bg-[#eee]">
                <p className="font-medium text-[#202020]">{text}</p>
            </div>
        </>
    )
}


const SingleJob: React.FC = () => {

    const {actualRoute} = useRoute()
    const [content, setContent] = useState<ArticleProps>()
    const [transition, setTransition] = useState<boolean>(false)
    const [email, setEmail] = useState<string>()
    const [phone, setPhone] = useState<string>()
    const [cv, setCv] = useState<File | null>()
    const errorRef = useRef<HTMLDivElement>(null)
    const cvRef = useRef<HTMLInputElement>(null)
    const {setNotification} = useNotification()
    const ALLOWED_EXTENSION = ['pdf', 'png', 'jpg', 'jpeg', 'txt']
    useEffect(() => {
        (async () => {
            if(!actualRoute.article) return
            setContent(actualRoute.article)
            // const getArticle = await getArticleBySlug(actualRoute.article)
            // if(getArticle) {
            //     setContent(getArticle)
            // }
        })()
    }, [actualRoute])

    let metadata
    if(typeof content?.meta_data == 'string') {
        metadata = JSON.parse(content.meta_data)
    } else {
        metadata = content?.meta_data
    }

    const salaryTime = () => {
        const salary = metadata?.salary_time
        if(salary) {
            return `${salary}`.slice(0, 1)
        }
        return 'm'
    }
    const toBack = '..'
    const isTransitioning = useViewTransitionState(toBack, {relative: 'path'})
    useEffect(() => {
        if(transition) return
        if(isTransitioning) {
            setTransition (true)
        }
    }, [isTransitioning])

    const errorApplyHandler = (type: 'email' | 'cv' | 'phone') => {
        const errorEl = errorRef.current
        if(errorEl) {
            if(type == 'email') {
                errorEl.innerHTML = 'Email is needed'
                return
            }
            if(type == 'cv') {
                errorEl.innerHTML = 'CV is needed'
                return
            }
            if(type == 'phone') {
                errorEl.innerHTML = 'Phone number is neeeded'
            }
        }
    }

    const clearError = () => {
        const errorEl = errorRef.current
        if(errorEl) {
            errorEl.innerHTML = ''
        }
    }

    const applyHandler = async () => {
        if(!email) {
            errorApplyHandler('email')
            return
        }
        if(!phone) {
            errorApplyHandler('phone')
            return
        }
        if(!cv) {
            errorApplyHandler('cv')
            return
        }
        if(actualRoute.article?.id) {
            const apply = await applyJob(actualRoute.article?.id, {applicant_email: email, phone: phone, fileCV: cv})
            if(apply) {
                clearError()
                setNotification({message: 'Your application is sent to the system', type: 'neutral'})
            }
        }
    }

    const cvHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if(!file) return

        const fileExtension = file.name.split('.').pop()?.toLowerCase()
        if(!fileExtension || !ALLOWED_EXTENSION.includes(fileExtension)) {
            e.target.value = ''
            setCv(undefined)
            const errorEl = errorRef.current
            if(errorEl) {
                errorEl.innerHTML = `Allowed file extensions ${ALLOWED_EXTENSION.join(', ')}`
            }
            return
        }
        setCv(file)
    }

    const filenameRender = () => {
        return cv ? cv.name : 'No file Choosen'
    }

    return (
        <>
            <Helmet>
                <title>{actualRoute.article?.title} - essentialbali</title>
                <meta name="description" content={actualRoute.article?.sub_title} />
                <link rel="canonical" href={`${SITE_URL}/${actualRoute.country?.slug}/${actualRoute.category?.slug_title}/${actualRoute.article?.slug}`} />
                <meta property="og:type" content="article" />
                <meta property="og:title" content={`${actualRoute.article?.title} - essentialbali`} />
                <meta property="og:description" content={actualRoute.article?.sub_title} />
                <meta property="og:url" content={`${SITE_URL}/${actualRoute.country?.slug}/${actualRoute.category?.slug_title}/${actualRoute.article?.slug}`} />
                <meta property="og:image" content={`${IMAGE_URL}/${actualRoute.article?.featured_image_16_9_url || actualRoute.article?.featured_image_url || 'images/placeholder.png'}`} />
                <meta property="og:site_name" content="essentialbali" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${actualRoute.article?.title} - essentialbali`} />
                <meta name="twitter:description" content={actualRoute.article?.sub_title} />
                <meta name="twitter:image" content={`${IMAGE_URL}/${actualRoute.article?.featured_image_16_9_url || actualRoute.article?.featured_image_url || 'images/placeholder.png'}`} />
            </Helmet>
            <div className="content pb-12 bg-white transition" style={
                transition ?
                {transform: 'translateY(100%)'} :
                {transform: 'translateY(0%)'}
            }>
                <article>
                    <div className="container border-b pt-16 border-front-black">
                        <div className="flex justify-end mb-2">
                            <div className="icon-close cursor-pointer">
                                <Link to={toBack} relative="path" viewTransition>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
                                        <g clipPath="url(#clip0_649_3708)">
                                            <path d="M23.75 8.0125L21.9875 6.25L15 13.2375L8.0125 6.25L6.25 8.0125L13.2375 15L6.25 21.9875L8.0125 23.75L15 16.7625L21.9875 23.75L23.75 21.9875L16.7625 15L23.75 8.0125Z" fill="#646464"/>
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_649_3708">
                                                <rect width="30" height="30" fill="white"/>
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </Link>
                            </div>
                        </div>
                        <div className="flex justify-between items-end py-8">
                            <div className="item flex gap-x-6">
                                <div className="image-wrapper w-[150px]">
                                    <Image ratio="150px" url={metadata?.company_logo ?? '/logo.png'}  />
                                </div>
                                <div className="item">
                                    <div className="flex flex-col justify-between h-full">
                                        <div className="items">
                                            <div className="title-wrapper mb-2">
                                                <h1 className="font-bold text-front-main-title">{content?.title}</h1>
                                            </div>
                                            <div className="meta-wrapp">
                                                <p className="text-front-body-big text-[#767676]">{metadata?.company_name ?? 'Company A'} | {metadata?.company_location ?? 'Bali, Uluwatu'}</p>
                                            </div>
                                        </div>
                                        <div className="meta">
                                            <div className="tags-wrapper flex gap-x-2.5 mb-2.5">
                                                <TagsBox text={metadata?.job_type ?? 'Fulltime'} />
                                                <TagsBox text={metadata?.experience ? `${metadata.experience} Years` : '1 Years'} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="item flex h-full justify-end items-end">
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
                        </div>
                    </div>

                    <div className="container">
                        <div className="outer">
                            <div className="grid grid-cols-12 md:gap-x-10">
                                <div className="col-span-12 md:col-span-9">
                                    <div className="inner py-8 min-h-[80vh]">
                                        <div className="content-wrapper" dangerouslySetInnerHTML={{__html: content?.article_post ?? ''}}>

                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-12 md:col-span-3 md:border-l md:border-l-front-black">
                                    <div className="inner mb-2 md:pl-8 py-8">
                                        <div className="input-wrapper mb-4">
                                            <div className="more-inner mb-4">
                                                <Input placeholder="Enter Your Email" onChange={e => {setEmail(e.target.value)}} className="rounded-none !text-front-small" />
                                            </div>
                                            <div className="more-inner">
                                                <PhoneInput placeholder="Phone Number" className="border border-gray-300 py-2.5 px-4 text-front-small placeholder:text-gray-400" onChange={e => {setPhone(e);}} value={phone} />
                                                {/* <Input placeholder="Phone Number" onChange={e => {setPhone(e.target.value)}} className="rounded-none" /> */}
                                            </div>
                                        </div>
                                        <div className="input-wrapper">
                                            {/* <Button text="Enter CV" ></Button> */}
                                            <div className="flex gap-x-4 items-center cursor-pointer" onClick={() => {cvRef.current ? cvRef.current.click() : null}}>
                                                <div className="button text-front-small px-4 bg-front-red text-front-white py-4">
                                                    Enter CV
                                                </div>
                                                <div className="filename text-[14px]">
                                                    {filenameRender()}
                                                </div>
                                            </div>
                                            <input type="file" className="pt-2 hidden" id="cv" ref={cvRef} onChange={cvHandler} placeholder="Enter your CV" />
                                        </div>
                                        <div ref={errorRef} className="error-warning-wrapper text-front-red text-front-body">
                                            
                                        </div>
                                    </div>
                                    <div className="button-wrapper text-end">
                                        <Button borderOnly={true} onClick={applyHandler} text="APPLY NOW" />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </>
    )
}

export default SingleJob