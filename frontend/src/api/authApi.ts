import axiosClient from './axiosClient';
import { ApiResponse } from '../types/api';
import { User, LoginResponse } from '../types/auth';

export const login = (data: any): Promise<ApiResponse<LoginResponse>> => {
  return axiosClient.post('/api/auth/login', data);
};

export const register = (data: any): Promise<ApiResponse<void>> => {
  return axiosClient.post('/api/auth/register', data);
};

export const getCurrentUser = (): Promise<ApiResponse<User>> => {
  return axiosClient.get('/api/auth/me');
};

export const updateProfile = (data: { username: string; avatar?: string }): Promise<ApiResponse<User>> => {
  return axiosClient.put('/api/auth/profile', data);
};

export const changePassword = (data: any): Promise<ApiResponse<void>> => {
  return axiosClient.put('/api/auth/change-password', data);
};

export const refreshToken = (data: { refreshToken: string }): Promise<ApiResponse<any>> => {
  return axiosClient.post('/api/auth/refresh-token', data);
};

export const logoutApi = (data: { refreshToken: string }): Promise<ApiResponse<void>> => {
  return axiosClient.post('/api/auth/logout', data);
};

export const requestForgotPasswordOtp = (data: { email: string }): Promise<ApiResponse<void>> => {
  return axiosClient.post('/api/auth/forgot-password/request-otp', data);
};

export const verifyForgotPasswordOtp = (data: { email: string; otp: string }): Promise<ApiResponse<{ resetToken: string }>> => {
  return axiosClient.post('/api/auth/forgot-password/verify-otp', data);
};

export const resetForgotPassword = (data: any): Promise<ApiResponse<void>> => {
  return axiosClient.post('/api/auth/forgot-password/reset', data);
};
