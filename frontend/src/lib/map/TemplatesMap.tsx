import { ArticleApiResponseProps } from "../../types/article.type"
export type HomeTemplateKey = 'heroImage' | 'trending' | 'mostPopular' | 'events' | 'ultimateGuide' | 'overseas'
type TemplateFieldsProps = {
    articles: Array<ArticleApiResponseProps | 0>,
    rules: {
        limit: number
    },
    query?: {
        useRoute?: boolean,
        category?: {
            slug?: string,
            id?: number,
            exclude_slugs?: Array<string>
        },
        pinned: 1 | 0
    }
}

export type HomeTemplateProps = Record<HomeTemplateKey,TemplateFieldsProps>

export const HomeTemplate = {
    heroImage: {
        articles: [0,0,0],
        rules: {
            limit: 3
        },
        query: {
            useRoute: true,
            pinned: 1,
            category: {
                slug: 'featured'
            }
        }
    },
    trending: {
        articles: [0,0,0,0,0],
        rules: {
            limit: 5
        },
        query: {
            useRoute: true,
            category: {
                exclude_slugs: ['most-popular', 'ultimate-guide', 'events']
            }
        }
    },
    mostPopular: {
        articles: [0,0,0,0,0,0,0,0],
        rules: {
            limit: 8
        },
        query: {
            useRoute: true,
            category: {
                slug: 'most-popular'
            }
        }
    },
    events: {
        articles: [0,0,0,0],
        rules: {
            limit: 4
        },
        query: {
            useRoute: true,
            category: {
                slug: 'events'
            }
        }
    },
    ultimateGuide: {
        articles: [0,0,0,0,0,0],
        rules: {
            limit: 6
        },
        query: {
            useRoute: true,
            category: {
                slug: 'ultimate-guide'
            }
        }
    },
    overseas: {
        articles: [0,0,0,0,0,0,0,0],
        rules: {
            limit: 8
        },
        query: {
            useRoute: false
        }
    }
} as HomeTemplateProps