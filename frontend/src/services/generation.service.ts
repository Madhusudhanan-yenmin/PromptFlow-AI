import api from './api';
import { GenerateRequest, GenerateResponse, AIHealthStatus } from '../types/generation.types';

export const generationService = {
  async generateContent(data: GenerateRequest): Promise<GenerateResponse> {
    const response = await api.post<GenerateResponse>('/generate', data);
    return response.data;
  },

  async getGeneration(id: string): Promise<GenerateResponse> {
    const response = await api.get<GenerateResponse>(`/generate/${id}`);
    return response.data;
  },

  async checkAIHealth(): Promise<AIHealthStatus> {
    const response = await api.get<AIHealthStatus>('/ai/health');
    return response.data;
  },
};
