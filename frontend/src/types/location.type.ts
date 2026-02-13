import { ApiResponse } from "./auth.type";

export interface CreateLocationDto {
  id_parent?: number | undefined;
  name: string;
  slug: string;
  timezone?: string;
  site_logo?: number;
  flag_icon?: number;
}

export interface Location {
  id: number;
  name: string;
  slug: string;
  name_parent?: string;
  id_parent?: number;
  typeLoc?: string | undefined;
  site_logo?: string | null;
  flag_icon?: string | null;
  site_logo_id?: number | undefined;
  flag_icon_id?: number | undefined;
  timezone?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export type CreateLocationResponse = ApiResponse<Location>;

export type GetLocationsResponse = ApiResponse<Location[]>;

export type GetLocationByIDResponse = ApiResponse<Location>;

export type EditLocationResponse = ApiResponse<"">;
