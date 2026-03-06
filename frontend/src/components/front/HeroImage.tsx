import React, { useEffect, useState, useRef } from "react";
// import { ArticleApiResponseProps } from "../../types/article.type";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";
import { EffectFade } from "swiper/modules";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Skeleton from "react-loading-skeleton";
import Image from "./Image";
import Button from "./Button";
import "swiper/swiper-bundle.css";
// import { useTaxonomies } from "../../context/TaxonomyContext";
import { useRoute } from "../../context/RouteContext";
import useArticle from "../../hooks/useArticle";
import {
  ComponentTemplateHomeProps,
  PreContentProps,
} from "../../types/template.type";

const HeroDescription: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      <p className="mb-6 text-front-icewhite text-front-subtitle">
        {children || <Skeleton count={3}></Skeleton>}
      </p>
    </>
  );
};

const HeroTitleWrapper: React.FC<React.PropsWithChildren> = (props) => {
  return (
    <>
      <div className="absolute bottom-20 md:ml-[50px] px-10 left-0 right-0 z-10 overflow-x-hidden">
        <div className="container">{props.children}</div>
      </div>
    </>
  );
};

const HeroTitle: React.FC<React.PropsWithChildren<{ className?: string }>> = (
  props,
) => {
  return (
    <>
      <h1
        className={`text-front-hero font-serif text-front-icewhite ${props.className}`}
      >
        {props.children || <Skeleton count={2}></Skeleton>}
      </h1>
    </>
  );
};

const HeroImage: React.FC<ComponentTemplateHomeProps> = ({
  preContent = [],
  admin = false,
}) => {
  const { actualRoute, clientChange } = useRoute();
  const { generateContent, getPermalink, getFeaturedImageUrl } = useArticle();
  const activeAnim = useRef<gsap.core.Tween | null>(null);
  const imageRef = useRef<SwiperType>(null);
  const textRef = useRef<SwiperType>(null);
  const playControls = useRef<{ play: (index: number) => void }>({
    play: () => { },
  });

  const [content, setContent] = useState<PreContentProps>(preContent);

  useEffect(() => {
    (async () => {
      const get = await generateContent({
        content: preContent,
        query: {
          id_country: actualRoute?.country?.id,
          id_city: actualRoute?.city?.id,
          id_region: actualRoute?.region?.id,
          limit: 3,
        },
      });
      if (get) {
        setContent(get);
      } else {
        setContent([]);
      }
    })();
  }, [actualRoute, preContent, clientChange]);

  useGSAP(() => {
    if (!content.length) return;

    const loadingTab = gsap.utils.toArray<HTMLElement>(
      "#hero-article .tab-content",
    );

    const play = (index: number) => {
      if (activeAnim.current) {
        activeAnim.current.kill();
      }

      let currentIndex = index;

      if (currentIndex >= content.length) {
        currentIndex = 0;
      }

      imageRef.current?.slideToLoop(currentIndex);
      textRef.current?.slideToLoop(currentIndex);

      if (admin) return;

      loadingTab.forEach((bar) => {
        bar.classList.remove("active");
      });
      loadingTab[currentIndex]?.classList.add("active");

      // Use delayedCall for autoplay instead of animating a bar width
      activeAnim.current = gsap.delayedCall(6, () => {
        play(currentIndex + 1);
      });
    };

    playControls.current.play = play;

    if (!admin) {
      play(0);
    }

    return () => {
      activeAnim.current?.kill();
    };
  }, [content, admin]);


  if (content.length) {
    return (
      <>
        <section className="bg-front-icewhite pt-[20px]">
          <div
            id="hero-article"
            className="container relative overflow-hidden rounded-xl"
          >
            <Swiper
              onSwiper={(swiper) => (imageRef.current = swiper)}
              slidesPerView={1}
              loop={true}
              allowTouchMove={false}
              effect="fade"
              fadeEffect={{ crossFade: true }}
              modules={[EffectFade]}
            >
              {content.map((item, i) => {
                if (item) {
                  return (
                    <SwiperSlide key={`image-${i}`}>
                      <Image
                        width="1920"
                        height="1080"
                        fetchPriority={i ? "low" : "high"}
                        isLazy={i ? true : false}
                        url={getFeaturedImageUrl(item, "16_9")}
                        ratio="45%"
                        mobileRatio="150%"
                        overlay={true}
                        alt={item?.featured_image_alt}
                      />
                    </SwiperSlide>
                  );
                }
              })}
            </Swiper>

            <HeroTitleWrapper>
              <Swiper
                onSwiper={(swiper) => (textRef.current = swiper)}
                slidesPerView={1}
                loop={true}
                autoHeight={true}
                noSwiping={true}
                allowTouchMove={false}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                modules={[EffectFade]}
              >
                {content.map((item, i) => {
                  if (item) {
                    return (
                      <SwiperSlide key={`text-${i}`}>
                        <div className="md:max-w-3/4">
                          <HeroTitle className={"mb-[20px]"}>
                            {item.title}
                          </HeroTitle>
                          <HeroDescription>{item?.sub_title}</HeroDescription>
                          <div className="mt-[40px]">
                            <Button
                              type="secondary"
                              text="Explore More"
                              link={admin ? undefined : getPermalink(item)}
                            />
                          </div>
                        </div>
                      </SwiperSlide>
                    );
                  }
                })}
              </Swiper>
              {/* <div className="grid grid-cols-3 pt-12 gap-x-8 bg-amber-400">
                {content.map((item, i) => {
                  if (item) {
                    return (
                      <div onClick={() => { animClickHandler(i) }} data-index={i} className={`tab-content text-white col-span-3 md:col-span-1 cursor-pointer${i === 0 ? ' active' : ''}`} key={`tabs-${i}`}>
                        <div className="category-wrapper mb-4 text-xs font-bold uppercase tracking-widest opacity-80 group-[.active]:opacity-100 hidden">
                          {item ? getDeepestLocation(item)?.name : <Skeleton />}
                        </div>
                        <div className="hidden title-wrapper">
                          {item?.title ? item.title : <Skeleton />}
                        </div>
                      </div>
                    )
                  }
                })}
              </div> */}
            </HeroTitleWrapper>
          </div>
        </section>
      </>
    );
  } else {
    return (
      <div className="relative w-screen h-screen">
        <Skeleton className="absolute inset-0 w-full h-full" />
        <HeroTitleWrapper>
          <HeroTitle></HeroTitle>
          <HeroDescription></HeroDescription>
        </HeroTitleWrapper>
      </div>
    );
  }
};

export const AdminHeroImage: React.FC<ComponentTemplateHomeProps> = ({
  preContent = [0, 0, 0],
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState<PreContentProps>([]);
  useEffect(() => {
    (async () => {
      const content = await generateContent({
        content: preContent,
        admin: true,
      });
      if (content) {
        setContent(content);
      }
    })();
  }, [preContent]);
  const { generateContent } = useArticle();
  if (content.length) {
    return (
      <>
        <div ref={wrapperRef}>
          <HeroImage admin={true} preContent={content} />
        </div>
      </>
    );
  }
};

export default HeroImage;
