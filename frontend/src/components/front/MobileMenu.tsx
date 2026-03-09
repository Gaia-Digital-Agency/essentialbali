/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react"
// import NavLogo from "./NavLogo"
import { NavLink, Link, useNavigate } from "react-router"
import { CloseMenu, FacebookIconGreyDefault, InstagramIconGreyDefault, TwitterIconGreyDefault } from "../../icons"
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

const MobileMenu: React.FC<MobileMenuProps> = ({ isModalOpen = false, closeModal }) => {
  const { actualRoute } = useRoute()
  const navigate = useNavigate()
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const { initialData } = useHeaderContent()
  const { taxonomies } = useTaxonomies()
  const { contextSafe } = useGSAP({ scope: mobileMenuRef })
  const [isClient, setIsClient] = useState<boolean>(false)
  const [headerMenus, setHeaderMenus] = useState<any[]>(initialData?.header ?? [])
  const tlRef = useRef<GSAPTimeline>(null)

  const onMouseLeaveHandler = contextSafe((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.currentTarget.classList.contains('is-active')) return
    gsap.to(e.target, {
      '--hover-width': '0%',
      '--hover-color': '#b56576',
      '--hover-text': '#101828'
      // '--hover-translate': '50%'
    })
  })
  const onMouseEnterHandler = contextSafe((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.currentTarget.classList.contains('is-active')) return
    gsap.to(e.currentTarget, {
      '--hover-width': '100%',
      '--hover-color': '#b56576',
      '--hover-text': '#b56576'
      // '--hover-translate': '0%'
    })
  })

  const generateTo = (url: string) => {
    if (actualRoute?.article) {
      return `/${actualRoute.country?.slug}/${url}`
    }
    if (actualRoute?.category) {
      return '../' + url
    }
    return url
  }

  useEffect(() => {
    setIsClient(true)
    // Fetch header template if not provided by SSR
    if (!headerMenus || headerMenus.length === 0) {
      (async () => {
        try {
          const getTemplate = await getTemplateByUrl('/header')
          if (getTemplate?.data && getTemplate.status_code == 200) {
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
        } catch (e) {
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
    if (!isClient) return
    const menuEl = mobileMenuRef.current
    if (!menuEl || tlRef.current) return

    const tl = gsap.timeline({ paused: true })
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
    if (!menuEl || !isClient || !tl) return
    // const tl = gsap.timeline({paused: true})
    if (isModalOpen) {
      tl.play()
      return
    } else {
      tl.reverse()
      return
    }
  }, [isModalOpen, isClient])

  return (
    <aside ref={mobileMenuRef} className="block fixed inset-0 h-full bg-front-icewhite z-999 md:hidden" style={{ transform: "translateX(100%)" }}>
      <div className="flex flex-col h-full">
        <div className="container flex items-center justify-between py-5 h-[110px] mx-auto">
          <div className="w-full logo-wrapper">
            {/* <NavLogo url="/logo-header" to="/" /> */}
            <div className="container py-10 mx-auto search-wrapper">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const query = formData.get('q');
                  if (query) {
                    closeModal();
                    navigate(`/search?q=${encodeURIComponent(query as string)}`);
                  }
                }}
                className="relative"
              >
                <input
                  name="q"
                  type="text"
                  placeholder="Search articles, events..."
                  className="pt-4 pb-2 w-full text-center bg-transparent border-b outline-none border-front-navy/20 text-front-navy placeholder:text-front-navy/40"
                />
                <button type="submit" className="absolute left-0 bottom-2 text-front-navy/40">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </form>
            </div>
          </div>
          <div className="icons-wrapper">
            <div className="hamburger" onClick={() => { closeModal() }}>
              <CloseMenu className="w-[32px] h-[32px]" />
            </div>
          </div>
        </div>
        {/* <div className="line bg-front-navy/20 h-[1px] w-full"></div> */}

        {/* <div className="container py-10 mx-auto search-wrapper">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const query = formData.get('q');
              if (query) {
                closeModal();
                navigate(`/search?q=${encodeURIComponent(query as string)}`);
              }
            }}
            className="relative"
          >
            <input 
              name="q"
              type="text" 
              placeholder="Search articles, events..." 
              className="pt-4 pb-2 w-full text-center bg-transparent border-b outline-none border-front-navy/20 text-front-navy placeholder:text-front-navy/40"
            />
            <button type="submit" className="absolute right-0 bottom-2 text-front-navy/40">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>
        </div> */}

        <div className="flex overflow-hidden flex-col flex-1 nav-category-wrapper">
          <div className="container flex overflow-hidden flex-col flex-1 py-4 mx-auto inner">
            <div className="overflow-y-auto flex-1 menus-wrapper">
              {taxonomies.categories?.filter(cat => (headerMenus?.map((ca: any) => (ca.linkCategory))?.includes(cat.id)))?.map((menu: Category, i: number) => {
                return (
                  <div className="mb-[30px] menu" key={`mobile-${menu.id}`}>
                    <NavLink key={i} relative="path" onMouseLeave={onMouseLeaveHandler} onMouseEnter={onMouseEnterHandler} className={`menu-link text-front-medium flex-1 text-nowrap capitalize text-black${menu.slug_title == actualRoute?.category?.slug_title ? ' is-active' : ''}`} to={generateTo(menu.slug_title)}>{menu.title}</NavLink>
                  </div>
                )
              })}
              <div className="flex gap-x-6 mt-16 item">
                <Link to={'https://www.facebook.com/essentialbali'} target="_blank">
                  <FacebookIconGreyDefault className="w-[24px] h-[24px] text-front-navy" />
                </Link>
                <Link to={'https://www.instagram.com/essentialbali'} target="_blank">
                  <InstagramIconGreyDefault className="w-[24px] h-[24px] text-front-navy" />
                </Link>
                <Link to={'https://www.linkedin.com/company/essentialbali'} target="_blank">
                  <TwitterIconGreyDefault className="w-[22px] h-[22px] text-front-navy" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="outer bg-front-navy flex-0">
          <div className="py-4">
            <div className="flex gap-x-6 justify-center item">
              <Link to={'https://www.facebook.com/essentialbali'} target="_blank">
                <FacebookIcon className="w-[24px] h-[24px]" />
              </Link>
              <Link to={'https://www.instagram.com/essentialbali'} target="_blank">
                <InstagramIcon className="w-[24px] h-[24px]" />
              </Link>
              <Link to={'https://www.linkedin.com/company/essentialbali'} target="_blank">
                <LinkedinIcon className="w-[24px] h-[24px]" />
              </Link>
            </div>
          </div>
        </div> */}
      </div>
    </aside>
  )
}

export default MobileMenu
