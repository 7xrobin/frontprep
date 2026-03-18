'use client';

import type { Topic } from '@/types';
import styles from './TopicItem.module.css';

interface TopicItemProps {
  topic: Topic;
  isActive: boolean;
  onClick: (topicId: string) => void;
}

export function TopicItem({ topic, isActive, onClick }: TopicItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={`${styles.item} ${isActive ? styles.active : ''}`}
      onClick={() => onClick(topic.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(topic.id);
        }
      }}
      aria-pressed={isActive}
      title={topic.seedQuestion}
    >
      <span className={styles.label}>{topic.label}</span>
      <span className={`${styles.badge} ${styles[topic.difficulty]}`}>
        {topic.difficulty}
      </span>
    </div>
  );
}
