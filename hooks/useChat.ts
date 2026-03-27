import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { composePromptLayers } from '@/lib/prompts';
import type {
  AssistantStatus,
  ChatRequestMessage,
  ChatRequestMessageRole,
  ConversationSummary,
  Message,
} from '@/types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function persistConversationHistory() {
  const {
    currentConversationId,
    activeTopicId,
    messages,
    upsertHistorySummary,
  } = useAppStore.getState();

  const meaningfulMessages = messages.filter((msg) => msg.role !== 'status');
  if (!currentConversationId || meaningfulMessages.length === 0) {
    return;
  }

  try {
    const response = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: currentConversationId,
        topicId: activeTopicId ?? null,
        messages: meaningfulMessages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to store history: ${response.status}`);
    }

    const data = (await response.json()) as { summary?: ConversationSummary };
    if (data.summary) {
      upsertHistorySummary(data.summary);
    }
  } catch (error) {
    console.error('[history] persist failed', error);
  }
}

export function useChat() {
  const isStreaming = useAppStore((state) => state.isStreaming);

  const sendMessage = useCallback(
    async (userContent: string) => {
      const {
        isStreaming: streaming,
        messages,
        model,
        temperature,
        maxTokens,
        topP,
        frequencyPenalty,
        techniqueValue,
        personaValue,
        guardValue,
        addMessage,
        updateMessageById,
        setStreaming,
        addTokensUsed,
      } = useAppStore.getState();

      if (streaming || !userContent.trim()) return;

      const userMessage: Message & { role: ChatRequestMessageRole } = {
        id: generateId(),
        role: 'user',
        content: userContent.trim(),
        timestamp: Date.now(),
      };
      addMessage(userMessage);

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        status: 'sent',
      };
      addMessage(assistantMessage);

      const setAssistantStatus = (status: AssistantStatus, content: string) => {
        updateMessageById(assistantMessage.id, (msg) => ({
          ...msg,
          content,
          status,
          timestamp: Date.now(),
        }));
        console.log(`[assistant-status] ${status}`);
      };

      const setAssistantContent = (content: string) => {
        updateMessageById(assistantMessage.id, (msg) => ({
          ...msg,
          content,
          status: undefined,
          timestamp: Date.now(),
        }));
      };

      setAssistantStatus('sent', 'Request sent to assistant.');
      setStreaming(true);
      setAssistantStatus('processing', 'Assistant is processing your request…');

      const { systemPrompt, assistantPreface } = composePromptLayers(
        techniqueValue,
        personaValue,
        guardValue,
      );

      const isChatRequestMessage = (
        msg: Message,
      ): msg is Message & { role: ChatRequestMessageRole } =>
        msg.role === 'user' || msg.role === 'assistant';

      const toChatRequestMessage = ({
        role,
        content,
      }: Message & { role: ChatRequestMessageRole }): ChatRequestMessage => ({ role, content });

      const existingChatMessages = messages.filter(isChatRequestMessage);
      const apiMessages: ChatRequestMessage[] = [
        ...existingChatMessages.map(toChatRequestMessage),
        toChatRequestMessage(userMessage),
      ];

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            modelConfig: {
              model,
              temperature,
              maxTokens,
              topP,
              frequencyPenalty,
            },
            systemPrompt,
            assistantPreface,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        setAssistantStatus('loading', 'Assistant is responding…');

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let accumulated = '';
        let receivedFirstChunk = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;
          if (!receivedFirstChunk) {
            receivedFirstChunk = true;
          }
          setAssistantContent(accumulated);
        }

        const estimatedTokens = Math.ceil(
          (
            systemPrompt.length +
            assistantPreface.length +
            accumulated.length +
            userContent.length
          ) /
            4,
        );
        addTokensUsed(estimatedTokens);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred.';
        setAssistantStatus('error', `Assistant failed: ${errorMessage}`);
        console.error('[assistant-status] error', errorMessage);
      } finally {
        setStreaming(false);
        await persistConversationHistory();
      }
    },
    [],
  );

  return { sendMessage, isStreaming };
}
