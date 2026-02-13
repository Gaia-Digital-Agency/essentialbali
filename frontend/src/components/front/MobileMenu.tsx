import React, {useEffect, useRef, useState} from "react"
import NavLogo from "./NavLogo"
import NavLocation from "./NavLocation"
import { NavLink, Link } from "react-router"
import { InstagramIcon, FacebookIcon, LinkedinIcon, CloseMenu } from "../../icons"
import { Category } from "../../types/category.type"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { useRoute } from "../../context/RouteContext"
import { useHeaderContent } from "../../context/HeaderContext"
import { useTaxonomies } from "../../context/TaxonomyContext"
import { getTemplateByUrl } from "../../services/template.service"

type MobileMenuProps = {
    isModalOpen: boolean,
    closeModal: () => void,
}

const MobileMenu: React.FC<MobileMenuProps> = ({isModalOpen = false, closeModal}) => {
    const {actualRoute} = useRoute()
    const mobileMenuRef = useRef<HTMLDivElement>(null)
    const {initialData} = useHeaderContent()
    const {taxonomies} = useTaxonomies()
    const {contextSafe} = useGSAP({scope: mobileMenuRef})
    const [isClient, setIsClient] = useState<boolean>(false)
    const [headerMenus, setHeaderMenus] = useState<any[]>(initialData?.header ?? [])
    const tlRef = useRef<GSAPTimeline>(null)

    const onMouseLeaveHandler = contextSafe((e: React.MouseEvent<HTMLAnchorElement>) => {
        if(e.currentTarget.classList.contains('is-active')) return
        gsap.to(e.target, {
            '--hover-width': '0%',
            '--hover-color': '#b56576',
            '--hover-text': '#101828'
            // '--hover-translate': '50%'
        })
    })
    const onMouseEnterHandler = contextSafe((e: React.MouseEvent<HTMLAnchorElement>) => {
        if(e.currentTarget.classList.contains('is-active')) return
        gsap.to(e.currentTarget, {
            '--hover-width': '100%',
            '--hover-color': '#b56576',
            '--hover-text': '#b56576'
            // '--hover-translate': '0%'
        })
    })

    const generateTo = (url: string) => {
        if(actualRoute?.article) {
            return `/${actualRoute.country?.slug}/${url}`
        }
        if(actualRoute?.category) {
            return '../' + url
        }  
        return url
    }

    useEffect(() => {
        setIsClient(true)
        // Fetch header template if not provided by SSR
        if (!headerMenus || headerMenus.length === 0) {
            (async() => {
                try {
                    const getTemplate = await getTemplateByUrl('/header')
                    if(getTemplate?.data && getTemplate.status_code == 200) {
                        const jsonData = JSON.parse(getTemplate.data.content)
                        setHeaderMenus(jsonData)
                    } else {
                        // Fallback: show all top-level categories
                        const fallbackMenus = taxonomies.categories?.filter(cat => !cat.id_parent)?.map(cat => ({
                            label: cat.title,
                            url: cat.slug_title,
                            linkCategory: cat.id
                        })) ?? []
                        setHeaderMenus(fallbackMenus)
                    }
                } catch(e) {
                    console.log('Error fetching header template:', e)
                    // Fallback: show all top-level categories
                    const fallbackMenus = taxonomies.categories?.filter(cat => !cat.id_parent)?.map(cat => ({
                        label: cat.title,
                        url: cat.slug_title,
                        linkCategory: cat.id
                    })) ?? []
                    setHeaderMenus(fallbackMenus)
                }
            })()
        }
    }, [taxonomies.categories])

    useEffect(() => {
        if(!isClient) return
        const menuEl = mobileMenuRef.current
        if(!menuEl || tlRef.current) return

        const tl = gsap.timeline({paused: true})
        tl.fromTo(menuEl, {
            translateX: '100%'
        }, {
            translateX: '0%'
        })
        tlRef.current = tl
    }, [isClient])

    useEffect(() => {
        const menuEl = mobileMenuRef.current
        const tl = tlRef.current
        if(!menuEl || !isClient || !tl) return
        // const tl = gsap.timeline({paused: true})
        if(isModalOpen) {
            tl.play()
            return
        } else {
            tl.reverse()
            return
        }
    }, [isModalOpen, isClient])

    return (
        <aside ref={mobileMenuRef} className="fixed inset-0 bg-white h-full z-[999] block md:hidden" style={{transform: "translateX(100%)"}}>
            <div className="flex flex-col h-full">
                <div className="container mx-auto py-6 flex justify-between items-center">
                    <div className="logo-wrapper w-max">
                        <NavLogo url="/logo-header" to="/" />
                    </div>
                    <div className="icons-wrapper">
                        <div className="hamburger" onClick={() => {closeModal()}}>
                            <CloseMenu className="w-[32px] h-[32px]" />
                        </div>
                    </div>
                </div>
                <div className="line bg-black h-[1px] w-full"></div>


                <div className="location-wrapper nav-location-wrapper flex flex-col flex-0">
                    <div className="location">
                        <div className="inner container mx-auto py-4">
                            <NavLocation />
                        </div>
                        <div className="">
                            <div className="line bg-black h-[1px] w-full"></div>
                        </div>
                    </div>
                </div>
                    
                <div className="nav-category-wrapper flex flex-col flex-1 overflow-hidden">
                    <div className="inner container mx-auto py-4 flex-1 flex flex-col overflow-hidden">
                        <div className="menus-wrapper flex-1 overflow-y-auto">
                            {taxonomies.categories?.filter(cat => (headerMenus?.map((ca: any) => (ca.linkCategory))?.includes(cat.id)))?.map((menu: Category, i: number) => {
                                return (
                                    <div className="menu mb-4" key={`mobile-${menu.id}`}>
                                        <NavLink key={i} relative="path" onMouseLeave={onMouseLeaveHandler} onMouseEnter={onMouseEnterHandler} className={`menu-link text-front-body-big flex-1 text-nowrap uppercase text-black${menu.slug_title == actualRoute?.category?.slug_title ? ' is-active' : ''}`} to={generateTo(menu.slug_title)}>{menu.title}</NavLink>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="outer bg-front-red flex-0">
                    <div className="py-4">
                        <div className="item flex justify-center gap-x-6">
                            <Link to={'#'} target="_blank">
                                <FacebookIcon className="w-[24px] h-[24px]" />
                            </Link>
                            <Link to={'#'} target="_blank">
                                <InstagramIcon className="w-[24px] h-[24px]" />
                            </Link>
                            <Link to={'#'} target="_blank">
                                <LinkedinIcon className="w-[24px] h-[24px]" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}

export default MobileMenu