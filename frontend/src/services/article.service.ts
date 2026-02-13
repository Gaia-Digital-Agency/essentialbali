import apiClient from "../api";
import {
  ArticleApiResponseProps,
  ArticleProps,
  ArticleStatusProps,
  CreateArticleProps,
  GetTotalCountArticlePerCountryResponse,
  GetTotalCountArticleResponse,
} from "../types/article.type";
import { ApiResponse } from "../types/api.type";

interface ArticleFieldsProps {
  category?: number | number[];
  id_country?: number | number[];
  id_city?: number | number[];
  id_region?: number | number[];
  status?: ArticleStatusProps[];
  limit?: number;
  page?: number;
  isTrending?: boolean,
  // pinned?: boolean
}

interface ResponseArticleFieldsProps {
  articles: ArticleApiResponseProps[];
  pagination?: {
    page: number;
    limit: number;
    totalData: number;
    totalPages: number;
  };
}

export interface TrendingArticleResponse {
  articles: ArticleApiResponseProps[];
}

// GET
const getArticleById = async (id: number) => {
  try {
    const getArticle = await apiClient.get<ApiResponse<ArticleApiResponseProps[]>>(
      `article/admin/${id}`
    );
    if (getArticle.data.status_code == 200 && getArticle.data.data) {
      return getArticle.data.data[0];
    }
  } catch (e) {
    console.log(e);
  }
};

const getArticleByIds = async (ids: Array<number>) => {
  try {
    const getArticle = await apiClient.get<ApiResponse<ArticleProps[]>>(
      `article?${ids.map((id) => `ids[]=${id}`).join("&")}`
    );
    if (getArticle.data.status_code == 200 && getArticle.data.data) {
      return getArticle.data.data;
    }
    throw new Error("Unexpected error has occured");
  } catch (e) {
    console.log(e);
  }
};

const getArticleByFields = async (fields: ArticleFieldsProps, params?: URLSearchParams) => {
  try {
    const field = Object.entries(fields).flatMap(([key, value]) => {
      if (!value) return [];
      if (Array.isArray(value)) {
        return value.map((val) => `${key}[]=${val}`);
      }
      return [`${key}=${value}`];
    });
    const getArticles = await apiClient.get<
      ApiResponse<ResponseArticleFieldsProps>
    >(`article/?${field.flat().join("&")}${field.length ? '&' : ''}${params?.toString() ? `${params.toString()}` : ''}`);
    if (getArticles.data.status_code != 200) throw Error("cant get articles");
    // const copyArticles = getArticles
    // copyArticles.data.data?.articles.map(article => {
    //     // return ({...article, featured_image_url: ?})
    // })

    return getArticles.data.data;
  } catch (e) {
    console.log(e);
  }
};

const getArticleBySlug = async (slug: string) => {
  try {
    const getArticles = await apiClient.get<
      ApiResponse<ResponseArticleFieldsProps>
    >(`article/?slug=${slug}`);
    if (
      getArticles.data.status_code == 200 &&
      getArticles?.data.data?.articles.length
    ) {
      return getArticles.data.data.articles[0];
    }
    throw Error(getArticles.statusText);
  } catch (e) {
    console.log(e);
  }
};

const getTop10TrendingArticle = async (): Promise<
  TrendingArticleResponse | undefined
> => {
  try {
    const getArticles = await apiClient.get<
      ApiResponse<TrendingArticleResponse>
    >(`article?limit=10&isTrending=1`);
    if (getArticles.data.status_code === 200 && getArticles.data.data) {
      const vaRetval = getArticles.data.data;
      return vaRetval;
    }
    throw Error(getArticles.statusText);
  } catch (error) {
    console.error(error);
  }
};

const getTotalArticles = async () => {
  try {
    const response = await apiClient.get<GetTotalCountArticleResponse>("article/count-articles");
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const getTotalArticlesPerCountry = async () => {
  try {
    const response = await apiClient.get<GetTotalCountArticlePerCountryResponse>("article/count-article-per-country");
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

const getArticleByKeyword = async (params: {keyword: string, page?: number | string, limit?: number | string}) => {
  try {
    const newParams = new URLSearchParams(Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])))
    const response = await apiClient.get<ApiResponse<ResponseArticleFieldsProps>>(`article/search?${newParams.toString()}`)
    if(response.data.status_code == 200 && response.data.data) {
      return response.data.data
    }
  } catch (e) {
    console.log(e)
  }
}

// POST

const editArticleById = async (id: number, data: ArticleProps) => {
  try {
    const editArticle = await apiClient.put<ApiResponse<string>>(
      `article/admin/${id}`,
      data
    );
    if (editArticle.data.status_code != 200)
      throw Error("Unexpected error occured" + editArticle.data);
    return true;
  } catch (e) {
    console.log(e);
  }
};

const createArticle = async (object: CreateArticleProps) => {
  try {
    const createArticle = await apiClient.post<
      ApiResponse<ArticleProps>
    >("article/admin", object);
    if (createArticle.data.status_code != 200)
      throw Error("Unexpected error occured" + createArticle.data);
    return createArticle.data.data;
  } catch (e) {
    console.log(e);
  }
};

const deleteArticle = async (id: number) => {
  try {
    const deleteArticle = await apiClient.delete<ApiResponse<number[]>>(
      `article/admin/${id}`
    );
    if (deleteArticle.data.status_code != 200) throw Error("cant delete");
    return true;
  } catch (e) {
    console.log(e);
  }
};

export {
  getArticleById,
  getArticleByIds,
  getArticleBySlug,
  editArticleById,
  createArticle,
  getArticleByFields,
  deleteArticle,
  getTotalArticles,
  getTop10TrendingArticle,
  getTotalArticlesPerCountry,
  getArticleByKeyword
};
