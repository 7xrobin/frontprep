import OpenAI from 'openai';
import type { JudgeRequestBody, JudgeResponseBody, ModelConfig } from '@/types';

export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEFAULT_MODEL_CONFIG: ModelConfig = {
  model: 'gpt-4o-mini',
  temperature: 0,
  maxTokens: 512,
  topP: 1,
  frequencyPenalty: 0,
};

const JUDGE_SYSTEM_PROMPT = `You are an impartial evaluator assessing how well a frontend interview assistant responded to a candidate's answer.
You will be given the original user response (the candidate) and the assistant interviewer's reply.
Score the assistant's reply on how effectively it guides, critiques, and motivates the candidate. For each dimension, return
a score plus a one-sentence justification.

RELEVANCE (1-5)
1 = Completely off-topic or ignores the question
3 = Addresses the question but misses key aspects
5 = Directly addresses the candidate's answer and keeps the conversation on the chosen topic

ACTIONABILITY (1-5)
1 = Vague platitudes with no concrete steps
3 = Some useful suggestions but lacks specificity
5 = Provides concrete, immediately usable guidance the candidate can apply

COMPLETENESS (1-5)
1 = Covers only one narrow angle
3 = Covers some important aspects but has notable gaps
5 = Fully critiques the answer, touching on accuracy, depth, and missing pieces

TONE (1-5)
1 = Dismissive, condescending, or inappropriately casual
3 = Neutral but not particularly encouraging or engaging
5 = Professional, motivating, and aligned with a constructive interviewer persona

Respond in this exact format:
RELEVANCE: <score> | <justification>
ACTIONABILITY: <score> | <justification>
COMPLETENESS: <score> | <justification>
TONE: <score> | <justification>
OVERALL: <average of four scores, rounded to one decimal>`;

function buildEvaluationPrompt(question: string, answer: string): string {
  return [
    'User question:',
    '"""',
    question.trim(),
    '"""',
    '',
    'Assistant response:',
    '"""',
    answer.trim(),
    '"""',
  ].join('\n');
}

function mergeModelConfig(override?: Partial<ModelConfig>): ModelConfig {
  if (!override) {
    return DEFAULT_MODEL_CONFIG;
  }

  return {
    ...DEFAULT_MODEL_CONFIG,
    ...override,
    model: override.model ?? DEFAULT_MODEL_CONFIG.model,
    temperature: override.temperature ?? DEFAULT_MODEL_CONFIG.temperature,
    maxTokens: override.maxTokens ?? DEFAULT_MODEL_CONFIG.maxTokens,
    topP: override.topP ?? DEFAULT_MODEL_CONFIG.topP,
    frequencyPenalty: override.frequencyPenalty ?? DEFAULT_MODEL_CONFIG.frequencyPenalty,
  };
}

function normalizeMessageContent(content: string | null | (string | { text?: string | null })[] | undefined): string {
  if (!content) return '';
  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (!part) return '';
        if (typeof part === 'string') return part;
        return part.text ?? '';
      })
      .join('')
      .trim();
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

  let body: JudgeRequestBody | null = null;
  try {
    body = (await req.json()) as JudgeRequestBody;
  } catch (error) {
    console.error('[judge] invalid json payload', error);
    return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const userQuestion = body?.userQuestion?.trim();
  const assistantResponse = body?.assistantResponse?.trim();

  if (!userQuestion || !assistantResponse) {
    return new Response(JSON.stringify({ error: 'userQuestion and assistantResponse are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const modelConfig = mergeModelConfig(body?.modelConfig);

  try {
    const completion = await openai.chat.completions.create({
      model: modelConfig.model,
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.maxTokens,
      top_p: modelConfig.topP,
      frequency_penalty: modelConfig.frequencyPenalty,
      messages: [
        { role: 'system', content: JUDGE_SYSTEM_PROMPT },
        { role: 'user', content: buildEvaluationPrompt(userQuestion, assistantResponse) },
      ],
    });

    const evaluation = normalizeMessageContent(completion.choices[0]?.message?.content);

    if (!evaluation) {
      throw new Error('Judge model returned an empty response');
    }

    const payload: JudgeResponseBody = { evaluation };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[judge] evaluation failed', message);
    return new Response(JSON.stringify({ error: 'Failed to evaluate response' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
