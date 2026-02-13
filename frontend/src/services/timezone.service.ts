import apiClient from "../api";
import { GetTimezoneResponse } from "../types/timezone.type";

export const getTimezones = async (): Promise<GetTimezoneResponse> => {
  try {
    const response = await apiClient.get<GetTimezoneResponse>("/timezone");
    return response.data
  } catch (error) {
    console.error("Error fetching timezones:", error);
    throw error;
  }
};
