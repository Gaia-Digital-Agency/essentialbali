import { ApiResponse } from "./auth.type";

export type GetArticleResponse = ApiResponse<ArticleApiResponseProps>;

type BaseArticleProps = {
  id: number;
  article_id?: number;
};
export interface ArticleApiResponseProps extends ArticleProps {
  name_country: string;
  country_flag: string;
  name_city?: string;
  name_region?: string;
  author_name: string;
  parent_category_id: number;
  parent_category_name: string;
  createdAt: string; // ISO date string
  createdBy: number;
  updatedAt: string; // ISO date string
  updatedBy: number;
  publishedAt: string; // ISO date string
  scheduledAt: string; // ISO date string
  category_name: string;
  pinned: 0 | 1;

  featured_image_title?: string;
  featured_image_caption?: string;
  featured_image_description?: string;

  featured_image_4_3_title?: string;
  featured_image_4_3_caption?: string;
  featured_image_4_3_description?: string;

  featured_image_16_9_title?: string;
  featured_image_16_9_caption?: string;
  featured_image_16_9_description?: string;
}

export interface CreateArticleProps {
  title: string;
  sub_title: string;
  slug: string;
  article_post: string;
  tags?: Array<number>;
  featured_image_id?: number;
  featured_image_url?: string;
  featured_image_alt?: string;
  featured_image_alt_text?: string;

  featured_image_4_3_id?: number;
  featured_image_4_3_url?: string;
  featured_image_4_3_alt?: string;
  featured_image_4_3_alt_text?: string;

  featured_image_16_9_id?: number;
  featured_image_16_9_url?: string;
  featured_image_16_9_alt?: string;
  featured_image_16_9_alt_text?: string;

  status: ArticleStatusProps;
  category_id: number;
  meta_data?: Record<string, string | number>;
  id_country: number;
  id_city?: number;
  id_region?: number;
}

interface AllArticleCountResponse {
  published?: number;
}

interface ArticleCountPerCountry {
  jumlah: number;
  id_country: number;
  name: string;
}

export type GetTotalCountArticlePerCountryResponse = ApiResponse<
  ArticleCountPerCountry[]
>;

export type GetTotalCountArticleResponse = ApiResponse<AllArticleCountResponse>;

export type ArticleProps = CreateArticleProps & BaseArticleProps;

export type ArticleStatusProps = "draft" | "published" | "archived" | "bin";
