import apiClient from "../api";
import {
  DeleteSocmedResponse,
  EntryDataSocmedResponse,
  GetSocmedResponse,
  SocmedEntryDataInterface,
} from "../types/socmed.type";

export const getAllSocmed = async (): Promise<GetSocmedResponse | null> => {
  try {
    const response = await apiClient.get<GetSocmedResponse>("socmed");
    return response.data;
  } catch (error) {
    console.error(error);
    // return null;
    throw error;
  }
};

export const getSocmedByID = async (
  id: number
): Promise<GetSocmedResponse | null> => {
  try {
    const response = await apiClient.get<GetSocmedResponse>(`socmed/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
    // return null;
    throw error;
  }
};

export const createSocmed = async (
  payload: SocmedEntryDataInterface
): Promise<EntryDataSocmedResponse | null> => {
  try {
    const response = await apiClient.post<EntryDataSocmedResponse>(
      `socmed`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("BADSIBA => ", error);
    // return null;
    throw error;
  }
};

export const editSocmed = async (
  id: number,
  payload: SocmedEntryDataInterface
): Promise<EntryDataSocmedResponse | null> => {
  try {
    const response = await apiClient.put<EntryDataSocmedResponse>(
      `socmed/${id}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error(error);
    // return null;
    throw error;
  }
};

export const deleteSocmed = async (
  id: number
): Promise<DeleteSocmedResponse | null> => {
  try {
    const response = await apiClient.delete<DeleteSocmedResponse>(
      `socmed/${id}`
    );
    return response.data;
  } catch (error) {
    console.error(error);
    // return null;
    throw error;
  }
};
