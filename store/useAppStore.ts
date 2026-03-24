import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AssistantStatus,
  AvailableModel,
  Message,
  ModelId,
  ModelsStatus,
} from '@/types';

const generateMessageId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface AppState {
  messages: Message[];
  activeTopicId: string | null;
  model: ModelId;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  techniqueValue: string;
  teachingTechniqueValue: string;
  personaValue: string;
  guardValue: string;
  customPersonaPrompt: string;
  isStreaming: boolean;
  totalTokensUsed: number;
  sessionTopicsVisited: string[];
  availableModels: AvailableModel[];
  modelsStatus: ModelsStatus;
}

interface AppActions {
  setActiveTopic: (topicId: string) => void;
  addMessage: (message: Message) => void;
  updateMessageById: (id: string, updater: (msg: Message) => Message) => void;
  setStreaming: (isStreaming: boolean) => void;
  updateSettings: (settings: Partial<Omit<AppState, 'messages' | 'isStreaming' | 'sessionTopicsVisited'>>) => void;
  addTokensUsed: (tokens: number) => void;
  resetSession: () => void;
  setAvailableModels: (models: AvailableModel[]) => void;
  setModelsStatus: (status: ModelsStatus) => void;
  upsertStatusMessage: (
    status: AssistantStatus | undefined,
    content: string,
    existingId?: string,
  ) => string;
}

type AppStore = AppState & AppActions;

const DEFAULT_STATE: AppState = {
  messages: [],
  activeTopicId: null,
  model: 'gpt-4o',
  temperature: 0.7,
  maxTokens: 1024,
  topP: 1,
  frequencyPenalty: 0,
  techniqueValue: 'socratic',
  teachingTechniqueValue: 'explanatory',
  personaValue: 'friendly-mentor',
  guardValue: 'standard',
  customPersonaPrompt: '',
  isStreaming: false,
  totalTokensUsed: 0,
  sessionTopicsVisited: [],
  availableModels: [],
  modelsStatus: 'idle',
};

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setActiveTopic: (topicId) =>
        set((state) => ({
          activeTopicId: topicId,
          sessionTopicsVisited: state.sessionTopicsVisited.includes(topicId)
            ? state.sessionTopicsVisited
            : [...state.sessionTopicsVisited, topicId],
        })),

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      updateMessageById: (id, updater) =>
        set((state) => ({
          messages: state.messages.map((msg) => (msg.id === id ? updater(msg) : msg)),
        })),

      setStreaming: (isStreaming) => set({ isStreaming }),

      updateSettings: (settings) => set(settings),

      addTokensUsed: (tokens) =>
        set((state) => ({ totalTokensUsed: state.totalTokensUsed + tokens })),

      resetSession: () =>
        set({
          messages: [],
          activeTopicId: null,
          isStreaming: false,
          totalTokensUsed: 0,
          sessionTopicsVisited: [],
        }),

      setAvailableModels: (models) => set({ availableModels: models }),

      setModelsStatus: (status) => set({ modelsStatus: status }),

      upsertStatusMessage: (status, content, existingId) => {
        const timestamp = Date.now();
        if (existingId) {
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === existingId
                ? { ...msg, content, status, timestamp }
                : msg,
            ),
          }));
          return existingId;
        }

        const id = generateMessageId();
        const statusMessage: Message = {
          id,
          role: 'status',
          content,
          timestamp,
          status,
        };
        set((state) => ({ messages: [...state.messages, statusMessage] }));
        return id;
      },
    }),
    {
      name: 'frontprep-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        model: state.model,
        temperature: state.temperature,
        maxTokens: state.maxTokens,
        topP: state.topP,
        frequencyPenalty: state.frequencyPenalty,
        techniqueValue: state.techniqueValue,
        teachingTechniqueValue: state.teachingTechniqueValue,
        personaValue: state.personaValue,
        guardValue: state.guardValue,
        customPersonaPrompt: state.customPersonaPrompt,
        messages: state.messages,
        activeTopicId: state.activeTopicId,
        totalTokensUsed: state.totalTokensUsed,
        sessionTopicsVisited: state.sessionTopicsVisited,
        availableModels: state.availableModels,
        modelsStatus: state.modelsStatus,
      }),
    },
  ),
);
