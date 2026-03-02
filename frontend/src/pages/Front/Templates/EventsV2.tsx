import React, { useEffect, useRef, useState } from "react";
import { ArticleProps } from "../../../types/article.type";
import { getArticleByFields } from "../../../services/article.service";
import { useRoute } from "../../../context/RouteContext";
// import Advertisement from "../../../components/front/Advertisement";
import { useTaxonomies } from "../../../context/TaxonomyContext";
import { getCategoryWithFields } from "../../../services/category.service";
import Image from "../../../components/front/Image";
import { formatPublished } from "../../../lib/utils/format";
import TextLink from "../../../components/front/TextLink";
import Button from "../../../components/front/Button";
import Newsletter from "../../../components/front/Newsletter";
import {
  Checkbox,
  CheckboxGroup,
  DateRangePicker,
  RangeSlider,
  Whisper,
  Tooltip,
  Radio,
  Popover,
} from "rsuite";
import "rsuite/RangeSlider/styles/index.css";
import "rsuite/DateRangePicker/styles/index.css";
import "rsuite/Checkbox/styles/index.css";
import "rsuite/CheckboxGroup/styles/index.css";
import "rsuite/Tooltip/styles/index.css";
import "rsuite/Radio/styles/index.css";
import "rsuite/Popover/styles/index.css";
import { Link, useLocation, useSearchParams } from "react-router";
import { Category } from "../../../types/category.type";
import pkg from "../../../lib/utils/Helmet";
const { Helmet } = pkg;
const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL;
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || API_URL;

const generateImageUrl = (image: string | undefined, id: number) => {
  if (image) {
    return `${IMAGE_URL}/${image}`;
  }
  return `https://picsum.photos/id/${id * 10}/1920/1080`;
};

const ArticleCardV2: React.FC<{
  article: ArticleProps & { createdAt?: string };
}> = ({ article }) => {
  const { getCountryById, getCategoryById } = useTaxonomies();
  const generateUrl = (article: ArticleProps) => {
    return `/${getCountryById(article.id_country)?.slug}/${getCategoryById(article.category_id)?.slug_title}/${article.slug}`;
  };
  const imageRef = useRef<any>(null);

  return (
    <div
      className="group mb-12"
      onMouseEnter={() => imageRef.current?.zoomIn()}
      onMouseLeave={() => imageRef.current?.zoomOut()}
    >
      <div className="image-wrapper mb-5">
        <Image
          link={generateUrl(article)}
          url={generateImageUrl(article.featured_image_url, article.id)}
          ref={imageRef}
          ratio="60%"
        />
      </div>
      <div className="date-wrapper mb-2 flex gap-x-3 items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="14"
          viewBox="0 0 15 14"
          fill="none"
        >
          <path
            d="M1.125 4.14229C1.125 3.17103 1.91236 2.38367 2.88362 2.38367H12.1164C13.0877 2.38367 13.875 3.17103 13.875 4.14229V11.6164C13.875 12.5877 13.0877 13.375 12.1164 13.375H2.88362C1.91236 13.375 1.125 12.5877 1.125 11.6164V4.14229Z"
            stroke="#7F7F7F"
            strokeWidth="0.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.98267 0.624878V3.70246"
            stroke="#7F7F7F"
            strokeWidth="0.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11.0173 0.624878V3.70246"
            stroke="#7F7F7F"
            strokeWidth="0.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3.76294 5.90027H11.2371"
            stroke="#7F7F7F"
            strokeWidth="0.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-front-small text-[#a9a9a9] font-medium">
          {formatPublished(article?.meta_data?.start_date) ?? "TBA"}
        </p>
      </div>
      <div className="title-wrapper mb-3">
        <Link to={generateUrl(article)}>
          <p className="text-front-subtitle font-serif transition-all duration-300 group-hover:[text-shadow:0_0_0.3px_currentColor]">
            {article.title}
          </p>
        </Link>
      </div>
      <div className="subtitle-wrapper mb-4">
        <p className="text-front-small text-front-grey line-clamp-2 leading-relaxed">
          {article.sub_title}
        </p>
      </div>
      <div className="button-wrapper">
        <TextLink link={generateUrl(article)} color="red" text="READ MORE" />
      </div>
    </div>
  );
};

type TimeProps = "morning" | "afternoon" | "night";

const EventsV2: React.FC = () => {
  const [content, setContent] = useState<ArticleProps[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [filterDays, setFilterDays] = useState<any>([]);
  const [time, setTime] = useState<TimeProps | undefined>(undefined);
  const [filterDate, setFilterDate] = useState<Array<string> | undefined>(
    undefined,
  );
  const { actualRoute, getLocationRouteUrl } = useRoute();
  const { taxonomies } = useTaxonomies();
  const [searchParams, setSearchParams] = useSearchParams();
  const [availableSubCat, setAvailableSubCat] = useState<Category[]>();
  const CATEGORY_SLUG = "events";
  const parentCat = taxonomies.categories?.find(
    (cat) => CATEGORY_SLUG == cat.slug_title,
  );
  const theCategory = actualRoute.category;
  const DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const contentWrapperRef = useRef<HTMLDivElement>(null);
  const { search } = useLocation();

  useEffect(() => {
    const sub = taxonomies.categories?.filter(
      (cat) => cat.id_parent == parentCat?.id,
    );
    setAvailableSubCat(sub);
  }, [actualRoute, taxonomies.categories]);

  useEffect(() => {
    const minPriceParams = searchParams.get("minprice");
    if (minPriceParams) setMinPrice(Number(minPriceParams));
    const maxPriceParams = searchParams.get("maxprice");
    if (maxPriceParams) setMaxPrice(Number(maxPriceParams));

    const timeParams = searchParams.get("time");
    setTime(timeParams ? (timeParams as TimeProps) : undefined);

    const dayParams = searchParams.getAll("day[]");
    setFilterDays(dayParams || []);

    const dateParams = searchParams.get("dates");
    if (dateParams) setFilterDate(dateParams.split(","));
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams();
      const minPriceParams = searchParams.get("minprice");
      const maxPriceParams = searchParams.get("maxprice");
      const timeParams = searchParams.get("time");
      const dateParams = searchParams.get("dates");
      const dayParams = searchParams.getAll("day[]");
      const subParams = searchParams.get("subcat");

      if (minPriceParams) params.append("metaData_price[]", minPriceParams);
      if (maxPriceParams) params.append("metaData_price[]", maxPriceParams);
      if (dateParams) params.append("metaData_date", dateParams);

      if (subParams) {
        params.append("category", `${subParams}`);
      } else if (theCategory) {
        params.append("category", `${theCategory.id}`);
      }

      if (timeParams) {
        switch (timeParams) {
          case "morning":
            params.append("metaData_start_time", "06:00");
            params.append("metaData_end_time", "12:00");
            break;
          case "afternoon":
            params.append("metaData_start_time", "12:00");
            params.append("metaData_end_time", "18:00");
            break;
          case "night":
            params.append("metaData_start_time", "18:00");
            params.append("metaData_end_time", "24:00");
            break;
        }
      }
      if (dayParams) {
        dayParams.forEach((day) => {
          params.append("metaData_multi_day[]", day);
        });
      }

      const getArticle = await getArticleByFields(
        {
          id_country: actualRoute.country?.id,
          id_city: actualRoute.city?.id,
          id_region: actualRoute.region?.id,
          limit: 10,
          page: currentPage,
        },
        params,
      );

      if (getArticle?.articles) {
        if (getArticle?.pagination?.page == 1) {
          setContent(getArticle.articles);
        } else {
          setContent((prev) => {
            const newUniqueArticles = getArticle.articles.filter(
              (newArticle) =>
                !prev.some((prevArticle) => prevArticle.id === newArticle.id),
            );
            return [...prev, ...newUniqueArticles];
          });
        }
      } else {
        setContent([]);
      }
      if (getArticle?.pagination) {
        setTotalPage(getArticle.pagination.totalPages);
      }

      if (theCategory) {
        const getCategory = await getCategoryWithFields(theCategory?.id, {
          id_country: actualRoute.country?.id,
          id_city: actualRoute.city?.id,
          id_region: actualRoute.region?.id,
        });
        if (getCategory) {
          setTitle(getCategory.sub_title);
          setDescription(getCategory.description);
        }
      }
    })();
  }, [currentPage, actualRoute, searchParams, theCategory]);

  const pageClickHandler = () => setCurrentPage(currentPage + 1);

  const applyFilterDate = () => {
    setSearchParams((prev) => {
      const url = new URLSearchParams(prev);
      if (filterDate) url.set("dates", filterDate[0] + "," + filterDate[1]);
      else url.delete("dates");

      url.delete("day[]");
      filterDays.forEach((day: string) => url.append("day[]", day));
      return url;
    });
  };

  const applyTimeFilter = (val?: TimeProps) => {
    setSearchParams((prev) => {
      const url = new URLSearchParams(prev);
      if (val) url.set("time", val);
      else url.delete("time");
      return url;
    });
  };

  const applyPriceFilter = () => {
    setSearchParams((prev) => {
      const url = new URLSearchParams(prev);
      url.set("minprice", `${minPrice}`);
      url.set("maxprice", `${maxPrice}`);
      return url;
    });
  };

  const clearAllFilter = () => {
    setTime(undefined);
    setFilterDate(undefined);
    setFilterDays([]);
    setMaxPrice(5000);
    setMinPrice(0);
    setSearchParams({});
  };

  const formatPrice = () =>
    minPrice === maxPrice
      ? minPrice === 0
        ? "Free"
        : `$${minPrice}`
      : `${minPrice === 0 ? "Free" : `$${minPrice}`} - $${maxPrice}`;

  return (
    <>
      <Helmet>
        <title>{title || "Events"} - essentialbali</title>
        <meta
          name="description"
          content="essentialbali is the ultimate Bali area guide for travelers, expats, and locals."
        />
      </Helmet>
      <section className="events-page bg-front-icewhite min-h-screen">
        <div className="container py-16">
          <div
            className="cattitle-wrapper text-center mb-12"
            ref={contentWrapperRef}
          >
            <h1 className="font-serif text-front-hero mb-4">{title}</h1>
            <p className="text-front-body max-w-2xl mx-auto">{description}</p>
          </div>

          {/* Horizontal Filters */}
          <div className="filter-horizontal-wrapper mb-16 border-y border-gray-200 py-6 flex flex-wrap items-center gap-6 justify-center bg-white rounded-lg shadow-sm px-4">
            
            {/* Category Filter */}
            <Whisper trigger="click" placement="bottomStart" speaker={
                <Popover>
                    <div className="p-4 min-w-[200px]">
                        {!!parentCat && (
                            <div className={`mb-3 pb-2 border-b border-gray-100 font-medium ${actualRoute.category?.id === parentCat.id ? 'text-front-red' : ''}`}>
                                <Link to={getLocationRouteUrl() + '/' + parentCat.slug_title + search}>All {parentCat.title}</Link>
                            </div>
                        )}
                        {availableSubCat?.map(cat => (
                            <div key={cat.id} className={`mb-2 hover:text-front-red transition-colors ${actualRoute.category?.id === cat.id ? 'text-front-red font-semibold' : 'text-gray-600'}`}>
                                <Link to={getLocationRouteUrl() + '/' + cat.slug_title + search}>{cat.title}</Link>
                            </div>
                        ))}
                    </div>
                </Popover>
            }>
                <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-front-red transition-colors uppercase">
                    Event Category <span className="text-[10px]">▼</span>
                </button>
            </Whisper>

            {/* Date & Day Filter */}
            <Whisper
              trigger="click"
              placement="bottomStart"
              speaker={
                <Popover>
                  <div className="p-4 w-[300px] min-h-[450px]">
                    <p className="text-xs font-bold text-gray-400 mb-3 tracking-widest uppercase">
                      Date Range
                    </p>
                    <DateRangePicker
                      format="yyyy/MM/dd"
                      value={
                        filterDate
                          ? [new Date(filterDate[0]), new Date(filterDate[1])]
                          : null
                      }
                      onChange={(e) =>
                        setFilterDate(
                          e?.map((date) => date.toISOString().split("T")[0]),
                        )
                      }
                      block
                      open
                      showOneCalendar
                    />

                    <p className="text-xs font-bold text-gray-400 my-3 tracking-widest uppercase">
                      Days of Week
                    </p>
                    <CheckboxGroup
                      value={filterDays}
                      onChange={(val) => setFilterDays([...val])}
                      className="grid grid-cols-2"
                    >
                      {DAYS.map((day) => (
                        <Checkbox key={day} value={day} className="capitalize">
                          {day}
                        </Checkbox>
                      ))}
                    </CheckboxGroup>
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <Button
                        text="APPLY"
                        onClick={applyFilterDate}
                        className="w-full text-xs"
                      />
                    </div>
                  </div>
                </Popover>
              }
            >
              <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-front-red transition-colors uppercase">
                When <span className="text-[10px]">▼</span>
              </button>
            </Whisper>

            {/* Time Filter */}
            <Whisper
              trigger="click"
              placement="bottomStart"
              speaker={
                <Popover>
                  <div className="p-4 min-w-[180px]">
                    <div className="flex flex-col gap-2">
                      <Radio
                        onClick={() => applyTimeFilter("morning")}
                        checked={time === "morning"}
                        value="morning"
                      >
                        Morning (06-12)
                      </Radio>
                      <Radio
                        onClick={() => applyTimeFilter("afternoon")}
                        checked={time === "afternoon"}
                        value="afternoon"
                      >
                        Afternoon (12-18)
                      </Radio>
                      <Radio
                        onClick={() => applyTimeFilter("night")}
                        checked={time === "night"}
                        value="night"
                      >
                        Night (18-24)
                      </Radio>
                    </div>
                    <button
                      onClick={() => applyTimeFilter()}
                      className="text-xs text-front-red mt-3 font-bold hover:underline"
                    >
                      CLEAR TIME
                    </button>
                  </div>
                </Popover>
              }
            >
              <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-front-red transition-colors uppercase">
                Time of Day <span className="text-[10px]">▼</span>
              </button>
            </Whisper>

            {/* Price Filter */}
            <Whisper
              trigger="click"
              placement="bottomStart"
              speaker={
                <Popover>
                  <div className="p-6 w-[280px]">
                    <p className="text-center font-bold text-front-navy mb-6">
                      {formatPrice()}
                    </p>
                    <RangeSlider
                      min={0}
                      max={5000}
                      value={[minPrice, maxPrice]}
                      onChange={(e) => {
                        setMinPrice(e[0]);
                        setMaxPrice(e[1]);
                      }}
                    />
                    <div className="mt-8 pt-3 border-t border-gray-100">
                      <Button
                        text="APPLY PRICE"
                        onClick={applyPriceFilter}
                        className="w-full text-xs"
                      />
                    </div>
                  </div>
                </Popover>
              }
            >
              <button className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-front-red transition-colors uppercase">
                Price <span className="text-[10px]">▼</span>
              </button>
            </Whisper>

            <button
              onClick={clearAllFilter}
              className="text-xs font-bold text-gray-400 hover:text-front-red transition-colors tracking-tighter uppercase border-l border-gray-200 pl-6 h-6 flex items-center"
            >
              Clear All
            </button>
          </div>

          {/* Articles Grid - 2 Columns */}
          <div className="grid grid-cols-12 lg:gap-x-12">
            <div className="col-span-12 lg:col-span-10 lg:col-start-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                {content.map((article) => (
                  <ArticleCardV2 key={article.id} article={article} />
                ))}
              </div>
              {!content.length && (
                <div className="text-center py-20 text-gray-400 italic">
                  No events found matching your criteria.
                </div>
              )}
            </div>
          </div>

          <div className="button-wrapper flex flex-col md:flex-row justify-center items-center gap-6 mt-12">
            {totalPage > currentPage && (
              <Button text="LOAD MORE EVENTS" onClick={pageClickHandler} />
            )}
            <Button text="SUBMIT YOUR EVENT" borderOnly />
          </div>
        </div>

        <div className="newsletter-wrapper bg-front-icewhite py-16 border-t border-gray-100">
          <Newsletter />
        </div>
      </section>
    </>
  );
};

export default EventsV2;
