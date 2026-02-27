import React, { useEffect, useRef, useState } from "react";
import { ArticleApiResponseProps } from "../../types/article.type"; //ArticleProps
import Image from "./Image";
// import Button from "./Button";
// import { Link } from "react-router";
import { useRoute } from "../../context/RouteContext";
import { useTaxonomies } from "../../context/TaxonomyContext";
import useArticle from "../../hooks/useArticle";
import {
  PreContentProps,
  ComponentTemplateHomeProps,
} from "../../types/template.type";
import { ButtonChevronBorderArang } from "../../icons";
import TextLink from "./TextLink";
// import NavLogo from "./NavLogo";
import About from "./About";
import { Link } from "react-router";

const LocalBali: React.FC<ComponentTemplateHomeProps> = ({
  default_category = ["featured"],
  preContent = [],
}) => {
  const { actualRoute, clientChange } = useRoute();
  const { taxonomies } = useTaxonomies(); //getCategoryById
  // const {locations} = useOutletContext<LocationsContextProps>()
  // const {availableCategories} = useOutletContext<AvailableCategoriesProps>()
  const CATEGORY_SLUGS = default_category as string[];
  const { generateContent } = useArticle(); //getPermalink, getFeaturedImageUrl
  // const imageRef = useRef<any>(null);
  const [content, setContent] = useState<PreContentProps>(preContent);

  // const findCategory = (article: ArticleProps) => {
  //   return getCategoryById(article.category_id);
  // };

  useEffect(() => {
    (async () => {
      try {
        // const filterCountry = taxonomies?.countries
        //   ?.filter((country) => actualRoute?.country?.id != country.id)
        //   .map((country) => country.id);

        const get = await generateContent({
          content: preContent,
          query: {
            // id_country: filterCountry,
            limit: 8,
            category: taxonomies.categories
              ?.filter((item) => CATEGORY_SLUGS.includes(item.slug_title))
              .map((cat) => cat.id),
          },
        });
        if (get) {
          setContent(get);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [actualRoute, preContent, clientChange]);

  const renderSVG = () => {
    return (
      <span className="text-front-navy group-hover:text-red-500 transition-colors duration-300">
        <ButtonChevronBorderArang />
      </span>
    );
  };

  const exploreMore = () => {
    return (
      <p className="font-sans text-front-charcoal-grey">
        <span className="inline-flex items-center gap-2 group cursor-pointer">
          {/* group-hover:-translate-x-1 */}
          <span className="transition-transform duration-300 translate-x-6 group-hover:-translate-x-1">
            <TextLink
              text="Explore More"
              link={`${actualRoute?.country ? `/${actualRoute.country.slug}` : ""}${actualRoute?.city ? `/${actualRoute.city.slug}` : ""}${actualRoute?.region ? `/${actualRoute.region.slug}` : ""}/area-highlights`}
              color="black"
            />
          </span>
          <span className="opacity-0 translate-x-4 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0">
            {renderSVG()}
          </span>
        </span>
      </p>
    );
  };

  return (
    <>
      {!!content.filter(Boolean).length && (
        <>
          <section id="essential-brief">
            <div className="w-[100%] pt-12 bg-front-icewhite">
              <div className="container mx-auto">
                <div>
                  <div className="flex justify-between items-end mb-2.5">
                    <h2 className="text-2xl font-serif text-front-navy capitalize">
                      {`Essential Feeds`}
                    </h2>
                    {/* {exploreMore()} */}
                  </div>
                </div>
                <div className="line bg-front-dustly-slate h-[0.5px] w-full"></div>
              </div>
            </div>

            <div className="bg-front-icewhite ">
              <div className="container flex flex-row gap-x-8 py-8">
                <div className="flex flex-col w-3/4 gap-y-9  ">
                  <div id="articles" className=" flex flex-col gap-y-8 ">
                    {content?.map((article) =>
                      article ? (
                        <LocalBaliItem key={article.id} article={article} />
                      ) : null,
                    )}
                  </div>
                  <div className="flex flex-row items-center justify-center ">
                    {exploreMore()}
                  </div>
                </div>
                <div className="w-1/4">
                  <div id="about-essentialbali" className="logo-wrapper max-w">
                    <div>
                      <About />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
};

const LocalBaliItem: React.FC<{
  article: ArticleApiResponseProps;
}> = ({ article }) => {
  const { getPermalink, getFeaturedImageUrl } = useArticle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageRef = useRef<any>(null);

  return (
    <Link to={getPermalink(article)}>
      <div
        className="flex flex-row gap-x-8 group"
        onMouseEnter={() => imageRef.current?.zoomIn()}
        onMouseLeave={() => imageRef.current?.zoomOut()}
      >
        <div className="image-wrapper w-1/3">
          <Image
            url={getFeaturedImageUrl(article)}
            ratio="50%"
            mobileRatio="125%"
            link={getPermalink(article)}
            alt={article?.featured_image_alt}
            ref={imageRef}
          />
        </div>

        <div className="flex flex-col w-2/3 gap-y-2.5">
          <p className="text-[16px] text-front-shadowed-slate font-sans">
            {article?.category_name}
          </p>

          <p className="text-[32px] font-serif text-front-navy capitalize transition-all duration-300 group-hover:[text-shadow:0_0_0.3px_currentColor]">
            {article.title}
          </p>

          <p className="text-[18px] text-front-charcoal-grey font-sans">
            {article.sub_title}
          </p>
        </div>
      </div>
    </Link>
  );
};

export const AdminLocalBali: React.FC<ComponentTemplateHomeProps> = ({
  preContent,
}) => {
  const [content, setContent] = useState<PreContentProps>([]);
  const { generateContent } = useArticle();
  useEffect(() => {
    (async () => {
      const get = await generateContent({
        content: preContent,
        admin: true,
      });
      if (get) {
        setContent(content);
      }
    })();
  }, [preContent]);
  if (content.length) {
    return <LocalBali preContent={content} admin={true} />;
  }
};

export default LocalBali;
