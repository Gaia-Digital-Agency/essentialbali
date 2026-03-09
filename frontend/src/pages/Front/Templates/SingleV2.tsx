import React, { useEffect, useRef, useState } from "react";
import { getArticleByFields } from "../../../services/article.service";
import {
  ArticleApiResponseProps,
  ArticleProps,
} from "../../../types/article.type";
// import Advertisement from "../../../components/front/Advertisement";
import Newsletter from "../../../components/front/Newsletter";
import Image from "../../../components/front/Image";
import { Link } from "react-router";
import Button from "../../../components/front/Button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { formatPublished } from "../../../lib/utils/format";
import {
  FacebookShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
} from "react-share";
import {
  CopyIconV2,
  FacebookIconGreyDefault,
  LinkedinIconGreyDefault,
  WhatsappIconGreyDefault,
  ButtonChevronBorderArang,
} from "../../../icons";
import TextLink from "../../../components/front/TextLink";
import { useRoute } from "../../../context/RouteContext";
import { useNotification } from "../../../context/NotificationContext";
import { useContent } from "../../../context/ContentContext";
import pkg from "../../../lib/utils/Helmet";
const { Helmet } = pkg;
import useArticle from "../../../hooks/useArticle";

const SITE_URL = import.meta.env.VITE_SITE_URL || "";
const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL || "";
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || API_URL;
import { useAuth } from "../../../context/AuthContext";
import "swiper/swiper-bundle.css";

const RelatedItem: React.FC<{ article: ArticleApiResponseProps }> = ({
  article,
}) => {
  const { getPermalink, getFeaturedImageUrl } = useArticle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imageRef = useRef<any>(null);

  return (
    <div
      className="relative group"
      onMouseEnter={() => imageRef.current?.zoomIn()}
      onMouseLeave={() => imageRef.current?.zoomOut()}
    >
      <div className="grid grid-cols-12 gap-y-4 inner md:gap-x-0">
        <div className="col-span-12 md:col-span-12">
          <div className="image-wrapper md:mb-2.5">
            <Image
              url={getFeaturedImageUrl(article)}
              ratio="100%"
              link={getPermalink(article)}
              alt={article?.featured_image_alt}
              ref={imageRef}
            />
          </div>
        </div>
        <div className="flex flex-col col-span-12 gap-y-1 justify-center text-center md:text-left md:col-span-12">
          <div className="font-sans text-front-small text-front-shadowed-slate">
            <p>{article?.category_name}</p>
          </div>
          <div className="mb-4 title-wrapper">
            <Link to={getPermalink(article)}>
              <p
                className="text-front-title text-front-grey font-serif
                          transition-[font-weight]
                          transition-all duration-300
                          group-hover:[text-shadow:0_0_0.3px_currentColor]"
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

const RelatedArticle: React.FC<{
  articles: ArticleApiResponseProps[];
  theArticle: ArticleProps | null;
}> = ({ articles, theArticle }) => {
  if (!theArticle) return;
  const filtered = articles.filter((article) => article.id != theArticle.id);
  if (filtered.length == 10) {
    filtered.pop();
  }
  return (
    <>
      <div id="related-articles" className="relative">
        <div className="swiper-pagination"></div>
        <Swiper
          slidesPerView={1}
          spaceBetween={10}
          modules={[Pagination]}
          pagination={{
            el: "#related-articles .swiper-pagination",
            enabled: true,
            clickable: true,
          }}
          breakpoints={{
            768: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 40,
            },
          }}
        >
          {filtered.map((article) => {
            return (
              <SwiperSlide key={article.id}>
                <RelatedItem article={article} />
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </>
  );
};

const EditButton: React.FC<{
  article: ArticleApiResponseProps | undefined;
}> = ({ article }) => {
  // if(!article) return <></>
  return (
    <div>
      <Button
        text="Edit article"
        link={`/admin/mst_article/edit/${article?.id}`}
        type="secondary"
      ></Button>
    </div>
  );
};

const SingleV2: React.FC = () => {
  const { initialData } = useContent();
  const { actualRoute, clientChange } = useRoute();
  const { getDeepestLocation, getFeaturedImageUrl } = useArticle();
  const [content, setContent] = useState<ArticleApiResponseProps | undefined>(
    initialData?.article ?? undefined,
  );
  const [related, setRelated] = useState<ArticleApiResponseProps[]>(
    initialData?.related ?? [],
  );
  const [currentUrl, setCurrentUrl] = useState<string>();
  const { setNotification } = useNotification();
  const { userDetails } = useAuth();
  const [isClient, setIsClient] = useState<boolean>(false);
  const deepestLocation = getDeepestLocation(actualRoute.article, "country");

  useEffect(() => {
    setCurrentUrl(window.location.href);
    setIsClient(true);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);

    try {
      setContent(actualRoute.article);
    } catch (e) {
      console.log(e);
    }
  }, [actualRoute]);

  useEffect(() => {
    //     if(!content) return;
    if (!clientChange) return;
    (async () => {
      try {
        const getArticle = await getArticleByFields({
          category: actualRoute?.category?.id,
          limit: 11,
        });
        if (getArticle?.articles) {
          // const setArticle = getArticle.articles.map(article => ({...article, featured_image_full_url: getFeaturedImageUrl(article), url: getPermalink(article), category: getCategoryById(article.category_id)}))
          setRelated(getArticle.articles);
        }
      } catch (e) {
        console.log(e);
      }
    })();
  }, [content]);

  const renderEditButton = () => {
    if (!isClient) return;
    if (userDetails?.user_level == "super_admin") {
      return <EditButton article={content} />;
    }
    if (userDetails?.user_level == "admin_country") {
      if (content?.id_country == userDetails.id_country) {
        return <EditButton article={content} />;
      }
    }
    if (userDetails?.user_level == "admin_city") {
      if (content?.id_city == userDetails.id_city) {
        return <EditButton article={content} />;
      }
    }
    return <></>;
  };

  const shareClickHandler = async () => {
    if (!currentUrl) return;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(currentUrl);
        setNotification({ message: "Copied URL to clipboard", type: "neutral" });
      } catch (err) {
        console.error("Failed to copy using clipboard API: ", err);
        fallbackCopyTextToClipboard(currentUrl);
      }
    } else {
      fallbackCopyTextToClipboard(currentUrl);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Pastikan textarea tidak terlihat dan tidak mengganggu layout
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setNotification({ message: "Copied URL to clipboard", type: "neutral" });
      } else {
        setNotification({ message: "Failed to copy", type: "fail" });
      }
    } catch (err) {
      console.error('Fallback copy failed', err);
      setNotification({ message: "Failed to copy", type: "fail" });
    }

    document.body.removeChild(textArea);
  };

  return (
    <>
      <Helmet>
        <title>{actualRoute.article?.title ?? ""} - Essential Bali</title>
        <meta
          name="description"
          content={String(
            content?.meta_data?.meta_description ?? content?.sub_title ?? "",
          )}
        />
        <link
          rel="canonical"
          href={`${SITE_URL}/${actualRoute.country?.slug}/${actualRoute.category?.slug_title}/${actualRoute.article?.slug}`}
        />
        <meta property="og:type" content="article" />
        <meta
          property="og:title"
          content={`${actualRoute.article?.title ?? ""} - Essential Bali`}
        />
        <meta
          property="og:description"
          content={actualRoute.article?.sub_title}
        />
        <meta
          property="og:url"
          content={`${SITE_URL}/${actualRoute.country?.slug}/${actualRoute.category?.slug_title}/${actualRoute.article?.slug}`}
        />
        <meta
          property="og:image"
          content={`${IMAGE_URL}/${actualRoute.article?.featured_image_16_9_url || actualRoute.article?.featured_image_url || "images/placeholder.png"}`}
        />
        <meta property="og:site_name" content="essentialbali" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${actualRoute.article?.title ?? ""} - Essential Bali`}
        />
        <meta
          name="twitter:description"
          content={actualRoute.article?.sub_title}
        />
        <meta
          name="twitter:image"
          content={`${IMAGE_URL}/${actualRoute.article?.featured_image_16_9_url || actualRoute.article?.featured_image_url || "images/placeholder.png"}`}
        />
      </Helmet>
      <article>
        <div className="bg-front-icewhite">
          <div className="container mb-[40px]">
            <div className="py-8 md:hidden breadcrumb-wrapper">
              <p className="uppercase text-front-small text-front-shadowed-slate md:text-front-icewhite/80">
                <Link to={"/"} className="transition-colors hover:text-front-navy md:hover:text-front-icewhite">Home</Link> /{" "}
                <Link to={`/${deepestLocation?.slug}`} className="transition-colors hover:text-front-navy md:hover:text-front-icewhite">
                  {deepestLocation?.name}
                </Link>{" "}
                /{" "}
                <Link
                  to={`/${actualRoute?.country?.slug}/${actualRoute?.category?.slug_title}`}
                  className="transition-colors hover:text-front-navy md:hover:text-front-icewhite"
                >
                  {actualRoute?.category?.title}
                </Link>
              </p>
            </div>
            <div className="grid grid-cols-12 gap-y-10 md:gap-x-10">
              <div className="col-span-12 md:col-span-12">
                {/* MOBILE ONLY: Title and Subtitle before image */}
                <div className="mb-6 text-center md:hidden title-wrapper-mobile">
                  <h1 className="mb-4 font-serif text-3xl text-front-navy">
                    {content?.title}
                  </h1>
                  <h3 className="font-sans text-lg text-front-shadowed-slate">
                    {content?.sub_title}
                  </h3>
                </div>

                <div className="relative py-4 featured-image-wrapper">
                  {/* BREADCRUMB: Above image on mobile (relative), absolute on desktop image */}
                  <div className="hidden mb-4 md:block md:absolute md:top-10 md:left-10 md:z-20 md:mb-0 breadcrumb-wrapper">
                    <p className="uppercase text-front-small text-front-shadowed-slate md:text-front-icewhite/80">
                      <Link to={"/"} className="transition-colors hover:text-front-navy md:hover:text-front-icewhite">Home</Link> /{" "}
                      <Link to={`/${deepestLocation?.slug}`} className="transition-colors hover:text-front-navy md:hover:text-front-icewhite">
                        {deepestLocation?.name}
                      </Link>{" "}
                      /{" "}
                      <Link
                        to={`/${actualRoute?.country?.slug}/${actualRoute?.category?.slug_title}`}
                        className="transition-colors hover:text-front-navy md:hover:text-front-icewhite"
                      >
                        {actualRoute?.category?.title}
                      </Link>
                    </p>
                  </div>

                  <div className="relative group">
                    <Image
                      url={getFeaturedImageUrl(content, "16_9")}
                      ratio="40%"
                      mobileRatio="60%"
                      isLazy={false}
                      fetchPriority="high"
                      overlay={true}
                    />

                    {/* DESKTOP ONLY: Title Overlay */}
                    <div className="hidden text-center md:flex md:flex-col md:items-center md:justify-center md:absolute md:inset-0 md:z-10 md:px-10 title-wrapper-desktop">
                      <h1 className="mb-5 font-serif text-front-hero text-front-icewhite">
                        {content?.title}
                      </h1>
                      <h3 className="font-sans text-front-icewhite/80 text-front-subtitle">
                        {content?.sub_title}
                      </h3>
                    </div>

                    <div className="absolute top-4 right-4 z-10 md:top-10 md:right-10">
                      {renderEditButton()}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center px-5 py-5 mx-auto overflow-x-hidden break-words md:px-40 content-wrapper article-wrapper gap-y-[40px] md:gap-y-[50px]">
                  <div className="flex gap-x-5 justify-center text-center author-wrapper">
                    <p className="text-front-shadowed-slate text-front-small">
                      {content?.author_name}
                    </p>
                    <p className="text-front-shadowed-slate text-front-small">
                      {formatPublished(content?.updatedAt)}
                    </p>
                  </div>


                  {content?.tags_slugs && content.tags_slugs.length > 0 && (
                    <div className="flex gap-x-5 justify-center mx-auto text-center tag-wrapper">
                      {content?.tags_slugs.map((tag, index) => (
                        <p className="text-front-icewhite" key={index}>
                          <span className="bg-front-shadowed-slate px-4 py-2 rounded-[5px] capitalize">{tag}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  <div
                    className="text-center break-words content-wrapper text-front-charcoal-grey"
                    dangerouslySetInnerHTML={{
                      __html: content?.article_post ?? "",
                    }}
                  />

                  <div className="text-center sharing-wrapper">
                    <p className="mb-5 text-front-small text-front-shadowed-slate">Share</p>
                    <div className="flex gap-x-5 justify-center items-center text-center share-buttons-wrapper">
                      {currentUrl && (
                        <>
                          <FacebookShareButton url={currentUrl}>
                            <FacebookIconGreyDefault className="w-[28px] h-[28px] text-front-navy hover:text-front-dustly-slate transition-colors duration-200" />
                          </FacebookShareButton>
                          <LinkedinShareButton url={currentUrl}>
                            <LinkedinIconGreyDefault className="w-[28px] h-[28px] text-front-navy hover:text-front-dustly-slate transition-colors duration-200" />
                          </LinkedinShareButton>
                          <WhatsappShareButton url={currentUrl}>
                            <WhatsappIconGreyDefault className="w-[28px] h-[28px] text-front-navy hover:text-front-dustly-slate transition-colors duration-200" />
                          </WhatsappShareButton>
                          <CopyIconV2 className="w-[28px] h-[28px] text-front-navy hover:text-front-dustly-slate transition-colors duration-200 cursor-pointer" onClick={shareClickHandler} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="py-5 outer bg-front-icewhite">
            <div className="container">
              <div className="mb-6 text-center border-b title-wrapper border-front-shadowed-slate">
                <p className="font-serif text-front-main-title text-front-navy">
                  Related Essentials
                </p>
              </div>
              {related && (
                <RelatedArticle
                  articles={related}
                  theArticle={content ?? null}
                />
              )}
              <div className="pt-8 pb-8 text-center button-wrapper">
                <p className="font-sans text-front-charcoal-grey">
                  <span className="inline-flex gap-2 items-center cursor-pointer group">
                    <span className="transition-transform duration-300 translate-x-6 group-hover:-translate-x-1">
                      <TextLink
                        text="Explore More"
                        link={`/${actualRoute.country?.slug}/${actualRoute.category?.slug_title}`}
                        color="black"
                      />
                    </span>
                    <span className="opacity-0 transition-all duration-300 ease-out translate-x-4 group-hover:opacity-100 group-hover:translate-x-0">
                      <span className="transition-colors duration-300 text-front-navy group-hover:text-red-500">
                        <ButtonChevronBorderArang />
                      </span>
                    </span>
                  </span>
                </p>
              </div>
            </div>
            <div className="py-8">
              <Newsletter />
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

export default SingleV2;
