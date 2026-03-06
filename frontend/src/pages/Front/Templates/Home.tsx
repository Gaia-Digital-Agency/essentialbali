import React from "react"; //{ useState, useEffect }
// import {Trending} from "../../../components/front/Trending"
import HeroImage from "../../../components/front/HeroImage";
// import MostPopular from "../../../components/front/MostPopular"
// import UltimateGuide from "../../../components/front/UltimateGuide"
import LocalBali from "../../../components/front/LocalBali";
import Newsletter from "../../../components/front/Newsletter";
// import EventsHome from "../../../components/front/EventsHome"
// import Advertisement from "../../../components/front/Advertisement"
// import About from "../../../components/front/About"
// import { useContent } from "../../../context/ContentContext";
import { useRoute } from "../../../context/RouteContext";
// import { getTemplateByUrl } from "../../../services/template.service";
// import { HomeTemplate as DefaultHomeTemplate } from "../../../lib/map/TemplatesMap";
import pkg from "../../../lib/utils/Helmet";
import BaliEssentialSection1 from "../../../components/front/BaliEssentialSection1";
import BaliEssentialSection2 from "../../../components/front/BaliEssentialSection2";
import BaliEssentialSection3 from "../../../components/front/BaliEssentialSection3";
import { useTaxonomies } from "../../../context/TaxonomyContext";
// import { useTaxonomies } from "../../../context/TaxonomyContext"
const { Helmet } = pkg;

const SITE_URL = import.meta.env.VITE_SITE_URL || "";

export const Spacer: React.FC = () => (
  <div className="py-6 spacer md:py-12"></div>
);

const HomeTemplate: React.FC = () => {
  // const { initialData } = useContent();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const [content, setContent] = useState<any>(
  //   initialData?.template ?? DefaultHomeTemplate,
  // );
  // const content = DefaultHomeTemplate;
  // const [isReady, setIsReady] = useState<boolean>(true);
  const { actualRoute } = useRoute(); //clientChange
  const { taxonomies } = useTaxonomies();

  const vaCategories = taxonomies?.categories ?? [];
  const category_section1 = vaCategories[0]?.slug_title;
  const category_section2 = vaCategories[1]?.slug_title;
  const category_section3 = vaCategories[2]?.slug_title;

  const category_rest = vaCategories.slice(3).map((item) => item.slug_title);

  // const isLocation = actualRoute?.country || actualRoute?.city || actualRoute?.region;
  // useEffect(() => {
  //   setIsReady(false);
  //   (async () => {
  //     try {
  //       const _urlToGet = isLocation
  //         ? `${actualRoute?.country ? `/${actualRoute.country.slug}` : ""}${actualRoute?.city ? `/${actualRoute.city.slug}` : ""}${actualRoute?.region ? `/${actualRoute.region.slug}` : ""}`
  //         : "/";
  //       const urlToGet = `/v2${_urlToGet}`;
  //       const getTemplate = await getTemplateByUrl(urlToGet);
  //       if (getTemplate?.data?.content && getTemplate.status_code == 200) {
  //         setContent(JSON.parse(getTemplate.data.content));
  //       } else {
  //         setContent(DefaultHomeTemplate);
  //       }
  //       setIsReady(true);
  //     } catch (e) {
  //       console.error(e);
  //       setIsReady(true);
  //       setContent(DefaultHomeTemplate);
  //     }
  //   })();
  // }, [actualRoute, clientChange]);
  
  
  // const heroImage = content.heroImage ? content.heroImage.articles : [0, 0, 0];
  // // const trending = content.trending ? content.trending.articles : [0,0,0,0,0]
  // // const mostPopular = content.mostPopular ? content.mostPopular.articles : [0,0,0,0,0,0,0,0]
  // const events = content.events ? content.events.articles : [0, 0, 0, 0];
  // const ultimateGuide = content.ultimateGuide
  //   ? content.ultimateGuide.articles
  //   : [0, 0, 0, 0, 0, 0];
  // const overseas = content.overseas
  //   ? content.overseas.articles
  //   : [0, 0, 0, 0, 0, 0, 0, 0];
  // const section3 = content.section3 ? content.section3.articles : [0, 0];

  const getDeepestLocation = () => {
    if (actualRoute.country) return actualRoute.country.name;
    return "Home";
  };

  const pageTitle = `${getDeepestLocation()} - essentialbali`;

  const getHelmet = () => {
    return (
      <Helmet>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="essentialbali is the ultimate Bali area guide for travelers, expats, and locals, featuring the best dining, events, schools, wellness, and travel in Bali"
        />
        <link rel="canonical" href={SITE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta
          property="og:description"
          content="essentialbali is the ultimate Bali area guide for travelers, expats, and locals, featuring the best dining, events, schools, wellness, and travel in Bali"
        />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:site_name" content="essentialbali" />
      </Helmet>
    );
  };

  // if (!isReady) return <>{getHelmet()}</>;
  return (
    <div className="min-h-screen overflow-x-hidden bg-front-icewhite">
      {getHelmet()}
      
      {/* Hero Section */}
      <section className="relative">
        <HeroImage 
        // preContent={heroImage} 
        preContent={[0,0,0]} 
        />
      </section>

      {/* Main Content Sections */}
      <main className="flex flex-col">
        <BaliEssentialSection1
          default_category={category_section1}
          // preContent={ultimateGuide}
          preContent={[0,0,0]}
        />
        
        <BaliEssentialSection2
          default_category={category_section2}
          // preContent={events}
          preContent={[0,0,0,0]}
        />
        
        <BaliEssentialSection3
          default_category={category_section3}
          // preContent={section3}
          preContent={[0,0]}
        />
        
        <LocalBali default_category={category_rest} 
          // preContent={overseas} 
          preContent={[0, 0, 0, 0, 0, 0, 0, 0]} 
          />
      </main>

      {/* Footer Newsletter Section */}
      <div className="px-2 bg-blue-500 bg-front-icewhite md:px-0">
        <div className="mx-auto">
          <Spacer />
          <Newsletter />
          <Spacer />
        </div>
      </div>
    </div>
  );
};

export default HomeTemplate;
