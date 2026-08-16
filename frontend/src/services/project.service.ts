import api from './api';
import { Project, ProjectCreateRequest } from '../types/project.types';

export const projectService = {
  async createProject(data: ProjectCreateRequest): Promise<Project> {
    const response = await api.post<Project>('/projects', data);
    return response.data;
  },

  async getProjects(): Promise<Project[]> {
    const response = await api.get<Project[]>('/projects');
    return response.data;
  },

  async getProjectById(id: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${id}`);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  async uploadImage(file: File, projectId?: string): Promise<{ url: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (projectId) {
      formData.append('projectId', projectId);
    }
    const response = await api.post('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
