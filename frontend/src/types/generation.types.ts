export interface Asset {
  id: string;
  projectId: string;
  userId?: string;
  type: 'image' | 'video' | 'audio' | 'text' | 'logo';
  fileName: string;
  filePath: string;
  mimeType?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

export interface Generation {
  id: string;
  projectId: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface GenerationCreateRequest {
  projectId: string;
  requestedTypes?: string[];
  options?: Record<string, any>;
}

export interface GenerationStatusResponse {
  generationId: string;
  projectId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
  types: string[];
  assets: Asset[];
  createdAt: string;
  updatedAt: string;
}
