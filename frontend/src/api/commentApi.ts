import axiosClient from './axiosClient';
import { ApiResponse, PageResponse } from '../types/api';
import { CommentRequest, CommentResponse } from '../types/comment';

export const getStoryComments = (storyId: number, page: number = 0, size: number = 10): Promise<ApiResponse<PageResponse<CommentResponse>>> => {
  return axiosClient.get(`/api/stories/${storyId}/comments?page=${page}&size=${size}`);
};

export const getChapterComments = (chapterId: number, page: number = 0, size: number = 10): Promise<ApiResponse<PageResponse<CommentResponse>>> => {
  return axiosClient.get(`/api/chapters/${chapterId}/comments?page=${page}&size=${size}`);
};

export const createComment = (data: CommentRequest): Promise<ApiResponse<CommentResponse>> => {
  return axiosClient.post('/api/comments', data);
};

export const updateComment = (id: number, data: CommentRequest): Promise<ApiResponse<CommentResponse>> => {
  return axiosClient.put(`/api/comments/${id}`, data);
};

export const deleteComment = (id: number): Promise<ApiResponse<void>> => {
  return axiosClient.delete(`/api/comments/${id}`);
};
