import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { composeSystemPrompt } from '@/lib/prompts';
import type { AssistantStatus, Message } from '@/types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
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
        teachingTechniqueValue,
        personaValue,
        guardValue,
        customPersonaPrompt,
        addMessage,
        updateMessageById,
        setStreaming,
        addTokensUsed,
      } = useAppStore.getState();

      if (streaming || !userContent.trim()) return;

      const userMessage: Message = {
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

      const systemPrompt = composeSystemPrompt(
        techniqueValue,
        teachingTechniqueValue,
        personaValue,
        guardValue,
        customPersonaPrompt,
      );

      const apiMessages = [
        ...messages.filter((m) => m.role === 'user' || m.role === 'assistant'),
        userMessage,
      ].map(({ role, content }) => ({ role, content }));

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
          (systemPrompt.length + accumulated.length + userContent.length) / 4,
        );
        addTokensUsed(estimatedTokens);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred.';
        setAssistantStatus('error', `Assistant failed: ${errorMessage}`);
        console.error('[assistant-status] error', errorMessage);
      } finally {
        setStreaming(false);
      }
    },
    [],
  );

  return { sendMessage, isStreaming };
}
