import { useEffect, useRef, useState } from "react";
import { useRoute } from "../../context/RouteContext";
import { useTaxonomies } from "../../context/TaxonomyContext";
// import { Spacer } from "../../pages/Front/Templates/Home";
import {
  ComponentTemplateHomeProps,
  PreContentProps,
} from "../../types/template.type";
import useArticle from "../../hooks/useArticle";
import { ButtonChevronBorderArang } from "../../icons";
import TextLink from "./TextLink";
import Image from "./Image";
// import { formatPublished } from "../../lib/utils/format";
import { Link } from "react-router";
import { ArticleApiResponseProps } from "../../types/article.type";

const ArticleItems: React.FC<{
  article: ArticleApiResponseProps;
  admin?: boolean;
}> = ({ article, admin }) => {
  const { getFeaturedImageUrl, getPermalink } = useArticle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageRef = useRef<any>(null);

  return (
    <div
      className="group w-[100%]"
      onMouseEnter={() => imageRef.current?.zoomIn()}
      onMouseLeave={() => imageRef.current?.zoomOut()}
    >
      <div className="pb-5">
        <Image
          // url="https://images.unsplash.com/photo-1721879223016-96dbd4952ffd?q=80&w=987&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          url={getFeaturedImageUrl(article)}
          ratio="60%"
          link={admin ? undefined : getPermalink(article)}
          alt={article?.featured_image_alt}
          ref={imageRef}
        />
      </div>
      <div className="flex flex-col gap-y-2.5">
        <p className="text-[16px] text-front-shadowed-slate font-sans">{article?.category_name}</p>
        <Link to={admin ? "" : getPermalink(article)}>
          <h3
            className="text-[32px] font-serif text-front-navy capitalize transition-all duration-300
                        group-hover:[text-shadow:0_0_0.3px_currentColor]"
          >
            {article?.title}
          </h3>
          {/* <p className="text-front-title font-serif">{article.title}</p> */}
        </Link>
        <p className="text-[18px] text-front-charcoal-grey font-sans">
          {article?.sub_title}
        </p>
      </div>
    </div>
  );
};

const BaliEssentialSection3: React.FC<ComponentTemplateHomeProps> = ({
  preContent,
  default_category = "featured",
  admin = false,
}) => {
  const { actualRoute, clientChange } = useRoute();
  const { taxonomies } = useTaxonomies();
  // const {availableCategories} = useOutletContext<AvailableCategoriesProps>()
  // const {locations} = useOutletContext<LocationsContextProps>()
  const [content, setContent] = useState<PreContentProps>(preContent);
  const { generateContent } = useArticle();

  const CATEGORY_SLUG = default_category;

  const theCategory = () => {
    return taxonomies?.categories?.find(
      (cat) => cat.slug_title == CATEGORY_SLUG,
    );
  };

  useEffect(() => {
    (async () => {
      try {
        const get = await generateContent({
          content: preContent,
          query: {
            id_country: actualRoute?.country?.id,
            id_city: actualRoute?.city?.id,
            id_region: actualRoute?.region?.id,
            category: theCategory()?.id,
            limit: 2,
          },
        });
        if (get) {
          setContent(get);
        }
      } catch (e) {
        console.error("ERROR => ", e);
      }
    })();
  }, [actualRoute, clientChange]);

  const renderSVG = () => {
    return (
      <span className="text-front-navy group-hover:text-red-500 transition-colors duration-300">
        <ButtonChevronBorderArang />
      </span>
    );
  };

  return (
    <>
      {content && !!content.filter(Boolean).length && (
        <section id="essential-brief">
          <div className="w-[100%] pt-12 bg-front-icewhite">
            <div className="container mx-auto">
              <div>
                <div className="flex justify-between items-end mb-2.5">
                  <h2 className="text-2xl font-serif text-front-navy capitalize">
                    {`Essential ${CATEGORY_SLUG}`}
                  </h2>
                  <p className="font-sans text-front-charcoal-grey">
                    <span className="inline-flex items-center gap-2 group cursor-pointer">
                      {/* group-hover:-translate-x-1 */}
                      <span className="transition-transform duration-300 translate-x-6 group-hover:-translate-x-1">
                        <TextLink
                          text="Explore More"
                          link={
                            admin
                              ? undefined
                              : `${actualRoute?.country ? `/${actualRoute.country.slug}` : ""}${actualRoute?.city ? `/${actualRoute.city.slug}` : ""}${actualRoute?.region ? `/${actualRoute.region.slug}` : ""}/${CATEGORY_SLUG}`
                          }
                          color="black"
                        />
                      </span>
                      <span className="opacity-0 translate-x-4 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:translate-x-0">
                        {renderSVG()}
                      </span>
                    </span>
                  </p>
                </div>
                <div className="line bg-front-dustly-slate h-[0.5px] w-full"></div>
              </div>
            </div>
            <div className="container py-8">
              {/* <div className="grid grid-cols-6 md:gap-x-8 gap-y-10 mb-6 md:mb-4 overflow-x-hidden bg-blue-400"> */}
              <div className="flex flex-row gap-x-8">
                {content.map((item, index) =>
                  item ? (
                    <ArticleItems key={index} article={item} admin={admin} />
                  ) : null,
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default BaliEssentialSection3;
