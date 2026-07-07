import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';

export const createChapter = (storyId: number, data: any): Promise<ApiResponse<any>> => {
  return axiosClient.post(`/api/admin/stories/${storyId}/chapters`, data);
};

export const updateChapter = (id: number, data: any): Promise<ApiResponse<any>> => {
  return axiosClient.put(`/api/admin/chapters/${id}`, data);
};

export const deleteChapter = (id: number): Promise<ApiResponse<void>> => {
  return axiosClient.delete(`/api/admin/chapters/${id}`);
};
