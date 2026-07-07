import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { Author } from '../types/author';

export const createAuthor = (data: any): Promise<ApiResponse<Author>> => {
  return axiosClient.post('/api/admin/authors', data);
};

export const updateAuthor = (id: number, data: any): Promise<ApiResponse<Author>> => {
  return axiosClient.put(`/api/admin/authors/${id}`, data);
};

export const deleteAuthor = (id: number): Promise<ApiResponse<void>> => {
  return axiosClient.delete(`/api/admin/authors/${id}`);
};
