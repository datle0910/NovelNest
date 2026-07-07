import axiosClient from './axiosClient';
import { ApiResponse, PageResponse } from '../types/api';
import { FavoriteStatusResponse } from '../types/favorite';
import { StorySummary } from '../types/story';

export const toggleFavorite = (storyId: number): Promise<ApiResponse<FavoriteStatusResponse>> => {
  return axiosClient.post(`/api/favorites/${storyId}`);
};

export const getFavoriteStatus = (storyId: number): Promise<ApiResponse<FavoriteStatusResponse>> => {
  return axiosClient.get(`/api/favorites/me/${storyId}`);
};

export const getUserFavorites = (page: number = 0, size: number = 12): Promise<ApiResponse<PageResponse<StorySummary>>> => {
  return axiosClient.get(`/api/favorites/me?page=${page}&size=${size}`);
};
