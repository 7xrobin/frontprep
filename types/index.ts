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

export type ChatRequestMessageRole = 'user' | 'assistant';

export interface ChatRequestMessage {
  role: ChatRequestMessageRole;
  content: string;
}

export interface ConversationHistoryRecord {
  id: string;
  title: string;
  topicId: string | null;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface ConversationSummary {
  id: string;
  title: string;
  topicId: string | null;
  updatedAt: number;
  preview: string;
}

export interface HistoryUpsertRequest {
  id: string;
  topicId: string | null;
  messages: Message[];
}

export interface PromptOption {
  value: string;
  label: string;
  description: string;
  assistantPrompt: string;
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
  messages: ChatRequestMessage[];
  modelConfig: ModelConfig;
  systemPrompt: string;
  assistantPreface: string;
}

export interface JudgeRequestBody {
  userQuestion: string;
  assistantResponse: string;
  modelConfig?: Partial<ModelConfig>;
}

export interface JudgeResponseBody {
  evaluation: string;
}

export interface SessionStats {
  messageCount: number;
  topicsVisited: number;
  totalTokensUsed: number;
}
