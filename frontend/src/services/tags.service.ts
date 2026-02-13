import apiClient from "../api";
import { ApiResponse } from "../types/api.type";
import { CreateTagDto, CreateTagResponse, EditTagResponse, GetTagByIdResponse, GetTagsResponse, Tag } from '../types/tags.type';


export const createTag = async (
  payload: CreateTagDto
): Promise<CreateTagResponse> => {
  try {
    const response = await apiClient.post<CreateTagResponse>(
      "/tags",
      payload
    );
    return response.data
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const getAllTags = async (): Promise<GetTagsResponse> => {
  try {
    const response = await apiClient.get<GetTagsResponse>("/tags");
    return response.data
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getTagByID = async (id: number): Promise<GetTagByIdResponse> => {
  try {
    const response = await apiClient.get<GetTagByIdResponse>(`/tags/${id}`);
    return response.data
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    throw error;
  }
};

export const getTagByIDs = async (id: number[]) => {
  try {
    const getTags = await apiClient.get<ApiResponse<Tag[]>>(`/tags/${id.join(',')}`)
    if(getTags.data.status_code == 200 && getTags.data.data) {
      return getTags.data.data
    }
  } catch (e) {
    console.log(e)
  }
}

export const editTag = async (id: number, payload: CreateTagDto): Promise<EditTagResponse> => {
  try {
    const response = await apiClient.put<EditTagResponse>(`/tags/${id}`, payload);
    return response.data
  } catch (error) {
    console.error("Error editing category by ID:", error);
    throw error;
  }
};

export const deleteTag = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/tags/${id}`);
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};