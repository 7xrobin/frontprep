import { promises as fs } from 'fs';
import path from 'path';
import { TOPICS } from '@/lib/topics';
import type {
  ConversationHistoryRecord,
  ConversationSummary,
  Message,
} from '@/types';

const HISTORY_DIR = path.join(process.cwd(), 'data/history');
const HISTORY_FILE = path.join(HISTORY_DIR, 'history.json');

async function ensureHistoryFile() {
  await fs.mkdir(HISTORY_DIR, { recursive: true });
  try {
    await fs.access(HISTORY_FILE);
  } catch {
    await fs.writeFile(HISTORY_FILE, '[]', 'utf-8');
  }
}

function truncate(text: string, max = 120): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

function topicTitle(topicId: string | null): string | null {
  if (!topicId) return null;
  const topic = TOPICS.find((t) => t.id === topicId);
  return topic?.label ?? null;
}

function firstMessageByRole(messages: Message[], role: Message['role']): Message | undefined {
  return messages.find((msg) => msg.role === role);
}

export function buildConversationTitle(topicId: string | null, messages: Message[]): string {
  const topicLabel = topicTitle(topicId);
  if (topicLabel) return topicLabel;
  const firstUser = firstMessageByRole(messages, 'user');
  if (firstUser) {
    return truncate(firstUser.content.trim(), 60) || 'Untitled conversation';
  }
  return 'Untitled conversation';
}

export function buildConversationPreview(messages: Message[]): string {
  const firstAssistant = firstMessageByRole(messages, 'assistant');
  if (firstAssistant) return truncate(firstAssistant.content.trim(), 120);
  const firstUser = firstMessageByRole(messages, 'user');
  if (firstUser) return truncate(firstUser.content.trim(), 120);
  return 'No messages yet.';
}

export async function readHistoryRecords(): Promise<ConversationHistoryRecord[]> {
  await ensureHistoryFile();
  const raw = await fs.readFile(HISTORY_FILE, 'utf-8');
  try {
    const data = JSON.parse(raw) as ConversationHistoryRecord[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function writeHistoryRecords(records: ConversationHistoryRecord[]): Promise<void> {
  await ensureHistoryFile();
  await fs.writeFile(HISTORY_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

export function toConversationSummary(record: ConversationHistoryRecord): ConversationSummary {
  return {
    id: record.id,
    title: record.title,
    topicId: record.topicId,
    updatedAt: record.updatedAt,
    preview: buildConversationPreview(record.messages),
  };
}

export { HISTORY_DIR, HISTORY_FILE };
