import apiClient from "../api";
import {
  AssetMedia,
  GetAllAssetMediaResponse,
  UpdateMediaPayload,
  UpdateMediaResponse,
  UploadMediaResponse,
} from "../types/media.type";

export interface NormalizedMediaResponse {
  data: AssetMedia[];
  hasMore?: boolean;
}

export async function uploadMediaBulk(
  files: File[]
): Promise<UploadMediaResponse> {
  try {
    const formData = new FormData();
    // files.forEach((file) => {
    //   formData.append("images", file);
    // });

    files.forEach((file) => {
      // pastikan yang dikirim file asli, bukan object dengan preview
      formData.append("images", file, file.name);
    });

    // return ;

    const response = await apiClient.post<UploadMediaResponse>(
      "/asset_media/upload-bulk",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Upload failed", error);
    throw error;
  }
}

export async function getAllMedia_v1(): Promise<GetAllAssetMediaResponse> {
  try {
    const response = await apiClient.get<GetAllAssetMediaResponse>(
      "/asset_media"
    );

    return response.data;
  } catch (error) {
    console.error("Upload failed", error);
    throw error;
  }
}

export const getAllMedia = async (params?: {
  page?: number;
  limit?: number;
}): Promise<NormalizedMediaResponse> => {
  const response = await apiClient.get<GetAllAssetMediaResponse>(
    "/asset_media",
    { params }
  );
  const responseData = response.data.data;

  if (Array.isArray(responseData)) {
    return {
      data: responseData,
      hasMore: false,
    };
  } else {
    return {
      data: responseData.media,
      hasMore: responseData.hasMore,
    };
  }
};

export async function updateAssetMedia(
  id: number,
  payload: UpdateMediaPayload
): Promise<UpdateMediaResponse> {
  try {
    payload.new_filename = payload.filename
    delete payload.filename
    const res = await apiClient.put<UpdateMediaResponse>(
      `asset_media/${id}`,
      payload
    );
    return res.data;
  } catch (error) {
    console.error("Upload failed", error);
    throw error;
  }
}
