'use client';

import type { AssistantStatus, Message } from '@/types';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

const STATUS_LABELS: Record<AssistantStatus, string> = {
  sent: 'Request Sent',
  processing: 'Processing',
  loading: 'Responding',
  error: 'Error',
};

function formatTime(ts: number): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ts));
}

function getStatusLabel(status?: AssistantStatus): string {
  if (!status) return 'Status';
  return STATUS_LABELS[status];
}

function renderContent(content: string): React.ReactNode {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let codeBuffer: string[] = [];
  let inCode = false;
  let codeLang = '';
  let keyCounter = 0;

  const nextKey = () => `k-${keyCounter++}`;

  const flushCode = () => {
    if (codeBuffer.length > 0) {
      elements.push(
        <pre key={nextKey()}>
          <code>{codeBuffer.join('\n')}</code>
        </pre>,
      );
      codeBuffer = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeLang = line.slice(3).trim();
      } else {
        inCode = false;
        codeLang = '';
        flushCode();
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    if (line.trim() === '') {
      elements.push(<br key={nextKey()} />);
      continue;
    }

    const formatted = line
      .split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
      .map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={i}>{part.slice(1, -1)}</code>;
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

    elements.push(<p key={nextKey()}>{formatted}</p>);
  }

  if (inCode) flushCode();

  return <div className="prose">{elements}</div>;
}

export function MessageBubble({ message, isStreaming = false }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isStatus = message.role === 'status';
  const showStatusBadge = Boolean(message.status);
  const showCursor = isAssistant && isStreaming;
  const roleClass = styles[message.role as keyof typeof styles] ?? '';
  const rowClassName = [styles.row, isStatus ? styles.statusRow : roleClass]
    .filter(Boolean)
    .join(' ');
  const bubbleClassName = [
    styles.bubble,
    roleClass,
    showStatusBadge ? styles.bubbleStatus : '',
  ]
    .filter(Boolean)
    .join(' ');
  const timeClassName = [styles.time, isStatus ? styles.statusTime : '']
    .filter(Boolean)
    .join(' ');

  const badgeClassMap: Partial<Record<AssistantStatus, string>> = {
    sent: styles.badgeSent,
    processing: styles.badgeProcessing,
    loading: styles.badgeLoading,
    error: styles.badgeError,
  };
  const statusBadgeClass = [
    styles.statusBadge,
    message.status ? badgeClassMap[message.status] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rowClassName} role={isStatus ? 'status' : undefined} aria-live={isStatus ? 'polite' : undefined}>
      {!isStatus && (
        <div className={`${styles.avatar} ${roleClass}`} aria-hidden="true">
          {isUser ? 'U' : 'D'}
        </div>
      )}
      <div className={styles.bubbleWrapper}>
        <div className={bubbleClassName}>
          {showStatusBadge && (
            <div className={styles.statusHeading}>
              <span className={statusBadgeClass}>{getStatusLabel(message.status)}</span>
            </div>
          )}
          {renderContent(message.content)}
          {showCursor && <span className={styles.cursor} aria-hidden="true" />}
        </div>
        <div className={timeClassName}>{formatTime(message.timestamp)}</div>
      </div>
    </div>
  );
}
