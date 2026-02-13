import { BaseImage } from "./image.type"
import { ApiResponse } from "./api.type"
import { ArticleApiResponseProps } from "./article.type"
 
export type TemplateType = "Home" | "Housing" | "Footer" | "Header" | "Logo" | "About" | "Script"

export type GetTemplateResponse = ApiResponse<BaseTemplateType<any>>

export interface BaseTemplateType<T> {
    id: number,
    url: string,
    content: string,
    template: T
}

type Article = number

export interface BaseTemplateLocation {
    advertisement?: Array<{url: string}>
    heroImage: Article[],
    trendingMain: Article,
    trending: Article[],
    events: Article[],
    ultimateGuide: Article[],
    about: {
        title: string,
        description: string,
        image: BaseImage
    }
}

export interface BaseTemplateSubLocation extends BaseTemplateLocation {
    overseas: Article[]
}

export type TemplateSubLocation = BaseTemplateType<BaseTemplateSubLocation>
export type TemplateLocation = BaseTemplateType<BaseTemplateLocation>

export type ComponentTemplateHomeProps = {
    preContent: PreContentProps,
    admin?: boolean
}

export type PreContentProps = Array<ArticleApiResponseProps | undefined | 0>
