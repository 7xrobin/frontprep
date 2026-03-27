export type Technology = 'React' | 'TypeScript' | 'JavaScript' | 'Next.js';

export type Difficulty = 'junior' | 'mid' | 'senior';

export type MessageRole = 'user' | 'assistant' | 'system' | 'status';

export type AssistantStatus = 'sent' | 'processing' | 'loading' | 'error';

export interface Topic {
  id: string;
  label: string;
  technology: Technology;
  difficulty: Difficulty;
  seedQuestion: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  status?: AssistantStatus;
}

export interface PromptOption {
  value: string;
  label: string;
  description: string;
  systemPrompt: string;
}

export type ModelId = string;

export interface AvailableModel {
  id: ModelId;
  label: string;
}

export type ModelsStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ModelConfig {
  model: ModelId;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
}

export interface ChatRequestBody {
  messages: Pick<Message, 'role' | 'content'>[];
  modelConfig: ModelConfig;
  systemPrompt: string;
  assistantPreface: string;
}

export interface SessionStats {
  messageCount: number;
  topicsVisited: number;
  totalTokensUsed: number;
}
