import React, { useEffect, useRef, useState } from "react";
import {
  ComponentTemplateHomeProps,
  PreContentProps,
} from "../../types/template.type";
import { useRoute } from "../../context/RouteContext";
import { useTaxonomies } from "../../context/TaxonomyContext";
import useArticle from "../../hooks/useArticle";
import { ArticleApiResponseProps } from "../../types/article.type";
import Image from "./Image";
import TextLink from "./TextLink";
import { Link } from "react-router";
import { ButtonChevronBorderArang } from "../../icons";

type BaliEssentialSectionMainProps = {
  content: ArticleApiResponseProps | undefined | 0;
  admin?: boolean;
};

type BaliEssentialSectionSecondaryProps = {
  content: Array<ArticleApiResponseProps | undefined | 0>;
  admin?: boolean;
};

const BaliEssentialSection1: React.FC<ComponentTemplateHomeProps> = ({
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

              <div>
                <div className="flex flex-row gap-x-8">
                  <BaliEssentialSection1Main content={content[0]} />
                  <BaliEssentialSection1Secondary content={content.slice(1)} />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

const BaliEssentialSection1Main: React.FC<BaliEssentialSectionMainProps> = ({
  content,
  admin = false,
}) => {
  const { getFeaturedImageUrl, getPermalink } = useArticle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageRef = useRef<any>(null);
  if (content) {
    return (
      <>
        <div
          className="w-[50%] py-8 group"
          onMouseEnter={() => imageRef.current?.zoomIn()}
          onMouseLeave={() => imageRef.current?.zoomOut()}
        >
          <div className="pb-5">
            <Image
              url={getFeaturedImageUrl(content)}
              ratio="60%"
              link={admin ? undefined : getPermalink(content)}
              alt={content?.featured_image_alt}
              ref={imageRef}
            />
          </div>
          <div className="flex flex-col gap-y-2.5">
            <p className="text-[16px] text-front-shadowed-slate font-sans">
              News
            </p>
            <Link to={admin ? "" : getPermalink(content)}>
              <h3 className="text-[32px] font-serif text-front-navy capitalize transition-all duration-300
                        group-hover:[text-shadow:0_0_0.3px_currentColor]">
                {content?.title}
              </h3>
              {/* <p className="text-front-title font-serif">{article.title}</p> */}
            </Link>
            <p className="text-[18px] text-front-charcoal-grey font-sans">
              {content?.sub_title}
            </p>
          </div>
        </div>
      </>
    );
  }
};

const SecondaryArticleItem: React.FC<{
  article: ArticleApiResponseProps;
  admin?: boolean;
}> = ({ article, admin }) => {
  const { getFeaturedImageUrl, getPermalink } = useArticle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageRef = useRef<any>(null);

  return (
    <div
      className="h-[50%] group"
      onMouseEnter={() => imageRef.current?.zoomIn()}
      onMouseLeave={() => imageRef.current?.zoomOut()}
    >
      <div className="pb-5">
        <Image
          url={getFeaturedImageUrl(article)}
          ratio="25%"
          link={admin ? undefined : getPermalink(article)}
          alt={article?.featured_image_alt}
          ref={imageRef}
        />
      </div>

      <div className="flex flex-col gap-y-2.5">
        <p className="text-[16px] text-front-shadowed-slate font-sans">
          {article.category_name}
        </p>

        <Link to={admin ? "" : getPermalink(article)}>
        {/* <p className="text-front-title text-front-grey font-serif"></p> */}
          <p className="text-front-title font-serif text-front-navy capitalize 
                        transition-all duration-300
                        group-hover:[text-shadow:0_0_0.3px_currentColor]">
            {article?.title}
          </p>
        </Link>
      </div>
    </div>
  );
};

const BaliEssentialSection1Secondary: React.FC<
  BaliEssentialSectionSecondaryProps
> = ({ content, admin = false }) => {
  if (!content || content.length === 0) return null;

  if (content) {
    return (
      <div className=" w-[50%] flex flex-col py-8 space-y-8">
        {/* {content.slice(0, 2).map((item, index) => renderArticle(item, index))} */}
        {content
          .slice(0, 2)
          .map((item, index) =>
            item ? (
              <SecondaryArticleItem key={index} article={item} admin={admin} />
            ) : null,
          )}
      </div>
    );
  }
};

export default BaliEssentialSection1;
