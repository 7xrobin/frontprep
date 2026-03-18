'use client';

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useChat } from '@/hooks/useChat';
import { TOPICS } from '@/lib/topics';
import type { Technology } from '@/types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';
import styles from './ChatInterface.module.css';

const DOT_COLORS: Record<Technology, string> = {
  React: 'var(--dot-react)',
  TypeScript: 'var(--dot-typescript)',
  JavaScript: 'var(--dot-javascript)',
  'Next.js': 'var(--dot-nextjs)',
};

export function ChatInterface() {
  const { messages, activeTopicId, isStreaming } = useAppStore();
  const lastMsg = messages[messages.length - 1];
  const showTypingIndicator = isStreaming && lastMsg?.role === 'assistant' && lastMsg.content === '';
  const { sendMessage } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeTopic = activeTopicId
    ? TOPICS.find((t) => t.id === activeTopicId)
    : null;

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const visibleMessages = messages.filter((m) => m.role !== 'system');

  return (
    <main className={styles.panel}>
      <div className={styles.header}>
        {activeTopic ? (
          <div className={styles.topicBadge}>
            <span
              className={styles.techDot}
              style={{ background: DOT_COLORS[activeTopic.technology] }}
              aria-hidden="true"
            />
            <span className={styles.topicLabel}>{activeTopic.label}</span>
            <span className={styles.topicMeta}>
              · {activeTopic.technology} · {activeTopic.difficulty}
            </span>
          </div>
        ) : (
          <span className={styles.emptyHeader}>Select a topic to start</span>
        )}
      </div>

      <div className={styles.messages} role="log" aria-live="polite" aria-label="Chat messages">
        {visibleMessages.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💬</div>
            <p className={styles.emptyTitle}>Choose a topic to begin</p>
            <p className={styles.emptySubtitle}>
              Select a topic from the left panel to start an interview coaching
              session. Your coach will ask you a question to get things going.
            </p>
          </div>
        ) : (
          visibleMessages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={
                isStreaming && i === visibleMessages.length - 1 && msg.role === 'assistant'
              }
            />
          ))
        )}

        {showTypingIndicator && <TypingIndicator />}

        <div ref={scrollRef} className={styles.scrollAnchor} aria-hidden="true" />
      </div>

      <ChatInput onSend={sendMessage} disabled={isStreaming || !activeTopicId} />
    </main>
  );
}
