import { j as apiClient } from "./TimeContext-B5j8j_GZ.js";
async function uploadMediaBulk(files) {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file, file.name);
    });
    const response = await apiClient.post(
      "/asset_media/upload-bulk",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Upload failed", error);
    throw error;
  }
}
const getAllMedia = async (params) => {
  const response = await apiClient.get(
    "/asset_media",
    { params }
  );
  const responseData = response.data.data;
  if (Array.isArray(responseData)) {
    return {
      data: responseData,
      hasMore: false
    };
  } else {
    return {
      data: responseData.media,
      hasMore: responseData.hasMore
    };
  }
};
async function updateAssetMedia(id, payload) {
  try {
    payload.new_filename = payload.filename;
    delete payload.filename;
    const res = await apiClient.put(
      `asset_media/${id}`,
      payload
    );
    return res.data;
  } catch (error) {
    console.error("Upload failed", error);
    throw error;
  }
}
export {
  updateAssetMedia as a,
  getAllMedia as g,
  uploadMediaBulk as u
};
