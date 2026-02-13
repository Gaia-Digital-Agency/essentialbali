import { Tag } from "./tags.type";

export interface categoryService {
  title: string;
  sub_title: string;
  slug_title: string;
  description: string;
  id_parent: number;
  template_name: string;
  id_country?: number;
  id_city?: number;
  id_region?: number;
  tag?: number[];
}

export interface createCategoryResponse {
  data: {
    is_child: boolean;
    id: number;
    title: string;
    sub_title: string;
    slug_title: string;
    description: string;
    id_parent: number;
    template_name: string;
  };
}

export interface Category {
  id: number;
  title: string;
  sub_title: string;
  slug_title: string;
  description: string;
  icon: number | null;
  is_child: boolean;
  id_parent: number;
  template_name: string;
  parent?: string;
  tag?: number[];
  tags?: Tag[]
}

export interface getCategoryByIDResponse {
  data: Category;
}

export interface getAllCategoryResponse {
  data: Category[];
}

export interface getCategoryDescByLocationResponse {
  status : string;
  status_code : number;
  data : {
    description : string;
    sub_title : string
  };
}