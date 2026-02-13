import apiClient from "../api";
import {
  GetUsersResponse,
  RegisterPayload,
  RegisterResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  UpdateUserInfoPayload,
  UpdateUserInfoResponse,
  DeleteProfilePictureResponse,
} from "../types/auth.type";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LogoutCredentials {
  token: string;
}

export interface LoginResponse {
  data: {
    token: string;
  };
}

/**
 * 
 * response dari api logout : 
 * {
    "status": "OK",
    "status_code": 200,
    "data": "Logout Successfully"
}
 */

export interface LogoutResponse {
  status: string;
  status_code: number;
  data: string;
}

export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  try {
    // Kirim request POST ke endpoint /auth/login
    const response = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials
    );
    // const token = response.data.data.token;
    // // Simpan token ke localStorage agar sesi tidak hilang saat refresh
    // if (token) {
    //   localStorage.setItem("authToken", token);
    // }

    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const logout = async (
  token: LogoutCredentials
): Promise<LogoutResponse> => {
  // Hapus token saat logout
  try {
    const response = await apiClient.post<LogoutResponse>(
      "/auth/logout",
      token
    );
    // localStorage.removeItem("authToken");

    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const getAllUser = async (): Promise<GetUsersResponse> => {
  try {
    const response = await apiClient.get<GetUsersResponse>("/auth/admin/users");
    return response.data;
  } catch (error) {
    console.error("Error Get All User:", error);
    throw error;
  }
};

export const registerUser = async (
  payload: RegisterPayload
): Promise<RegisterResponse> => {
  try {
    const response = await apiClient.post<RegisterResponse>(
      "/auth/admin/register",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const updateUserStatus = async (
  id: number,
  data: { status: boolean }
): Promise<GetUsersResponse> => {
  try {
    const response = await apiClient.put<GetUsersResponse>(
      `/auth/admin/user/${id}/status`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const getUserByID = async (id: number): Promise<GetUsersResponse> => {
  try {
    const response = await apiClient.get<GetUsersResponse>(
      `/auth/admin/user/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

// /admin/change-password
export const changePassword = async (
  payload: ChangePasswordPayload
): Promise<ChangePasswordResponse> => {
  try {
    const response = await apiClient.patch<ChangePasswordResponse>(
      "/auth/admin/change-password",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const updateInfoUser = async (
  payload: UpdateUserInfoPayload
): Promise<UpdateUserInfoResponse> => {
  try {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("email", payload.email);

    if (payload.profile_picture) {
      formData.append("profile_picture", payload.profile_picture);
    }

    const response = await apiClient.put<UpdateUserInfoResponse>(
      "/auth/admin/user",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Update Info User Failed : ", error);
    throw error;
  }
};

export const getUserProfilePicture = async (): Promise<string> => {
  try {
    const response = await apiClient.get(`/auth/profile-picture`, {
      responseType: "blob",
    });

    const imageBlob = response.data as Blob;
    const imageUrl = URL.createObjectURL(imageBlob);

    return imageUrl;
  } catch {
    // No profile picture set - return empty string to use initial avatar fallback
    return "";
  }
};

export const getDataDetailUser = async (): Promise<GetUsersResponse | false> => {
  try {
    const response = await apiClient.get<GetUsersResponse>("/auth/admin/user");
    return response.data;
  } catch {
    return false;
  }
};

export const deleteProfilePicture =
  async (): Promise<DeleteProfilePictureResponse> => {
    try {
      const response = await apiClient.delete<DeleteProfilePictureResponse>(
        "/auth/profile-picture"
      );
      return response.data;
    } catch (error) {
      console.error("Delete Profile Picture Failed:", error);
      throw error;
    }
  };
