import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { Author } from '../types/author';

export const getAuthors = (): Promise<ApiResponse<Author[]>> => {
  return axiosClient.get('/api/authors');
};
