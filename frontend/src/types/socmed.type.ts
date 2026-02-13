import { ApiResponse } from "../types/api.type";

export interface SocmedDetailInterface {
  id: number;
  platform: string;
  icon: string;
  url: string;
  isActive: number;
}

export interface SocmedEntryDataInterface {
  platform_name: string;
  icon: number | undefined;
  url: string;
}

export type GetSocmedResponse = ApiResponse<SocmedDetailInterface[]>;

export type EntryDataSocmedResponse = ApiResponse<SocmedDetailInterface>;

export type DeleteSocmedResponse = ApiResponse<number[]>



