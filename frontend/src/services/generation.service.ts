import api from './api';
import { GenerationCreateRequest, GenerationStatusResponse } from '../types/generation.types';

export const generationService = {
  async triggerGeneration(data: GenerationCreateRequest): Promise<GenerationStatusResponse> {
    const response = await api.post<GenerationStatusResponse>('/generate', data);
    return response.data;
  },

  async getGenerationStatus(id: string): Promise<GenerationStatusResponse> {
    const response = await api.get<GenerationStatusResponse>(`/generate/${id}/status`);
    return response.data;
  },
};
