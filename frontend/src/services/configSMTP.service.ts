import apiClient from "../api";
import { EntryDataSMTPConfig, GetSMTPConfigResponse, GetSMTPProviderByIDResponse, GetSMTPProviderResponse, SMTPConfigInterface } from "../types/configSMTP.type";

export const getDataSMTPProvider = async (): Promise<GetSMTPProviderResponse | null> => {
  try {
    const response = await apiClient.get<GetSMTPProviderResponse>("setting/admin/smtp/providers");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getDataSMTPConfig = async (): Promise<GetSMTPConfigResponse | null> => {
  try {
    const response = await apiClient.get<GetSMTPConfigResponse>("/setting/admin/smtp?view=1");
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateSMTPConfig = async (payload: SMTPConfigInterface): Promise<EntryDataSMTPConfig | null> => {
  try {
    const response = await apiClient.post<EntryDataSMTPConfig>("/setting/admin/smtp", payload);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getDataSMTPProviderByID = async (id: number): Promise<GetSMTPProviderByIDResponse | null> => {
  try {
    const response = await apiClient.get<GetSMTPProviderByIDResponse>(`setting/admin/smtp/provider/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};