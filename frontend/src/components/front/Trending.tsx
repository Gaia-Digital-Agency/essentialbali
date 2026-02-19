import React, { useEffect, useState } from "react";
import { useRoute } from "../../context/RouteContext";
import Button from "./Button";
import useArticle from "../../hooks/useArticle";
import {
  ComponentTemplateHomeProps,
  PreContentProps,
} from "../../types/template.type";
import { Spacer } from "../../pages/Front/Templates/Home";
import { ArticleApiResponseProps } from "../../types/article.type";
import { useTaxonomies } from "../../context/TaxonomyContext";
import Image from "./Image";
import { Link } from "react-router";
import Skeleton from "react-loading-skeleton";
import TextLink from "./TextLink";

type TrendingsProps = {
  content: Array<ArticleApiResponseProps | undefined | 0>;
  admin?: boolean;
};

type TrendingMainProps = {
  content: ArticleApiResponseProps | undefined | 0;
  admin?: boolean;
};

export const Trendings: React.FC<TrendingsProps> = ({
  content,
  admin = false,
}) => {
  const { getCityById, getCountryById } = useTaxonomies();
  const { getFeaturedImageUrl, getPermalink } = useArticle();

  const renderArticle = (
    article: ArticleApiResponseProps | undefined | 0,
    i: number,
  ) => {
    if (article) {
      return (
        <div
          className={`md:col-span-6 lg:col-span-3 col-span-12 relative${i + 1 < content.length ? " line-right-5" : ""}`}
          key={`trendings-${i}`}
        >
          <div className="inner grid grid-cols-12 gap-x-6 md:gap-x-0">
            <div className="col-span-6 md:col-span-12">
              <div className="image-wrapper md:mb-10">
                <Image
                  url={getFeaturedImageUrl(article)}
                  ratio="100%"
                  link={admin ? undefined : getPermalink(article)}
                  alt={article?.featured_image_alt}
                />
              </div>
            </div>
            <div className="col-span-6 md:col-span-12">
              <div className="location-wrapper mb-2">
                <p className="text-front-body text-front-red">
                  {getCityById(article?.id_city)
                    ? getCityById(article.id_city)?.name
                    : getCountryById(article.id_country)?.name}
                </p>
              </div>
              <div className="text-wrapper">
                <Link to={admin ? "" : getPermalink(article)}>
                  <p className="text-front-title font-serif">{article.title}</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return <></>;
    }
  };
  if (content) {
    return (
      <>
        <div className="container">
          <div className="grid grid-cols-12 md:gap-x-10 gap-y-10 md:overflow-x-hidden md:overflow-y-visible pb-2 py-8 md:py-0">
            {content.map((article, i) => {
              return renderArticle(article, i);
            })}
          </div>
        </div>
      </>
    );
  } else {
    return (
      <div className="container">
        asd
        {[{}, {}, {}, {}].map(() => (
          <Skeleton count={2} />
        ))}
      </div>
    );
  }
};

export const TrendingMain: React.FC<TrendingMainProps> = ({
  content,
  admin = false,
}) => {
  const { getCategoryById } = useTaxonomies();
  const { getPermalink, getFeaturedImageUrl } = useArticle();
  const getCategory = (id: number) => {
    return getCategoryById(id);
  };
  if (content) {
    return (
      <>
        <div className="md:container mx-auto !px-0 md:!px-7">
          <div className="title-wrapper text-center mb-8">
            <h3 className="text-front-section-title font-serif font-semibold">
              Trending in <span className="text-front-red">Bali</span>
            </h3>
          </div>
          <div className="trending-main-wrapper md:mb-6">
            <div className="grid grid-cols-12 items-center">
              <div className="md:col-span-6 col-span-12">
                <div className="image-wrapper">
                  <Image
                    url={getFeaturedImageUrl(content)}
                    ratio="100%"
                    link={admin ? undefined : getPermalink(content)}
                    alt={content?.featured_image_alt}
                  />
                </div>
              </div>

              <div className="md:col-span-6 col-span-12 h-full">
                <div className="text-wrapper px-10 py-8 text-center h-full flex flex-col justify-center bg-front-light-grey">
                  <div className="category-wrapper mb-6">
                    <Link
                      to={
                        admin
                          ? ""
                          : `${getCategory(content.category_id)?.slug_title}`
                      }
                    >
                      <p className="text-front-body text-front-red uppercase before-red-line inline">
                        {getCategory(content.category_id)?.title}
                      </p>
                    </Link>
                  </div>
                  <div className="article-title-wrapper mb-3">
                    <Link to={admin ? "" : getPermalink(content)}>
                      <p className="text-front-black text-front-main-title font-serif">
                        {content.title}
                      </p>
                    </Link>
                  </div>
                  <div className="article-description-wrapper mb-3">
                    <Link to={admin ? "" : getPermalink(content)}>
                      <p className="text-front-black text-front-body-big">
                        {content.sub_title}
                      </p>
                    </Link>
                  </div>
                  <div className="text-link-wrapper">
                    <TextLink
                      text="Read More"
                      uppercase
                      link={admin ? "" : getPermalink(content)}
                    ></TextLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return <></>;
  }
};

const Trending: React.FC<ComponentTemplateHomeProps> = ({
  preContent = [0, 0, 0, 0, 0],
  admin = false,
}) => {
  const { actualRoute, clientChange } = useRoute();

  const [content, setContent] = useState<PreContentProps>(preContent);

  const { generateContent } = useArticle();
  // const TrendingMainComp = TrendingMain({title: 'asd', content: content[0]})
  // const TrendingsComp = Trendings({content: content.slice(1)})
  useEffect(() => {
    (async () => {
      const theContent = await generateContent({
        content: preContent,
        query: {
          id_country: actualRoute?.country?.id,
          id_city: actualRoute?.city?.id,
          id_region: actualRoute?.region?.id,
          limit: 5,
          isTrending: true,
          exclude_category: ["most-popular", "ultimate-guide", "events"],
        },
      });
      if (theContent) {
        setContent(theContent);
      } else {
        setContent([]);
      }
    })();
  }, [actualRoute, preContent, clientChange]);

  return (
    <>
      {!!content.filter(Boolean).length && (
        <section id="trending">
          <Spacer />
          {/* <div className="inner container mx-auto"> */}
          <TrendingMain content={content[0]} />
          <Trendings content={content.slice(1)} />
          <div className="button-wrapper text-center py-6">
            <Button
              text="View All"
              uppercase
              link={
                admin
                  ? undefined
                  : `${actualRoute?.country ? `/${actualRoute.country.slug}` : ""}${actualRoute?.city ? `/${actualRoute.city.slug}` : ""}${actualRoute?.region ? `/${actualRoute.region.slug}` : ""}/trending`
              }
            />
          </div>
          {/* </div> */}
        </section>
      )}
    </>
  );
};

const AdminTrending: React.FC<ComponentTemplateHomeProps> = ({
  preContent = [0, 0, 0, 0, 0],
}) => {
  const [content, setContent] = useState<PreContentProps>([]);
  const { generateContent } = useArticle();
  useEffect(() => {
    (async () => {
      const theContent = await generateContent({
        content: preContent,
        admin: true,
      });
      setContent(theContent);
    })();
  }, [preContent]);
  if (content.length) {
    return <Trending preContent={content} admin={true} />;
  }
};

export { Trending, AdminTrending };
