import axiosClient from './axiosClient';
import { ApiResponse, PageResponse } from '../types/api';
import { StorySummary } from '../types/story';

export const getAdminStories = (page = 0, size = 10, sort = 'updatedAt,desc'): Promise<ApiResponse<PageResponse<StorySummary>>> => {
  return axiosClient.get(`/api/admin/stories?page=${page}&size=${size}&sort=${sort}`);
};

export const toggleStoryDisplay = (id: number, display: boolean): Promise<ApiResponse<void>> => {
  return axiosClient.patch(`/api/admin/stories/${id}/display?display=${display}`);
};

export const crawlStory = (data: any): Promise<ApiResponse<any>> => {
  return axiosClient.post('/api/admin/crawler/crawl', data);
};

export const getReports = (page = 0, size = 10, status = ''): Promise<ApiResponse<PageResponse<any>>> => {
  const statusParam = status ? `&status=${status}` : '';
  return axiosClient.get(`/api/admin/reports?page=${page}&size=${size}${statusParam}`);
};

export const updateReportStatus = (id: number, status: string): Promise<ApiResponse<void>> => {
  return axiosClient.patch(`/api/admin/reports/${id}/status?status=${status}`);
};

export const getPendingReports = (): Promise<ApiResponse<PageResponse<any>>> => {
  return axiosClient.get('/api/admin/reports?page=0&size=5&status=PENDING&sort=createdAt,desc');
};

export const createStory = (data: any): Promise<ApiResponse<any>> => {
  return axiosClient.post('/api/admin/stories', data);
};

export const updateStory = (id: number, data: any): Promise<ApiResponse<any>> => {
  return axiosClient.put(`/api/admin/stories/${id}`, data);
};

export const deleteStory = (id: number): Promise<ApiResponse<void>> => {
  return axiosClient.delete(`/api/admin/stories/${id}`);
};

export const generateStoryCover = (id: number): Promise<ApiResponse<any>> => {
  return axiosClient.post(`/api/admin/stories/${id}/generate-cover`);
};
