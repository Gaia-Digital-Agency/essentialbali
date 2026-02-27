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
      className="md:col-span-6 lg:col-span-3 col-span-12 relative group "
      key={`bali-essential-${article.id}`}
      onMouseEnter={() => imageRef.current?.zoomIn()}
      onMouseLeave={() => imageRef.current?.zoomOut()}
    >
      <div className="inner grid grid-cols-12 gap-x-6 md:gap-x-0">
        <div className="col-span-6 md:col-span-12">
          <div className="image-wrapper md:mb-2.5">
            <Image
              url={getFeaturedImageUrl(article)}
              ratio="100%"
              link={admin ? undefined : getPermalink(article)}
              alt={article?.featured_image_alt}
              ref={imageRef}
            />
          </div>
        </div>
        <div className="flex flex-col gap-y-1 col-span-6 md:col-span-12">
          <div className="text-[16px] text-front-shadowed-slate font-sans">
            <p>{article?.category_name}</p>
          </div>
          <div className="title-wrapper mb-4">
            <Link to={admin ? "" : getPermalink(article)}>
              <p
                className="text-front-title text-front-grey font-serif
                          transition-[font-weight]
                          transition-all duration-300
                          group-hover:[text-shadow:0_0_0.3px_currentColor]"
                // className="
                //   text-front-title text-front-grey font-serif
                //   transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                //   group-hover:text-front-navy
                //   group-hover:scale-[1.02]
                // "
              >
                {article?.title}
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const BaliEssentialSection2: React.FC<ComponentTemplateHomeProps> = ({
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
            limit: 6,
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

  // console.log("content bali section 2", content);

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
              <div className="grid grid-cols-12 md:gap-x-8 gap-y-10 mb-6 md:mb-4 overflow-x-hidden">
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

export default BaliEssentialSection2;
