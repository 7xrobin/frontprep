'use client';

import { useEffect, useState } from 'react';
import { TOPICS } from '@/lib/topics';
import { useAppStore } from '@/store/useAppStore';
import type { ConversationHistoryRecord, Technology } from '@/types';
import { TopicItem } from './TopicItem';
import styles from './TopicList.module.css';

const TECHNOLOGIES: Technology[] = ['React', 'TypeScript', 'JavaScript', 'Next.js'];

const DOT_COLORS: Record<Technology, string> = {
  React: 'var(--dot-react)',
  TypeScript: 'var(--dot-typescript)',
  JavaScript: 'var(--dot-javascript)',
  'Next.js': 'var(--dot-nextjs)',
};

const generateMessageId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export function TopicList() {
  const [collapsed, setCollapsed] = useState<Partial<Record<Technology, boolean>>>({});
  const [viewMode, setViewMode] = useState<'topics' | 'history'>('topics');
  const [historyLoadingId, setHistoryLoadingId] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const {
    activeTopicId,
    setActiveTopic,
    resetSession,
    addMessage,
    loadConversation,
    historySummaries,
    historyStatus,
    fetchHistorySummaries,
  } = useAppStore();
  const isHistoryView = viewMode === 'history';

  useEffect(() => {
    if (isHistoryView && historyStatus === 'idle') {
      fetchHistorySummaries();
    }
  }, [isHistoryView, historyStatus, fetchHistorySummaries]);

  const handleSelectTopic = (topicId: string) => {
    if (topicId === activeTopicId) return;
    const topic = TOPICS.find((t) => t.id === topicId);
    if (!topic) return;
    resetSession();
    setActiveTopic(topicId);
    addMessage({
      id: generateMessageId(),
      role: 'assistant',
      content: topic.seedQuestion,
      timestamp: Date.now(),
    });
  };

  const toggleGroup = (tech: Technology) => {
    setCollapsed((prev) => ({ ...prev, [tech]: !prev[tech] }));
  };

  const toggleHistoryView = () => {
    if (isHistoryView) {
      setViewMode('topics');
      setHistoryError(null);
      return;
    }
    setViewMode('history');
  };

  const retryHistoryFetch = () => {
    setHistoryError(null);
    fetchHistorySummaries();
  };

  const formatTimestamp = (value: number): string => {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(value);
  };

  const openHistoryConversation = async (historyId: string) => {
    setHistoryError(null);
    setHistoryLoadingId(historyId);
    try {
      const response = await fetch(`/api/history?id=${historyId}`);
      if (!response.ok) {
        throw new Error(`Failed to load history: ${response.status}`);
      }
      const data = (await response.json()) as { record?: ConversationHistoryRecord };
      if (data.record) {
        loadConversation(data.record);
        setViewMode('topics');
      } else {
        throw new Error('History record missing');
      }
    } catch (error) {
      console.error('[history] load failed', error);
      setHistoryError('Could not open that conversation. Please try again.');
    } finally {
      setHistoryLoadingId(null);
    }
  };

  const renderHistoryList = () => {
    if (historyStatus === 'loading' && historySummaries.length === 0) {
      return <p className={styles.historyState}>Loading conversations…</p>;
    }

    if (historyStatus === 'error') {
      return (
        <div className={styles.historyState}>
          <p>Unable to load history.</p>
          <button className={styles.retryBtn} onClick={retryHistoryFetch}>
            Try again
          </button>
        </div>
      );
    }

    if (historySummaries.length === 0) {
      return <p className={styles.historyState}>No saved conversations yet.</p>;
    }

    return (
      <ul className={styles.historyList} role="list">
        {historySummaries.map((summary) => {
          const topic = summary.topicId ? TOPICS.find((t) => t.id === summary.topicId) : null;
          const isLoading = historyLoadingId === summary.id;
          return (
            <li key={summary.id}>
              <button
                className={styles.historyItem}
                onClick={() => openHistoryConversation(summary.id)}
                disabled={isLoading}
              >
                <div className={styles.historyTitleRow}>
                  <span className={styles.historyTitle}>{summary.title}</span>
                  <span className={styles.historyMeta}>{formatTimestamp(summary.updatedAt)}</span>
                </div>
                {topic && (
                  <span className={styles.historyTopicBadge}>
                    {topic.technology} · {topic.difficulty}
                  </span>
                )}
                <p className={styles.historyPreview}>
                  {isLoading ? 'Opening conversation…' : summary.preview}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    );
  };

  const renderTopicGroups = () => (
    <div role="list">
      {TECHNOLOGIES.map((tech) => {
        const items = TOPICS.filter((t) => t.technology === tech);
        if (items.length === 0) return null;
        const isOpen = !collapsed[tech];

        return (
          <div key={tech} className={styles.group}>
            <div
              role="button"
              tabIndex={0}
              className={styles.groupHeader}
              onClick={() => toggleGroup(tech)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleGroup(tech);
                }
              }}
              aria-expanded={isOpen}
            >
              <span
                className={styles.dot}
                style={{ background: DOT_COLORS[tech] }}
                aria-hidden="true"
              />
              {tech}
              <svg
                className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>

            {isOpen &&
              items.map((topic) => (
                <TopicItem
                  key={topic.id}
                  topic={topic}
                  isActive={topic.id === activeTopicId}
                  onClick={handleSelectTopic}
                />
              ))}
          </div>
        );
      })}
    </div>
  );

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>F</div>
          <span className={styles.logoText}>FrontPrep</span>
          <button
            className={`${styles.historyBtn} ${isHistoryView ? styles.historyBtnActive : ''}`}
            onClick={toggleHistoryView}
            aria-pressed={isHistoryView}
          >
            {isHistoryView ? 'Back to topics' : 'History'}
          </button>
        </div>
        <p className={styles.headerHint}>
          {isHistoryView
            ? 'Open a previous conversation from your device.'
            : 'Pick any topic to generate an interview-style prompt.'}
        </p>
        {historyError && <p className={styles.historyError}>{historyError}</p>}
      </div>

      <div className={styles.list} role="region" aria-live="polite">
        {isHistoryView ? renderHistoryList() : renderTopicGroups()}
      </div>
    </aside>
  );
}
