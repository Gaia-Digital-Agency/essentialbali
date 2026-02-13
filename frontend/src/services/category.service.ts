import apiClient from "../api";
// import { ApiResponse } from "../types/auth.type";
import {
  categoryService,
  createCategoryResponse,
  getAllCategoryResponse,
  getCategoryByIDResponse,
  getCategoryDescByLocationResponse,
} from "../types/category.type";

type GetCategoryWithFieldsProps = {
  id_country?: number | undefined;
  id_city?: number | undefined;
  id_region?: number | undefined;
};


export const createCategory = async (
  category: categoryService
): Promise<createCategoryResponse> => {
  try {
    const response = await apiClient.post<createCategoryResponse>(
      "/category",
      category
    );
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error;
  }
};

export const getCategoryWithFields = async (
  cat: number,
  props: GetCategoryWithFieldsProps
) => {
  try {
    // const filtered = Object.fromEntries(
    //   Object.entries(props).filter(([_, v]) => v !== undefined)
    // );
    const filtered = Object.entries(props).filter(prop => prop[1]).join('&').replaceAll(',','=')
    const params = new URLSearchParams(filtered).toString();
    const response = await apiClient.get<getCategoryByIDResponse>(
      `/category/${cat}?${params}`
    );
    if (response.data) {
      return response.data.data;
    }
  } catch (e) {
    console.log(e);
  }
};

export const getAllCategory = async (): Promise<getAllCategoryResponse> => {
  try {
    const response = await apiClient.get<getAllCategoryResponse>("/category");

    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getCategoryByID = async (
  id: number
): Promise<getCategoryByIDResponse> => {
  try {
    const response = await apiClient.get<getCategoryByIDResponse>(
      `/category/${id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    throw error;
  }
};

export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/category/${id}`);
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

export const editCategory = async (
  id: number,
  category: categoryService
): Promise<void> => {
  try {
    await apiClient.put(`/category/${id}`, category);
  } catch (error) {
    console.error("Error editing category:", error);
    throw error;
  }
};

export const getCategoryDescByLocation = async (
  type: string,
  idLocation: number,
  idCategory: number
): Promise<getCategoryDescByLocationResponse> => {
  try {
    const response = await apiClient.get<getCategoryDescByLocationResponse>(
      `/category/location/${type}/${idLocation}/${idCategory}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    throw error;
  }
};
