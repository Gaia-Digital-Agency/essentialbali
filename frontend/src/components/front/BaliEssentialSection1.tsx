import React, { useEffect, useState } from "react";
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
}) => {
  const { actualRoute, clientChange } = useRoute();
  const { taxonomies } = useTaxonomies();
  // const {availableCategories} = useOutletContext<AvailableCategoriesProps>()
  // const {locations} = useOutletContext<LocationsContextProps>()
  const [content, setContent] = useState<PreContentProps>(preContent);
  const { generateContent, getPermalink, getFeaturedImageUrl } = useArticle();
  const CATEGORY_SLUG = "featured";

  const theCategory = () => {
    return taxonomies?.categories?.find(
      (cat) => cat.slug_title == CATEGORY_SLUG,
    );
  };

  console.log("the category => ", theCategory());

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
        console.log("ERROR => ", e);
      }
    })();
  }, [actualRoute, clientChange]);

  return (
    <>
      {content && !!content.filter(Boolean).length && (
        <div className="w-[100%] pt-12 bg-front-icewhite">
          <div className="container mx-auto">
            <div>
              <div className="flex justify-between items-end mb-2.5">
                <h2 className="text-2xl font-serif text-front-navy">
                  Essential Brief
                </h2>
                <p className="font-sans text-front-charcoal-grey">
                  Explore More
                </p>
              </div>
              <div className="line bg-front-dustly-slate h-[0.5px] w-full"></div>
            </div>

            <div>
              <div className="flex flex-row gap-x-5">
                <BaliEssentialSection1Main content={content[0]} />
                <BaliEssentialSection1Secondary content={content.slice(1)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const BaliEssentialSection1Main: React.FC<BaliEssentialSectionMainProps> = ({
  content,
  admin = false,
}) => {
  const { getFeaturedImageUrl, getPermalink } = useArticle();
  if (content) {
    return (
      <>
        <div className="w-[50%] py-8">
          <div className="pb-5">
            <Image
              url={getFeaturedImageUrl(content)}
              ratio="60%"
              link={admin ? undefined : getPermalink(content)}
              alt={content?.featured_image_alt}
            />
            {/* <img
              src="https://images.unsplash.com/photo-1770215962687-93b6b860add7?q=80&w=1752&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt=""
              className="rounded-[10px]"
            /> */}
          </div>
          <div className="flex flex-col gap-y-2.5">
            <p className="text-[16px] text-front-shadowed-slate font-sans">
              News
            </p>
            <h3 className="text-[32px] font-serif text-front-navy capitalize">
              {content?.title}
            </h3>
            <p className="text-[18px] text-front-charcoal-grey font-sans">
              {content?.sub_title}
            </p>
          </div>
        </div>
      </>
    );
  }
};

const BaliEssentialSection1Secondary: React.FC<
  BaliEssentialSectionSecondaryProps
> = ({ content, admin = false }) => {
  const { getFeaturedImageUrl, getPermalink } = useArticle();

  if (!content || content.length === 0) return null;

  const renderArticle = (
    article: ArticleApiResponseProps | undefined | 0,
    i: number,
  ) => {
    if (article) {
      return (
        <>
          <div key={i} className="h-[50%]">
            <div className="pb-5">
              <Image
                url={getFeaturedImageUrl(article)}
                ratio="25%"
                link={admin ? undefined : getPermalink(article)}
                alt={article?.featured_image_alt}
              />
              {/* <img
                src="https://images.unsplash.com/photo-1770215962687-93b6b860add7?q=80&w=1752&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt=""
                className="rounded-[10px] h-[200px] w-[100%] object-cover"
              /> */}
            </div>
            <div className="flex flex-col gap-y-2.5">
              <p className="text-[16px] text-front-shadowed-slate font-sans">
                {article.category_name}
              </p>
              <h3 className="text-[32px] font-serif text-front-navy capitalize">
                {article.title}
              </h3>
            </div>
          </div>
        </>
      );
    }
  };

  console.log("dari secondary", content);
  if (content) {
    return (
      <div className=" w-[50%] flex flex-col py-8 space-y-8">
        {content.slice(0, 2).map((item, index) => renderArticle(item, index))}
      </div>
    );
  }
};

export default BaliEssentialSection1;
