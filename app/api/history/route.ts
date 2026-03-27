import { NextResponse } from 'next/server';
import {
  buildConversationTitle,
  readHistoryRecords,
  toConversationSummary,
  writeHistoryRecords,
} from '@/lib/history';
import type { ConversationHistoryRecord, HistoryUpsertRequest } from '@/types';

export const runtime = 'nodejs';

function normalizeMessages(payload: HistoryUpsertRequest['messages']): HistoryUpsertRequest['messages'] {
  if (!Array.isArray(payload)) return [];
  return payload.filter((msg) => typeof msg?.id === 'string' && typeof msg?.content === 'string');
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const requestedId = searchParams.get('id');
  const records = await readHistoryRecords();

  if (requestedId) {
    const record = records.find((r) => r.id === requestedId);
    if (!record) {
      return NextResponse.json({ error: 'History not found' }, { status: 404 });
    }
    return NextResponse.json({ record });
  }

  const summaries = records
    .slice()
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map(toConversationSummary);

  return NextResponse.json({ histories: summaries });
}

export async function POST(req: Request) {
  const body = (await req.json()) as HistoryUpsertRequest | null;

  if (!body || typeof body.id !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const normalizedMessages = normalizeMessages(body.messages);
  if (normalizedMessages.length === 0) {
    return NextResponse.json({ error: 'No messages to store' }, { status: 400 });
  }

  const now = Date.now();
  const records = await readHistoryRecords();
  const existingIndex = records.findIndex((record) => record.id === body.id);
  const title = buildConversationTitle(body.topicId ?? null, normalizedMessages);

  let record: ConversationHistoryRecord;

  if (existingIndex >= 0) {
    record = {
      ...records[existingIndex],
      title,
      topicId: body.topicId ?? null,
      messages: normalizedMessages,
      updatedAt: now,
    };
    records[existingIndex] = record;
  } else {
    record = {
      id: body.id,
      title,
      topicId: body.topicId ?? null,
      createdAt: now,
      updatedAt: now,
      messages: normalizedMessages,
    };
    records.push(record);
  }

  await writeHistoryRecords(records);

  return NextResponse.json({ record, summary: toConversationSummary(record) });
}
