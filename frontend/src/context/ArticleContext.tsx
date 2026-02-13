import React, {useContext, createContext, PropsWithChildren} from "react"
import { ArticleProps as Article } from "../types/article.type"
import { useTaxonomies } from "./TaxonomyContext"
import { Category } from "../types/category.type"
const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL
const env = import.meta.env.MODE

interface ArticleProviderProps extends PropsWithChildren {
    
}

type ArticleContextProps = {
    getCategory: (article: Article) => Category | undefined
    getPermalink: (article: Article) => string
    getFeaturedImageUrl: (article: Article | undefined) => string
}

const ArticleContext = createContext<ArticleContextProps>({
    getCategory: () => undefined,
    getPermalink: () => '',
    getFeaturedImageUrl: () => ''
})

export const ArticleProvider: React.FC<ArticleProviderProps> = ({children}) => {
    const {getCountryById, getCategoryById} = useTaxonomies()
    const getCategory = (article: Article) => {
        return getCategoryById(article.category_id)
    }
    const getPermalink = (article: Article) => {
        return `/${getCountryById(article.id_country)?.slug}/${getCategory(article)?.slug_title}/${article.slug}`
    }

    const getFeaturedImageUrl = (article: Article | undefined) => {
        if(!article) return ''
        if(article.featured_image_url) return `${API_URL}/${article.featured_image_url}`
        if(env == 'development') return `https://picsum.photos/id/${article.id*10}/1920/1080`
        return ''
    }

    return (
        <ArticleContext.Provider value={{getCategory, getPermalink, getFeaturedImageUrl}}>
            {children}
        </ArticleContext.Provider>
    )
}

export const useArticle = () => useContext(ArticleContext)