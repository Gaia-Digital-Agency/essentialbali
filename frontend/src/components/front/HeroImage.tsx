import React, { useEffect, useState, useRef } from "react"
import { ArticleApiResponseProps } from "../../types/article.type"
import {Swiper, SwiperSlide} from "swiper/react"
import { Swiper as SwiperType } from "swiper"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import Skeleton from "react-loading-skeleton"
import Image from "./Image"
import Button from "./Button"
import "swiper/swiper-bundle.css"
import { useTaxonomies } from "../../context/TaxonomyContext"
import { useRoute } from "../../context/RouteContext"
import useArticle from "../../hooks/useArticle"
import { ComponentTemplateHomeProps, PreContentProps } from "../../types/template.type"



const HeroDescription: React.FC<React.PropsWithChildren> = ({children}) => {
    return (
        <>
            <p className="text-front-icewhite text-front-subtitle mb-6">{children || <Skeleton count={3}></Skeleton>}</p>
        </>
    )
}

const HeroTitleWrapper: React.FC<React.PropsWithChildren> = (props) => {
    return (
        <>
            <div className="absolute bottom-20 ml-[50px] left-0 right-0 z-10">
                <div className="container">
                    {props.children}
                </div>
            </div>
        </>
    )
}

const HeroTitle: React.FC<React.PropsWithChildren<{className?: string}>> = (props) => {
    return (
        <>
            <h1 className={`text-front-hero font-serif text-front-icewhite ${props.className}`}>{props.children || <Skeleton count={2}></Skeleton>}</h1>
        </>
    )
}

const HeroImage: React.FC<ComponentTemplateHomeProps> = ({preContent = [], admin = false}) => {
    const {actualRoute, clientChange} = useRoute()
    // const {locations} = useOutletContext<LocationsContextProps>()
    const {getCityById, getCountryById, getRegionById, taxonomies} = useTaxonomies()
    const {generateContent, getPermalink, getFeaturedImageUrl} = useArticle()
    // const [heroTouched, setHeroTouched] = useState<boolean>(false)
    const activeAnim = useRef<gsap.core.Tween | null>(null);
    const imageRef = useRef<SwiperType>(null)
    const textRef = useRef<SwiperType>(null)
    const navigationRef = useRef(null)
    const playControls = useRef<{ play: (index: number) => void }>({ play: () => {} });
    const CATEGORY_SLUG = 'featured'


    const [content, setContent] = useState<PreContentProps>(preContent)

    const getDeepestLocation = (article: ArticleApiResponseProps) => {
        if(article.id_region) {
            return getRegionById(article.id_region)
        }
        if(article.id_city) {
            return getCityById(article.id_city)
        }
        return getCountryById(article.id_country)
    }
    useEffect(() => {
        (async() => {
            const get = await generateContent({
                content: preContent,
                query: {
                    id_country: actualRoute?.country?.id,
                    id_city: actualRoute?.city?.id,
                    id_region: actualRoute?.region?.id,
                    limit: 3,
                    pinned: 1,
                    category: taxonomies.categories?.find(cat => (cat.slug_title == CATEGORY_SLUG))?.id
                }
            })
            if(get) {
                setContent(get)
            } else {
                setContent([])
            }
            // if(content.length) return
            // if(admin) {
            //     setContent(preContent)
            // }
            // if(!!preContent.length || admin) return
            // const getArticle = await getArticleByFields({
                // id_country: actualRoute?.country?.id,
                // id_city: actualRoute?.city?.id,
                // id_region: actualRoute?.region?.id,
                // limit: 3
            // })
            // if(getArticle) {
            //     // const setArticle = getArticle.articles.map(article => ({...article, url: generateUrl(article), category: getCategoryById(article.id), featured_image_full_url: generateImageUrl(article.featured_image_url, article.id)}))
            //     setContent(getArticle.articles)
            //     return
            // } 
        })()
    }, [actualRoute, preContent, clientChange])

    useGSAP(() => {
        if (!content.length) return;
        if (!imageRef.current) return
        const loadingBars = gsap.utils.toArray<HTMLElement>('#hero-article .loading-bar');
        const loadingTab = gsap.utils.toArray<HTMLElement>('#hero-article .tab-content')

        // --- The Master Control Function ---
        const play = (index: number) => {
            // 1. Kill any currently running animation using the ref's current value
            if (activeAnim.current) {
                activeAnim.current.kill();
            }

            let currentIndex = index;

            // 2. If we've gone past the last slide, loop back to the beginning
            if (currentIndex >= loadingBars.length) {
                currentIndex = 0;
            }

            // 3. Set the state of all progress bars correctly
            gsap.set(loadingBars, {
                width: (i) => (i < currentIndex ? '100%' : '0%'),
                height: '1px',
                backgroundColor: '#fff'
            });

            // 4. Sync the swipers to the correct slide
            imageRef.current?.slideToLoop(currentIndex);
            textRef.current?.slideToLoop(currentIndex);
            if(admin) return

            loadingTab.forEach(bar => {
                bar.classList.remove('active')
            })
            loadingTab[currentIndex]?.classList.add('active')

            // 5. Create and start the new animation for the current progress bar
            const newAnim = gsap.to(loadingBars[currentIndex], {
                width: '100%',
                duration: 6,
                ease: 'none',
                onComplete: () => {
                    // When complete, recursively call play for the next slide
                    play(currentIndex + 1);
                }
            });

            // 6. Save the new animation to the ref's .current property
            activeAnim.current = newAnim;
        };

        // Store the play function in the ref so animClickHandler can access it
        playControls.current.play = play;

        // Start the autoplay initially
        if(!admin) {
            play(0);
        }

        // Cleanup function to kill animation on component unmount
        return () => {
            activeAnim.current?.kill();
        };

    }, [content]); // Dependency array is correct


    // The click handler is now much simpler and works correctly
    const animClickHandler = (index: number) => {
        // Just call the master play function with the clicked index
        // if(!admin) {
        playControls.current.play(index);
        // }
    };
    if(content.length) {
        return (
            <>
                <section className="container">
                    <div id="hero-article" className="relative rounded-xl overflow-hidden">
                        <Swiper
                            onSwiper={(swiper) => imageRef.current = swiper}
                            slidesPerView={1}
                            // loop={true}
                            allowTouchMove={false}
                        >
                            {content.map((item, i) => {
                                if(item) {
                                    return (
                                        <SwiperSlide key={`image-${i}`}>
                                            <Image width="1920" 
                                                    height="1080" 
                                                    fetchPriority={i ? "low" : "high"} 
                                                    isLazy={i ? true : false } 
                                                    url={getFeaturedImageUrl(item, '16_9')} 
                                                    ratio={'max( calc(100vh - var(--nav-height)), 750px )'} 
                                                    mobileRatio="150%" 
                                                    overlay={true} 
                                                    alt={item?.featured_image_alt} />
                                            {/* <Image url={generateImageUrl(item.featured_image_url, item.id)} ratio={'calc(100vh - var(--nav-height))'} overlay={true} /> */}
                                        </SwiperSlide>
                                    )
                                }
                            })}
                        </Swiper>

                        <HeroTitleWrapper>
                            <Swiper
                                onSwiper={swiper => textRef.current = swiper}
                                slidesPerView={1}
                                // loop={true}
                                autoHeight={true}
                                noSwiping={true}
                                allowTouchMove={false}
                            >
                                {content.map((item, i) => {
                                    if(item) {
                                        return (
                                            <SwiperSlide key={`text-${i}`}>
                                                <div className="md:max-w-3/4">
                                                    <HeroTitle className={'mb-[20px]'}>{item.title}</HeroTitle>
                                                    <HeroDescription>{item?.sub_title}</HeroDescription>
                                                    <div className="mt-[40px]">
                                                        <Button type="secondary" text="Explore More" link={admin ? undefined : getPermalink(item)} />
                                                    </div>
                                                </div>
                                            </SwiperSlide>
                                        )
                                    }
                                })}
                            </Swiper>
                            {/* <div className="grid grid-cols-3 gap-x-8 pt-12" ref={navigationRef}>
                                {content.map((item, i) => {
                                    if(item) {
                                        return (
                                            <div onClick={() => {animClickHandler(i)}} data-index={i} className={`tab-content text-white col-span-3 md:col-span-1 cursor-pointer${i == 0 ? ' active': ''}`} key={`tabs-${i}`}>
                                                <div className="loading-bar-wrapper relative h-[1px] mb-4">
                                                    <div className="loading-bar mb-2"></div>
                                                </div>
    
                                                <div className="category-wrapper mb-4">
                                                    {item ? getDeepestLocation(item)?.name : <Skeleton />}
                                                </div>
                                                <div className="title-wrapper hidden">
                                                    {item?.title ? item.title : <Skeleton />}
                                                </div>
                                            </div>
                                        )
                                    }
                                })}
                            </div> */}
                        </HeroTitleWrapper>
                    </div>
                </section>
            </>
        )
    } else {
        return (
            <div className="h-screen w-screen relative">
                <Skeleton className="absolute w-full h-full inset-0" />
                <HeroTitleWrapper>
                    <HeroTitle></HeroTitle>
                    <HeroDescription></HeroDescription>
                </HeroTitleWrapper>
            </div>
        )
    }
}


export const AdminHeroImage: React.FC<ComponentTemplateHomeProps> = ({preContent = [0,0,0]}) => {
    const wrapperRef = useRef<HTMLDivElement>(null)
    const [content, setContent] = useState<PreContentProps>([])
    useEffect(() => {
        (async() => {
            const content = await generateContent({content: preContent, admin: true})
            if(content) {
                setContent(content)
            }
        })()
    }, [preContent])
    const {generateContent} = useArticle()
    if(content.length) {
        return (
            <>
                <div ref={wrapperRef}>
                    <HeroImage admin={true} preContent={content} />
                </div>
            </>
        )
    }
}

export default HeroImage
