import api from './api';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/auth.types';

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.access_token) {
      localStorage.setItem('promptflow_token', response.data.access_token);
    }
    return response.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.data.access_token) {
      localStorage.setItem('promptflow_token', response.data.access_token);
    }
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  logout(): void {
    localStorage.removeItem('promptflow_token');
  },
};
