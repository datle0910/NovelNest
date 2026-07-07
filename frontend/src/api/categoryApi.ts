import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { Category } from '../types/category';

export const getCategories = (): Promise<ApiResponse<Category[]>> => {
  return axiosClient.get('/api/categories');
};
