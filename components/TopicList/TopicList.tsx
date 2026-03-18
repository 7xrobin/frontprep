'use client';

import { useState } from 'react';
import { TOPICS } from '@/lib/topics';
import { useAppStore } from '@/store/useAppStore';
import type { Technology } from '@/types';
import { useChat } from '@/hooks/useChat';
import { TopicItem } from './TopicItem';
import styles from './TopicList.module.css';

const TECHNOLOGIES: Technology[] = ['React', 'TypeScript', 'JavaScript', 'Next.js'];

const DOT_COLORS: Record<Technology, string> = {
  React: 'var(--dot-react)',
  TypeScript: 'var(--dot-typescript)',
  JavaScript: 'var(--dot-javascript)',
  'Next.js': 'var(--dot-nextjs)',
};

export function TopicList() {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Partial<Record<Technology, boolean>>>({});
  const { activeTopicId, setActiveTopic, resetSession } = useAppStore();
  const { sendMessage } = useChat();

  const filtered = search.trim()
    ? TOPICS.filter((t) =>
        t.label.toLowerCase().includes(search.toLowerCase()) ||
        t.technology.toLowerCase().includes(search.toLowerCase()),
      )
    : TOPICS;

  const handleSelectTopic = (topicId: string) => {
    if (topicId === activeTopicId) return;
    const topic = TOPICS.find((t) => t.id === topicId);
    if (!topic) return;
    resetSession();
    setActiveTopic(topicId);
    sendMessage(topic.seedQuestion);
  };

  const toggleGroup = (tech: Technology) => {
    setCollapsed((prev) => ({ ...prev, [tech]: !prev[tech] }));
  };

  const handleNewSession = () => {
    resetSession();
  };

  const hasResults = filtered.length > 0;

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>F</div>
          <span className={styles.logoText}>FrontPrep</span>
        </div>

        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search topics…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search topics"
          />
        </div>

        <button className={styles.newBtn} onClick={handleNewSession} title="Start a new session on the current topic">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New session
        </button>
      </div>

      <div className={styles.list} role="list">
        {!hasResults ? (
          <p className={styles.noResults}>No topics match "{search}"</p>
        ) : (
          TECHNOLOGIES.map((tech) => {
            const items = filtered.filter((t) => t.technology === tech);
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
          })
        )}
      </div>
    </aside>
  );
}
