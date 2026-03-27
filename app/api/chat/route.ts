import OpenAI from 'openai';
import type { ChatRequestBody } from '@/types';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const encoder = new TextEncoder();

type DeltaPart = string | { text?: string; content?: string } | null | undefined;
type DeltaContent = string | DeltaPart[];

function normalizeDelta(delta: DeltaContent | null | undefined): string {
  if (!delta) return '';
  if (typeof delta === 'string') {
    return delta;
  }

  if (Array.isArray(delta)) {
    return delta
      .map((part: DeltaPart) => {
        if (!part) return '';
        if (typeof part === 'string') return part;
        if (typeof part.text === 'string') {
          return part.text;
        }
        if (typeof part.content === 'string') {
          return part.content;
        }
        return '';
      })
      .join('');
  }

  return '';
}

export async function POST(req: Request): Promise<Response> {
  if (!process.env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'Missing OPENAI_API_KEY' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = (await req.json()) as ChatRequestBody;
  const { messages, modelConfig, systemPrompt, assistantPreface } = body;
  const { model, temperature, maxTokens, topP, frequencyPenalty } = modelConfig;

  console.log('[assistant-status][server] sent', {
    messagesCount: messages.length,
    model,
  });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const completion = await openai.chat.completions.create({
          model,
          temperature,
          max_tokens: maxTokens,
          top_p: topP,
          frequency_penalty: frequencyPenalty,
          stream: true,
          messages: [
            { role: 'system', content: systemPrompt },
            ...(assistantPreface
              ? [{ role: 'assistant', content: assistantPreface }]
              : []),
            ...messages.map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })),
          ],
        });

        console.log('[assistant-status][server] processing', { model });

        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta?.content;
          const textChunk = normalizeDelta(delta);
          if (textChunk) {
            controller.enqueue(encoder.encode(textChunk));
          }
        }

        controller.close();
        console.log('[assistant-status][server] loading');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown error';
        console.error('[assistant-status][server] error', message);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
