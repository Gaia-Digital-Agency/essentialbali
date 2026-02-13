export type UserLevelProps = "super_admin" | "admin_country" | "admin_city"

// Base response wrapper
export interface ApiResponse<T> {
  status: string;
  status_code: number;
  data: T;
}

// Struktur data user
export interface User {
  id: number;
  name: string;
  initial?: string;
  email: string;
  password?: string; // sudah di-hash
  isActive?: boolean;
  lastLoginAt?: string | null;
  loginAttempts?: number;
  lockedUntil?: string | null;
  token?: string | null;
  id_country: number;
  id_city?: number;
  id_region?: number;
  name_country?: string;
  name_city?: string;
  user_level: UserLevelProps
  createdAt?: string;
  updatedAt?: string;
}

// Response GET /users
export type GetUsersResponse = ApiResponse<User[]>;

// Payload register
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  id_country: number;
  id_city: number;
  user_level: "super_admin" | "admin_country" | string;
  timezone: string;
}

// Response register
export type RegisterResponse = ApiResponse<User>;

// Payload change password
export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
}

export type DeleteProfilePictureResponse = ApiResponse<string>;

// Response change password
export type ChangePasswordResponse = ApiResponse<string>;

// Payload Update User Info

export interface UpdateUserInfoPayload {
  name: string;
  email: string;
  profile_picture?: File
}

export type UpdateUserInfoResponse = ApiResponse<string>;

export interface JWTPayload {
  user_id: number;
  name: string;
  email: string;
  id_country: number;
  id_city: number;
  exp: number;
  iat: number;
}
