export interface User {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}
