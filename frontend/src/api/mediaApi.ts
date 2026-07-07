import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';

export interface UploadResponse {
  fileName: string;
  url: string;
  contentType: string;
  size: number;
}

export const uploadCover = (file: File): Promise<ApiResponse<UploadResponse>> => {
  const formData = new FormData();
  formData.append('file', file);
  return axiosClient.post('/api/media/upload/cover', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const uploadAvatar = (file: File): Promise<ApiResponse<UploadResponse>> => {
  const formData = new FormData();
  formData.append('file', file);
  return axiosClient.post('/api/media/upload/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
