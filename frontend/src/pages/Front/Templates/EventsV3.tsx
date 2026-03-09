/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from "react";
import { ArticleApiResponseProps } from "../../../types/article.type"; //ArticleProps
import { getArticleByFields } from "../../../services/article.service";
import { useRoute } from "../../../context/RouteContext";
import { useTaxonomies } from "../../../context/TaxonomyContext";
import { getCategoryWithFields } from "../../../services/category.service";
import Image from "../../../components/front/Image";
import { formatPublished } from "../../../lib/utils/format";
import Button from "../../../components/front/Button";
import Newsletter from "../../../components/front/Newsletter";
import {
  DateRangePicker,
  Radio,
  RadioGroup,
  Tag,
  TagGroup,
} from "rsuite";
import "rsuite/DateRangePicker/styles/index.css";
import "rsuite/Checkbox/styles/index.css";
import "rsuite/CheckboxGroup/styles/index.css";
import "rsuite/Radio/styles/index.css";
import "rsuite/RadioGroup/styles/index.css";
import "rsuite/Tag/styles/index.css";
import "rsuite/TagGroup/styles/index.css";
import { Link, useSearchParams } from "react-router"; //useLocation
import { Category } from "../../../types/category.type";
import pkg from "../../../lib/utils/Helmet";
const { Helmet } = pkg;

const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL;
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || API_URL;

const generateImageUrl = (image: string | undefined, id: number) => {
  if (image) return `${IMAGE_URL}/${image}`;
  return `https://picsum.photos/id/${id * 10}/800/600`;
};

const ArticleCardV3: React.FC<{ article: ArticleApiResponseProps }> = ({ article }) => {
  const { getCountryById, getCategoryById } = useTaxonomies();
  const generateUrl = (art: ArticleApiResponseProps) => {
    return `/${getCountryById(art.id_country)?.slug}/${getCategoryById(art.category_id)?.slug_title}/${art.slug}`;
  };
  const imageRef = useRef<any>(null);

  return (
    <div 
      className="flex flex-col md:flex-row gap-6 mb-10 p-4 rounded-2xl group"
      onMouseEnter={() => imageRef.current?.zoomIn()}
      onMouseLeave={() => imageRef.current?.zoomOut()}
    >
      <div className="md:w-2/5 overflow-hidden rounded-xl">
        <Image
          link={generateUrl(article)}
          url={generateImageUrl(article.featured_image_url, article.id)}
          ref={imageRef}
          ratio="75%"
        />
      </div>
      <div className="md:w-3/5 flex flex-col justify-between py-2">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-front-navy/10 text-front-navy text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
              {article.category_name}
            </span>
            <span className="text-gray-300 text-xs">•</span>
            <span className="text-gray-400 text-xs font-medium uppercase tracking-tighter">
              {formatPublished(article?.meta_data?.start_date) ?? "TBA"}
            </span>
          </div>
          <Link to={generateUrl(article)}>
            <h3 className="text-2xl font-serif text-front-navy mb-3 leading-tight group-hover:text-front-navy transition-colors">
              {article.title}
            </h3>
          </Link>
          <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed mb-4">
            {article.sub_title}
          </p>
        </div>
      </div>
    </div>
  );
};

const EventsV3: React.FC = () => {
  const [content, setContent] = useState<ArticleApiResponseProps[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [filterDays, setFilterDays] = useState<string[]>([]);
  const [time, setTime] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  
  const { actualRoute } = useRoute();
  const { taxonomies } = useTaxonomies();
  const [searchParams, setSearchParams] = useSearchParams();
  const [, setAvailableSubCat] = useState<Category[]>();
  
  const CATEGORY_SLUG = "events";
  const parentCat = taxonomies.categories?.find(cat => cat.slug_title === CATEGORY_SLUG);
  const theCategory = actualRoute.category;
  // const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    const sub = taxonomies.categories?.filter(cat => cat.id_parent === parentCat?.id);
    setAvailableSubCat(sub);
  }, [actualRoute, taxonomies.categories, parentCat]);

  useEffect(() => {
    const t = searchParams.get('time');
    setTime(t || undefined);

    const d = searchParams.getAll('day[]');
    setFilterDays(d || []);

    const datesS = searchParams.get('dates');
    if (datesS) {
        const parts = datesS.split(',');
        if (parts.length === 2) {
            setDateRange([new Date(parts[0]), new Date(parts[1])]);
        }
    } else {
        setDateRange(null);
    }
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams();

      // Date Range Handling
      const datesS = searchParams.get('dates');
      if (datesS) {
        const [start, end] = datesS.split(',');
        if (start && end) {
          params.append('metaData_start_date', start);
          params.append('metaData_end_date', end);
        }
      }
      
      const subParams = searchParams.get('subcat');
      if (subParams) params.append('category', subParams);
      else if (theCategory) params.append('category', `${theCategory.id}`);

      // Time Handling (Matching Events.tsx logic)
      const tParam = searchParams.get('time');
      if (tParam) {
        if (tParam === 'morning') { params.append('metaData_start_time', '01:00'); params.append('metaData_end_time', '12:00'); }
        else if (tParam === 'afternoon') { params.append('metaData_start_time', '12:00'); params.append('metaData_end_time', '18:00'); }
        else if (tParam === 'night') { params.append('metaData_start_time', '18:00'); params.append('metaData_end_time', '24:00'); }
      }

      // Days Handling
      const dayParams = searchParams.getAll('day[]');
      dayParams.forEach(day => params.append('metaData_multi_day[]', day));

      const res = await getArticleByFields({
        id_country: actualRoute.country?.id,
        id_city: actualRoute.city?.id,
        id_region: actualRoute.region?.id,
        limit: 8,
        page: currentPage
      }, params);

      if (res?.articles) {
        if (res.pagination?.page === 1) setContent(res.articles);
        else setContent(prev => [...prev, ...res.articles.filter(a => !prev.some(p => p.id === a.id))]);
        setTotalPage(res.pagination?.totalPages || 1);
      } else {
        setContent([]);
      }

      if (theCategory) {
        const catRes = await getCategoryWithFields(theCategory.id, {
          id_country: actualRoute.country?.id,
          id_city: actualRoute.city?.id,
          id_region: actualRoute.region?.id,
        });
        if (catRes) {
          setTitle(catRes.sub_title);
          setDescription(catRes.description);
        }
      }
    })();
  }, [currentPage, actualRoute, searchParams, time, filterDays, theCategory]);

  const updateParam = (key: string, value: string | string[] | null) => {
    setSearchParams(prev => {
      const url = new URLSearchParams(prev);
      if (!value || value === '' || (Array.isArray(value) && value.length === 0)) {
        url.delete(key);
      } else if (Array.isArray(value)) {
        url.delete(key);
        value.forEach(v => url.append(key, v));
      } else {
        url.set(key, value);
      }
      return url;
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchParams({});
    setTime(undefined);
    setFilterDays([]);
    setDateRange(null);
    setCurrentPage(1);
  };

  return (
    <>
      <Helmet>
        <title>{title || "Discover Events"} - Essential Bali</title>
      </Helmet>
      
      <section className="bg-front-icewhite min-h-screen py-12">
        <div className="container">
          
          <div className="mb-12 flex flex-col items-center">
            <h1 className="text-5xl font-serif text-front-navy mb-4">{title || 'Discover Events'}</h1>
            <p className="text-gray-500 max-w-3xl text-lg leading-relaxed">{description}</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* STICKY SIDEBAR */}
            <aside className="lg:w-1/4">
              <div className="sticky top-70 space-y-8">

                {/* Date Picker */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Select Dates</h4>
                  <DateRangePicker 
                    block
                    showOneCalendar
                    value={dateRange}
                    placeholder="Select date range"
                    onChange={(val) => {
                        if (val) {
                            const startStr = val[0].toISOString().split('T')[0];
                            const endStr = val[1].toISOString().split('T')[0];
                            setDateRange([val[0], val[1]]);
                            updateParam('dates', `${startStr},${endStr}`);
                        } else {
                            setDateRange(null);
                            updateParam('dates', null);
                        }
                    }}
                  />
                </div>

                {/* Time of Day */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Time of Day</h4>
                  <RadioGroup value={time} onChange={val => { setTime(val as string); updateParam('time', val as string); }}>
                    <Radio value="morning">Morning</Radio>
                    <Radio value="afternoon">Afternoon</Radio>
                    <Radio value="night">Night</Radio>
                  </RadioGroup>
                </div>

                <button 
                  onClick={clearFilters}
                  className="w-full py-4 text-xs font-bold text-gray-400 hover:text-front-navy transition-colors border-2 border-dashed border-gray-200 rounded-2xl hover:border-front-navy/30"
                >
                  RESET ALL FILTERS
                </button>
              </div>
            </aside>

            {/* CONTENT AREA */}
            <main className="lg:w-3/4">
              
              {/* Active Chips */}
              {(time || filterDays.length > 0 || dateRange) && (
                <div className="mb-8 flex items-center gap-4 flex-wrap">
                    <span className="text-sm font-bold text-gray-400">FILTERED BY:</span>
                    <TagGroup>
                        {dateRange && (
                            <Tag closable onClose={() => {setDateRange(null); updateParam('dates', null)}}>
                                Dates: {dateRange[0].toLocaleDateString()} - {dateRange[1].toLocaleDateString()}
                            </Tag>
                        )}
                    {time && <Tag closable onClose={() => { setTime(undefined); updateParam('time', null) }} className="capitalize">Time: {time}</Tag>}
                    </TagGroup>
                </div>
              )}

              <div className="grid grid-cols-1">
                {content.map(article => <ArticleCardV3 key={article.id} article={article} />)}
              </div>

              {!content.length && (
                <div className="bg-white py-32 rounded-3xl text-center border border-dashed border-gray-200">
                  <p className="text-gray-400 italic">No events match your current selection.</p>
                  <button onClick={clearFilters} className="mt-4 text-front-navy font-bold hover:underline">Clear all filters</button>
                </div>
              )}

              {totalPage > currentPage && (
                <div className="mt-12 text-center">
                  <Button 
                    text="SHOW MORE EVENTS" 
                    onClick={() => setCurrentPage(currentPage + 1)} 
                    type="primary"
                  />
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      <section className="bg-front-icewhite py-24">
        <Newsletter />
      </section>
    </>
  );
};

export default EventsV3;
