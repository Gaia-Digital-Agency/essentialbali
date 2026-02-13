import { j as apiClient } from "./TimeContext-B5j8j_GZ.js";
const createTag = async (payload) => {
  try {
    const response = await apiClient.post(
      "/tags",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};
const getAllTags = async () => {
  try {
    const response = await apiClient.get("/tags");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};
const getTagByID = async (id) => {
  try {
    const response = await apiClient.get(`/tags/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    throw error;
  }
};
const getTagByIDs = async (id) => {
  try {
    const getTags = await apiClient.get(`/tags/${id.join(",")}`);
    if (getTags.data.status_code == 200 && getTags.data.data) {
      return getTags.data.data;
    }
  } catch (e) {
    console.log(e);
  }
};
const editTag = async (id, payload) => {
  try {
    const response = await apiClient.put(`/tags/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error("Error editing category by ID:", error);
    throw error;
  }
};
const deleteTag = async (id) => {
  try {
    await apiClient.delete(`/tags/${id}`);
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};
export {
  getTagByID as a,
  getTagByIDs as b,
  createTag as c,
  deleteTag as d,
  editTag as e,
  getAllTags as g
};
