import axiosClient from './axiosClient';
import { ApiResponse, PageResponse } from '../types/api';
import { ReadingHistoryRequest, ReadingHistoryResponse } from '../types/readingHistory';

export const saveHistory = (data: ReadingHistoryRequest): Promise<ApiResponse<void>> => {
  return axiosClient.post('/api/reading-history', data);
};

export const getStoryHistory = (storyId: number): Promise<ApiResponse<ReadingHistoryResponse>> => {
  return axiosClient.get(`/api/reading-history/me/${storyId}`);
};

export const getUserHistory = (page: number = 0, size: number = 12): Promise<ApiResponse<PageResponse<ReadingHistoryResponse>>> => {
  return axiosClient.get(`/api/reading-history/me?page=${page}&size=${size}`);
};
