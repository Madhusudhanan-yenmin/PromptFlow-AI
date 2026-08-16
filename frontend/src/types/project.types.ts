export interface Project {
  id: string;
  userId: string;
  title: string;
  originalPrompt: string;
  inputImages: string[];
  intent?: string | null;
  contentPlan?: any[];
  status: 'draft' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCreateRequest {
  title: string;
  originalPrompt: string;
  inputImages?: string[];
}
