export interface Intent {
  type: string;
  goal: string;
  domain: string;
  targetAudience?: string;
}

export interface ContentPlanItem {
  type: 'image' | 'video' | 'logo' | 'caption' | 'hashtags' | 'text' | 'audio' | string;
  required: boolean;
  reason: string;
}

export interface GeneratedPrompts {
  image?: string | null;
  video?: string | null;
  logo?: string | null;
}

export interface TextContent {
  caption?: string | null;
  hashtags?: string[];
  bodyText?: string | null;
}

export interface GenerateRequest {
  prompt: string;
  projectId?: string | null;
  inputImagePath?: string | null;
}

export interface GenerateResponse {
  id: string;
  projectId?: string | null;
  userId?: string | null;
  originalPrompt: string;
  inputImagePath?: string | null;
  success: boolean;
  status: 'pending' | 'analyzing' | 'planning' | 'generating_prompts' | 'generating_text' | 'completed' | 'failed';
  intent: Intent;
  contentPlan: ContentPlanItem[];
  generatedPrompts: GeneratedPrompts;
  textContent: TextContent;
  model: string;
  provider: string;
  createdAt: string;
  completedAt: string;
}

export interface AIHealthStatus {
  ollama: boolean;
  model: string;
  status: 'available' | 'model_missing' | 'unavailable';
  available_models?: string[];
  message: string;
}
