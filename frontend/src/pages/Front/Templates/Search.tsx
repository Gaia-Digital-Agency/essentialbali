import React, { useEffect, useState } from "react";
// import Advertisement from "../../../components/front/Advertisement";
import { ArticleProps } from "../../../types/article.type";
import useArticle from "../../../hooks/useArticle";
import Image from "../../../components/front/Image";
import TextLink from "../../../components/front/TextLink";
import { useSearchParams } from "react-router";
import { getArticleByKeyword } from "../../../services/article.service";
import Button from "../../../components/front/Button";
import { useContent } from "../../../context/ContentContext";
import { useRoute } from "../../../context/RouteContext";
import { Helmet } from "react-helmet-async";

const ArticleCard: React.FC<{ article: ArticleProps & { createdAt?: string } }> = ({ article }) => {
  const { getPermalink, getFeaturedImageUrl } = useArticle()
  return (
    <>
      <div className="grid grid-cols-12 gap-6 mb-16">
        <div className="order-2 col-span-12 md:col-span-6 md:order-1">
          <div className="mb-6 title-wrapper">
            <p className="font-serif text-front-article-title">{article.title}</p>
          </div>
          <div className="mb-6 subtitle-wrapper">
            <p>{article.sub_title}</p>
          </div>
          <div className="button-wrapper">
            <TextLink link={getPermalink(article)} color="gray" text="READ MORE" />
          </div>
        </div>
        <div className="order-1 col-span-12 md:col-span-6 md:order-2">
          <div className="image-wrapper">
            <Image link={getPermalink(article)} url={getFeaturedImageUrl(article)} />
          </div>
        </div>
      </div>
    </>
  )
}

const RenderArticle: React.FC<{ content?: ArticleProps[], q?: string | null }> = ({ content, q }) => {
  if (content && content.length) {
    return (
      <>
        {
          content?.map((article: ArticleProps) => (
            <div className="mb-8 article-card">
              <ArticleCard article={article} />
            </div>
          ))
        }
      </>
    )
  }
  if (q && q.length < 3) {
    // return <>Keyword search need to have at least 3 characters</>
    return <><div className="flex items-center justify-center col-span-12 font-serif">Keyword search need to have at least 3 characters</div></>
  }
  if (q) {
    // return <>Article not found</>
    return <><div className="flex items-center justify-center col-span-12 font-serif">Article not found</div></>
  }
  // return <SearchBar search="" />
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