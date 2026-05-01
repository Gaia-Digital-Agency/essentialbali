import { useTaxonomies } from "../context/TaxonomyContext"
import { ArticleProps as Article, ArticleApiResponseProps } from "../types/article.type"
import { getArticleByFields } from "../services/article.service"
import { ArticleStatusProps } from "../types/article.type"
const API_URL = import.meta.env.VITE_WHATSNEW_BACKEND_URL
const IMAGE_URL = import.meta.env.VITE_IMAGE_URL || API_URL
// const env = import.meta.env.MODE

interface ArticleFieldsProps {
  category?: number | number[];
  id_country?: number | number[];
  id_city?: number | number[];
  id_region?: number | number[];
  status?: ArticleStatusProps[];
  limit?: number;
  page?: number;
  isTrending?: boolean,
  pinned?: 1 | 0,
  exclude_category?: Array<string>
}

type GenerateContentFuncProps = {
    content: Array<0 | ArticleApiResponseProps | undefined>,
    admin?: boolean,
    query?: ArticleFieldsProps
}

const useArticle = () => {
    const {getCountryById, getCategoryById, taxonomies} = useTaxonomies() //getRegionById, getCityById
    const DUMMY_ADMIN_ARTICLE = {
        title: 'this will fill automatically',
        sub_title: 'you only see this on admin page, user wont see this'
    } as ArticleApiResponseProps
    const getCategory = (article: Article) => {
        return getCategoryById(article.category_id)
    }
    const getPermalink = (article: Article) => {
        return `/${getCountryById(article.id_country)?.slug}/${getCategory(article)?.slug_title}/${article.slug}`
    }

    const _getArticleByFields = async (field: ArticleFieldsProps) => {
        const urlParams = new URLSearchParams()
        Object.keys(field).forEach((key: string) => {
            const ke = key as keyof typeof field
            if(!field[ke]) return 
            if(ke == 'exclude_category') {
                const slugsToId = field[ke].map(cat => (taxonomies.categories?.find(tax => (tax.slug_title == cat))?.id))
                const filterCats = taxonomies.categories?.filter(cat => (!field[ke]?.includes(cat.slug_title)))
                filterCats?.filter(cat => (!slugsToId.includes(cat?.id_parent))).forEach(cat => {
                    urlParams.append('category[]', `${cat.id}`)
                })

            } else if(Array.isArray(field[ke])) {
                field[ke].forEach(k => {
                    if(!k) return
                    urlParams.append(`${key}[]`, `${k}`)
                })
            } else {
                urlParams.append(key, `${field[ke]}`)
            }
        })
        const get = await getArticleByFields({}, urlParams)
        if(get?.articles) {
            return get.articles
        }
    }

    const getFeaturedImageUrl = (article: Article | undefined, ratio: '4_3' | '16_9' | null = null) => {
        if(!article) return ''
        const ratioUrl = ratio ? article[`featured_image_${ratio}_url`] : null
        const candidate: string | undefined = ratioUrl || article.featured_image_url
        if(candidate){
            // GCS-backed URLs are already absolute (https://storage.googleapis.com/...).
            // Only legacy relative-path values need the IMAGE_URL prefix.
            if(/^https?:\/\//i.test(candidate)) return candidate
            return `${IMAGE_URL}/${candidate}`
        }
        return `${API_URL}/logo.png`
    }

    const getDeepestLocation = (article?: ArticleApiResponseProps | undefined, _limit?: 'city' | 'country') => {
        if(!article) return
        return getCountryById(article.id_country)
    }

    const generateContent = async ({content, admin = false, query = {}}: GenerateContentFuncProps) => {
        if(!content.filter(con => con == 0).length) return content
        const limit = content.length
        let articleFill = [] as ArticleApiResponseProps[]
        const existingIds = content.filter(article => !!article).map((article: ArticleApiResponseProps) => article.id)
        if(admin) {
            for(let i = 0; limit > i; i++) {
                articleFill.push(DUMMY_ADMIN_ARTICLE)
            }
        } else {
            const get = await _getArticleByFields({...query, limit: limit, status: ['published']})
            if(get) {
                articleFill = get.filter(article => !existingIds.includes(article.id))
            }
        }

        return content.map(con => {
            if(con) return con
            return articleFill.shift() ?? undefined
        })
    }

    return {getCategory, getPermalink, getFeaturedImageUrl, generateContent, getDeepestLocation}
}

export default useArticle
