import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { Category } from '../types/category';

export const createCategory = (data: any): Promise<ApiResponse<Category>> => {
  return axiosClient.post('/api/admin/categories', data);
};

export const updateCategory = (id: number, data: any): Promise<ApiResponse<Category>> => {
  return axiosClient.put(`/api/admin/categories/${id}`, data);
};

export const deleteCategory = (id: number): Promise<ApiResponse<void>> => {
  return axiosClient.delete(`/api/admin/categories/${id}`);
};
