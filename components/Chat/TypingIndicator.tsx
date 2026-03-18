'use client';

import styles from './TypingIndicator.module.css';

export function TypingIndicator() {
  return (
    <div className={styles.wrapper} aria-live="polite" aria-label="Assistant is typing">
      <div className={styles.avatar} aria-hidden="true">D</div>
      <div className={styles.bubble}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
    </div>
  );
}
