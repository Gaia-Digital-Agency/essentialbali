import apiClient from "../api";
import { GetAllSubscribersResponse } from "../types/subscriber.type";

export const getAllSubscriber = async (page? : number, limit? : number): Promise<GetAllSubscribersResponse> => {
  try {
    if(!page) page = 1;
    if(!limit) limit = 5;
    const response = await apiClient.get<GetAllSubscribersResponse>("/newsletter/admin/subscriber?page=" + page + "&limit=" + limit);
    return response.data
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};