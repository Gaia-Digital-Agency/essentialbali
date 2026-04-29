import apiClient from "../api";
import { ApiResponse } from "../types/auth.type";

// type SubscribeNewsletterProps = boolean;

export interface GetTotalSubscriberResponse {
  active: number;
  non_active: number;
}

export interface SubscribeNewsletterData {
  email: string;
  subscribed_at: string;
  message?: string;
}

export const subscribeNewsletter = async (email: string) => {
  try {
    const response = await apiClient.post<
      ApiResponse<SubscribeNewsletterData>
    >("subscribers/subscribe", { email, source: "homepage" });

    return response.data;
  } catch (error) {
    console.error("subscribeNewsletter error:", error);
    throw error;
  }
};

export const getTotalSubscriber =
  async (): Promise<ApiResponse<GetTotalSubscriberResponse> | null> => {
    try {
      const response = await apiClient.get<
        ApiResponse<GetTotalSubscriberResponse>
      >("newsletter/admin/count-subscribers");
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  };
