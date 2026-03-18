import OpenAI from 'openai';
import type { AvailableModel } from '@/types';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function formatLabel(id: string): string {
  return id
    .split('-')
    .map((segment) => (segment.length === 1 ? segment.toUpperCase() : segment.charAt(0).toUpperCase() + segment.slice(1)))
    .join(' ')
    .replace(/Gpt/gi, 'GPT');
}

export async function GET(): Promise<Response> {
  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing OPENAI_API_KEY' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const response = await openai.models.list();
    const preferredPrefixes = ['gpt-4', 'gpt-3.5'];

    const normalized = response.data
      .map((model) => model.id)
      .filter((id) => preferredPrefixes.some((prefix) => id.startsWith(prefix)))
      .sort((a, b) => a.localeCompare(b));

    const fallback: AvailableModel[] = [
      { id: 'gpt-4o', label: 'GPT-4o' },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    ];

    const models: AvailableModel[] = normalized.length
      ? normalized.map((id) => ({ id, label: formatLabel(id) }))
      : fallback;

    return new Response(JSON.stringify({ models }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch models';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
