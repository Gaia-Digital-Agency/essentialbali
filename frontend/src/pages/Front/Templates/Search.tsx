import React, { useEffect, useState } from "react";
// import Advertisement from "../../../components/front/Advertisement";
import { ArticleProps } from "../../../types/article.type";
import useArticle from "../../../hooks/useArticle";
import Image from "../../../components/front/Image";
import TextLink from "../../../components/front/TextLink";
import { useSearchParams, Link } from "react-router";
import { getArticleByKeyword } from "../../../services/article.service";
import Button from "../../../components/front/Button";
import { useContent } from "../../../context/ContentContext";
import { useRoute } from "../../../context/RouteContext";
import { Helmet } from "react-helmet-async";

import SearchEmptyState from "../../../components/front/SearchEmptyState";

const ArticleCard: React.FC<{ article: ArticleProps & { createdAt?: string, publishedAt?: string } }> = ({ article }) => {
  const { getPermalink, getFeaturedImageUrl, getCategory } = useArticle()
  const permalink = getPermalink(article)
  const category = getCategory(article)
  
  // Format date: e.g. "11 March 2026"
  const date = new Date(article.publishedAt || article.createdAt || Date.now()).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <article className="group flex flex-col h-full bg-transparent">
      {/* Editorial Thumbnail */}
      <div className="relative overflow-hidden mb-8">
        <Image 
          link={permalink} 
          url={getFeaturedImageUrl(article, '16_9')} 
          ratio="66%" // Slightly taller aspect ratio for editorial feel
          alt={article.title}
        />
        {/* Subtle Category Tag */}
        {category && (
          <div className="absolute bottom-0 left-0 bg-white/90 backdrop-blur-sm px-4 py-2 z-[2]">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-front-navy">
              {category.name}
            </span>
          </div>
        )}
      </div>

      {/* Editorial Content */}
      <div className="flex flex-col flex-grow">
        <div className="mb-4">
          <span className="text-[11px] font-medium text-front-dustly-slate uppercase tracking-[0.15em] italic">
            {date}
          </span>
        </div>
        
        <h3 className="mb-4 text-2xl lg:text-3xl font-serif font-medium text-front-navy leading-[1.2] group-hover:text-front-dustly-slate transition-colors duration-400">
          <Link to={permalink} className="line-clamp-2">
            {article.title}
          </Link>
        </h3>

        <p className="text-front-charcoal-grey text-sm lg:text-base font-light leading-relaxed line-clamp-3 mb-8">
          {article.sub_title}
        </p>

        <div className="mt-auto">
          <Link 
            to={permalink} 
            className="inline-block relative text-[11px] font-bold uppercase tracking-[0.3em] text-front-navy after:content-[''] after:absolute after:bottom-[-6px] after:left-0 after:w-10 after:h-[1px] after:bg-front-dustly-slate group-hover:after:w-full after:transition-all after:duration-700"
          >
            Explore
          </Link>
        </div>
      </div>
      
      {/* Visual Separator for Mobile */}
      <div className="mt-16 w-full h-[1px] bg-gray-100 md:hidden"></div>
    </article>
  )
}

const RenderArticle: React.FC<{ content?: ArticleProps[], q?: string | null }> = ({ content, q }) => {
  if (content && content.length) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 lg:gap-x-16 gap-y-20 lg:gap-y-24">
        {
          content?.map((article: ArticleProps) => (
            <div key={article.id}>
              <ArticleCard article={article} />
            </div>
          ))
        }
      </div>
    )
  }
  if (q && q.length < 3) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center col-span-12">
        <div className="bg-orange-50 text-front-dustly-slate p-6 rounded-2xl border border-orange-100 max-w-md">
          <p className="font-serif text-xl mb-2">Search query too short</p>
          <p className="font-sans text-sm opacity-80">Keyword search needs to have at least 3 characters to provide accurate results.</p>
        </div>
      </div>
    )
  }
  if (q) {
    return <SearchEmptyState keyword={q} />
  }
  return null
}

const Search: React.FC = () => {
  const { initialData } = useContent()
  const { clientChange } = useRoute()
  // const article = useArticle()
  const [content, setContent] = useState<ArticleProps[]>(initialData?.articles ?? [])
  const [totalPage, setTotalPage] = useState<number>(initialData?.pagination?.totalPages ?? 1)
  const [page, setPage] = useState<number>(initialData?.pagination?.page ?? 1)
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q')
  const LIMIT = 7
  useEffect(() => {
    // Reset state when search query changes
    setContent([]);
    setPage(1);
    setTotalPage(1);
  }, [q]);

  useEffect(() => {
    if (!q || !clientChange) return;
    (async () => {
      const articles = await getArticleByKeyword({ keyword: q, page: page, limit: LIMIT })
      if (articles?.articles) {
        if (page === 1) {
          setContent(articles.articles);
        } else {
          setContent(prev => {
            const newUniqueArticles = articles.articles.filter(newArticle =>
              !prev.some(prevArticle => prevArticle.id === newArticle.id)
            );
            return [...prev, ...newUniqueArticles];
          });
        }
      }
      if (articles?.pagination) {
        setTotalPage(articles.pagination.totalPages)
      }
    })()
  }, [page, q]) // <-- Tambahkan 'q' di sini agar pencarian terpantau

  const clickMoreHandler = () => {
    if (page > totalPage) return
    setPage(prev => prev + 1)
  }

  return (
    <>
      <Helmet>
        <title>{q ?? 'Search'} - Essential Bali</title>
        <meta name="description" content="essentialbali is the ultimate Bali area guide for travelers, expats, and locals, featuring the best dining, events, schools, wellness, and travel in Bali" />
      </Helmet>
      <section className="py-12 bg-front-icewhite">
        {/* <div className="container">
          <Advertisement />
        </div> */}
        <div className="container py-12">
          <RenderArticle content={content} q={q} />
          {
            !!(page < totalPage) &&
            <div className="py-8 text-center button-wrapper">
              <Button text="Load More" onClick={clickMoreHandler} />
            </div>
          }
        </div>
      </section>
    </>
  )
}


export default Search