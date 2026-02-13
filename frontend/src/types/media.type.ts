export interface MediaFile {
  id: number;
  mimetype: string;
  filename: string;
  path: string;
  size: number;
  createdAt: string;
  updatedAt: string;
}
export interface UploadMediaResponse {
  status: string;
  status_code: number;
  data: MediaFile[];
}

export interface AssetMedia {
  id: number;
  title: string | null;
  alt_text: string | null;
  caption: string | null;
  description: string | null;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedMediaData {
  hasMore: boolean;
  media: AssetMedia[];
}

export interface GetAllAssetMediaResponse {
  status: string;
  status_code: number;
  data: AssetMedia[] | PaginatedMediaData;
  // data: AssetMedia[];
}

// export type GetAllAssetMediaResponse = ApiResponse<AssetMedia[]>

export interface UpdateMediaPayload {
  title?: string;
  alt_text?: string;
  caption?: string;
  description?: string;
  filename?:string;
  new_filename?: string;
  updatedBy?: string | number; // bisa userId atau string
  updatedAt?: string; // biasanya ISO string
}

export interface UpdateMediaResponse {
  status: string;
  status_code: number;
  data: AssetMedia;
}
