import axiosClient from './axiosClient';
import { ApiResponse, PageResponse } from '../types/api';
import { StorySummary, StoryDetail } from '../types/story';
import { ChapterSummary, ChapterDetail } from '../types/chapter';

export const getStories = (page = 0, size = 12): Promise<ApiResponse<PageResponse<StorySummary>>> => {
  return axiosClient.get(`/api/stories?page=${page}&size=${size}&sort=updatedAt,desc`);
};

export const searchStories = (keyword: string, page = 0, size = 12): Promise<ApiResponse<PageResponse<StorySummary>>> => {
  return axiosClient.get(`/api/stories/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
};

export const getStoriesByCategory = (categorySlug: string, page = 0, size = 12): Promise<ApiResponse<PageResponse<StorySummary>>> => {
  return axiosClient.get(`/api/stories/category/${categorySlug}?page=${page}&size=${size}`);
};

export const getStoryDetail = (slug: string): Promise<ApiResponse<StoryDetail>> => {
  return axiosClient.get(`/api/stories/${slug}`);
};

export const getStoryChapters = (slug: string): Promise<ApiResponse<ChapterSummary[]>> => {
  return axiosClient.get(`/api/stories/${slug}/chapters`);
};

export const getChapterDetail = (slug: string, chapterNumber: number): Promise<ApiResponse<ChapterDetail>> => {
  return axiosClient.get(`/api/stories/${slug}/chapters/${chapterNumber}`);
};

export const reportChapter = (chapterId: number, reasons: string[], details: string): Promise<ApiResponse<void>> => {
  return axiosClient.post(`/api/chapters/${chapterId}/reports`, { reasons, details });
};

export const getTrendingWeekly = (size = 12): Promise<ApiResponse<PageResponse<StorySummary>>> => {
  return axiosClient.get(`/api/stories/trending/week?size=${size}`);
};

export const getTopTrending = (size = 6): Promise<ApiResponse<PageResponse<StorySummary>>> => {
  return axiosClient.get(`/api/stories/trending/top?size=${size}`);
};

export const getTopViewsMonthly = (size = 6): Promise<ApiResponse<PageResponse<StorySummary>>> => {
  return axiosClient.get(`/api/stories/trending/month?size=${size}`);
};

export const getAllStories = (page = 0, size = 18, sort = 'updatedAt,desc'): Promise<ApiResponse<PageResponse<StorySummary>>> => {
  return axiosClient.get(`/api/stories?page=${page}&size=${size}&sort=${sort}`);
};
