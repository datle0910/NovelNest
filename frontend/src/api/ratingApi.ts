import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { RatingRequest, RatingSummaryResponse } from '../types/rating';

export const getRatingSummary = (storyId: number): Promise<ApiResponse<RatingSummaryResponse>> => {
  return axiosClient.get(`/api/stories/${storyId}/ratings/summary`);
};

export const submitRating = (storyId: number, data: RatingRequest): Promise<ApiResponse<void>> => {
  return axiosClient.post(`/api/stories/${storyId}/ratings`, data);
};

export const deleteMyRating = (storyId: number): Promise<ApiResponse<void>> => {
  return axiosClient.delete(`/api/stories/${storyId}/ratings/me`);
};
