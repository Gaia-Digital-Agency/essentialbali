export interface GetDataTimezoneResponse {
  id: number;
  timezone_name: string;
  utc_offset: string;
  description: string;
}

export interface ApiResponse<T> {
  status: string;
  status_code: number;
  data: T;
}

export type GetTimezoneResponse = ApiResponse<GetDataTimezoneResponse[]>;

