import { ApiResponse } from "./auth.type";

// Request body untuk POST /tags
export interface CreateTagDto {
  name: string;
  slug: string | null;
  icon?: number ;
}

// Data dasar tag
export interface Tag {
  id: number;
  name: string;
  slug: string;
  icon? : number | string | null;
  createdBy?: number;
  updatedBy?: number;
}

// Response untuk POST /tags
// status_code 201
export type CreateTagResponse = ApiResponse<{
  name: string;
  slug: string;
  icon: number;
  createdBy: number;
  updatedBy: number;
}>;

// Response untuk GET /tags (list)
export type GetTagsResponse = ApiResponse<Tag[]>;

// Response untuk GET /tags/:id
// meskipun "data" berbentuk array di contoh, 
// biasanya bisa dianggap single object, 
// tapi aku buat sesuai dengan response asli.
export type GetTagByIdResponse = ApiResponse<Tag[]>;

// Response untuk PUT /tags/:id
export type EditTagResponse = ApiResponse<{
  name: string;
  slug: string;
}>;