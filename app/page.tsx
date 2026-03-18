import { TopicList } from '@/components/TopicList/TopicList';
import { ChatInterface } from '@/components/Chat/ChatInterface';
import { SettingsPanel } from '@/components/Settings/SettingsPanel';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.shell}>
      <TopicList />
      <ChatInterface />
      <SettingsPanel />
    </div>
  );
}
