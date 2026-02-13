import { ApiResponse } from "../types/api.type";

export interface SMTPProviderInterface {
  id: number;
  provider_name: string;
  host: string;
  port: number;
  secure: boolean;
}

export interface SMTPConfigInterface {
  id?: number;
  provider_name?: string | number;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password?: string;
  from_name: string;
  from_email: string;
  is_active?: boolean;
}

export type GetSMTPProviderResponse = ApiResponse<SMTPProviderInterface[]>;
export type GetSMTPProviderByIDResponse = ApiResponse<SMTPProviderInterface>;
export type GetSMTPConfigResponse = ApiResponse<SMTPConfigInterface>;
export type EntryDataSMTPConfig = ApiResponse<SMTPConfigInterface>;
