import React, {useState, useEffect} from "react"
import {Trending} from "../../../components/front/Trending"
import HeroImage from "../../../components/front/HeroImage"
import MostPopular from "../../../components/front/MostPopular"
import UltimateGuide from "../../../components/front/UltimateGuide"
import LocalBali from "../../../components/front/LocalBali"
import Newsletter from "../../../components/front/Newsletter"
import EventsHome from "../../../components/front/EventsHome"
import Advertisement from "../../../components/front/Advertisement"
import About from "../../../components/front/About"
import { useContent } from "../../../context/ContentContext"
import { useRoute } from "../../../context/RouteContext"
import { getTemplateByUrl } from "../../../services/template.service"
import { HomeTemplate as DefaultHomeTemplate } from "../../../lib/map/TemplatesMap"
import pkg from "../../../lib/utils/Helmet"
import BaliEssentialSection1 from "../../../components/front/BaliEssentialSection1"
const {Helmet} = pkg

const SITE_URL = import.meta.env.VITE_SITE_URL || ''


export const Spacer: React.FC = () => (<div className="spacer md:py-12 py-6"></div>)

const HomeTemplate: React.FC = () => {
    const {initialData} = useContent()
    const [content, setContent] = useState<any>(initialData?.template ?? DefaultHomeTemplate)
    const [isReady, setIsReady] = useState<boolean>(true)
    const {actualRoute, clientChange} = useRoute()
    // const isV2 = searchParams.get('v2')
    const isLocation = actualRoute?.country || actualRoute?.city || actualRoute?.region
    useEffect(() => {
        setIsReady(false);
        (async () => {
            try {
                const _urlToGet = isLocation ? `${actualRoute?.country ? `/${actualRoute.country.slug}` : ''}${actualRoute?.city ? `/${actualRoute.city.slug}` : ''}${actualRoute?.region ? `/${actualRoute.region.slug}` : ''}` : '/'
                const urlToGet = `/v2${_urlToGet}`
                const getTemplate = await getTemplateByUrl(urlToGet)
                if(getTemplate?.data?.content && getTemplate.status_code == 200) {
                    setContent(JSON.parse(getTemplate.data.content))
                    console.log("Get Data Template By Query from API")
                } else {
                    setContent(DefaultHomeTemplate)
                    console.log("Get Data Template By Query from Default")
                    // if(isV2){
                    //     // const theContent = await generateContent(DefaultHomeTemplate) 
                    // } else {
                    //     setContent(null)
                    // }
                }
                setIsReady(true)
            } catch(e) {
                console.log(e)
                setIsReady(true)
                setContent(DefaultHomeTemplate)
            }
        })()
    }, [actualRoute, clientChange])
    const heroImage = content.heroImage ? content.heroImage.articles : [0,0,0]
    const trending = content.trending ? content.trending.articles : [0,0,0,0,0]
    const mostPopular = content.mostPopular ? content.mostPopular.articles : [0,0,0,0,0,0,0,0]
    const events = content.events ? content.events.articles : [0,0,0,0]
    const ultimateGuide = content.ultimateGuide ? content.ultimateGuide.articles : [0,0,0,0,0,0]
    const overseas = content.overseas ? content.overseas.articles : [0,0,0,0,0,0,0,0]
    const getDeepestLocation = () => {
        if(actualRoute.region) return actualRoute.region.name
        if(actualRoute.city) return actualRoute.city.name
        if(actualRoute.country) return actualRoute.country.name
        return 'Home'
    }
    const getHelmet = () => {
        return (
            <Helmet>
                <title>{getDeepestLocation()} - essentialbali</title>
                <meta name="description" content="essentialbali is the ultimate Bali area guide for travelers, expats, and locals, featuring the best dining, events, schools, wellness, and travel in Bali" />
                <link rel="canonical" href={SITE_URL} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Home - essentialbali" />
                <meta property="og:description" content="essentialbali is the ultimate Bali area guide for travelers, expats, and locals, featuring the best dining, events, schools, wellness, and travel in Bali" />
                <meta property="og:url" content={SITE_URL} />
                <meta property="og:site_name" content="essentialbali" />
            </Helmet>
        )
    }

    if(!isReady) return (
        <>
            {getHelmet()}
        </>
    )
    return (
        <>
            {getHelmet()}
            <HeroImage preContent={heroImage} />
            {/* <Spacer />
            <div className="container">
                <Advertisement />
            </div> */}
            <BaliEssentialSection1 preContent={ultimateGuide} />
            
            <Trending preContent={trending} />
            {
                isLocation &&
                <>
                    <MostPopular preContent={mostPopular} />
                </>
            }
            <EventsHome preContent={events} />
            <UltimateGuide preContent={ultimateGuide} />
            <LocalBali preContent={overseas} />
            <div className="outer bg-front-section-grey">
                <Spacer />
                <About />
                    <Newsletter />
                <Spacer />
            </div>
        </>
    )

}

export default HomeTemplate
