# FrontPrep Improvement Recommendations

## Current Architecture Snapshot
- **Shell layout** stitches together the topic rail, chat pane, and settings sidebar (@app/page.tsx#1-14).
- **Topic rail** serves curated static questions, resets session state, and triggers either seeded assistant messages or immediate API calls (@components/TopicList/TopicList.tsx#1-167, @lib/topics.ts#3-142).
- **Chat interface** renders streamed assistant replies with typing indicators while `useChat` handles API orchestration, optimistic messages, and token estimation (@components/Chat/ChatInterface.tsx#1-87, @hooks/useChat.ts#1-145).
- **Prompt configurator** lets users combine technique, teaching style, persona, guardrails, and OpenAI parameters, all wired through the Zustand store (@components/Settings/SettingsPanel.tsx#87-235, @store/useAppStore.ts#20-160, @lib/prompts.ts#3-193).

## High-Level Priorities
- [ ] **P0 · Interview Flow**  
  - Recommendation: Add interviewer scoring, timed rounds, and rubric-based checkpoints.  
  - Interview impact: ✅ Keeps learners accountable.  
  - Prompt-tech impact: ➖
- [ ] **P0 · Prompt Literacy**  
  - Recommendation: Surface the generated system prompt, allow side-by-side technique comparisons, and capture reflections.  
  - Interview impact: ✅ Learners explain choices.  
  - Prompt-tech impact: ✅ Directly teaches prompting patterns.
- [ ] **P1 · Context Richness**  
  - Recommendation: Accept job descriptions or resumes for tailored drills (RAG-lite).  
  - Interview impact: ✅ Scenario relevance.  
  - Prompt-tech impact: ✅ Shows conditioning techniques.
- [ ] **P1 · Content Depth**  
  - Recommendation: Expand the topic catalog with difficulty ladders and behavioral rounds.  
  - Interview impact: ✅ Structured curriculum.  
  - Prompt-tech impact: ➖
- [ ] **P2 · Instrumentation**  
  - Recommendation: Track token/cost trends, model latency, and prompt presets per session.  
  - Interview impact: ✅ Budget awareness.  
  - Prompt-tech impact: ✅ Reinforces parameter intuition.
- [ ] **P2 · Engineering**  
  - Recommendation: Add tests, error boundaries, and multi-provider abstractions.  
  - Interview impact: ✅ Reliability during prep.  
  - Prompt-tech impact: ✅ Enables experimenting with different LLMs.

## Detailed Recommendations

### 1. Deepen Interview Realism
- **Rubric-driven scoring flow** – Extend `setAssistantStatus` inside `useChat` so each assistant turn can include score criteria, then surface the data in an Interview Scorecard widget.
- **Timed drills & rounds** – Offer timed sessions (for example a 45-minute mock) with auto-generated agendas and reuse the session stats area for countdowns (@components/Settings/SettingsPanel.tsx#203-218).
- **Behavioral & meta questions** – Add a topic group dedicated to behavioral prompts and meta follow-ups ("Explain trade-offs of your solution") (@lib/topics.ts#3-142).
- **Reflection prompts** – Conclude sessions with auto-injected reflection questions such as "How would you improve that prompt?" to build self-critique habits.

### 2. Prompt-Engineering Learning Loops
- **Prompt preview & version history** – Expose the composed system prompt (`composeSystemPrompt`) in an expandable panel so learners see how selections become instructions (@lib/prompts.ts#161-193).
- **Technique A/B testing** – Let users pin two technique configurations, replay the same question through both, and compare answers side-by-side to visualize impact.
- **Prompt pattern glossary** – Enrich `TECHNIQUE_OPTIONS` with rationale, failure modes, and follow-up experiments, ideally sourced from structured JSON to double as curriculum content.
- **User-authored prompt blocks** – Provide a scratchpad for personal exemplars or scaffolds that `composeSystemPrompt` appends dynamically.

### 3. Context, RAG, and Personalization
- **Job description & resume inputs** – Add optional fields whose content feeds the system prompt or the initial user message for role-specific prep.
- **Session memory & replay** – Persist full sessions (messages plus settings) via IndexedDB/localStorage so learners can revisit successful prompt stacks.
- **Topic graph** – Organize topics into progressive learning paths (React fundamentals → hooks → performance) and gate advanced sets until prerequisites are met.

### 4. UX & Analytics Enhancements
- **Cost telemetry** – Extend `addTokensUsed` with model pricing so the stats card shows approximate USD spend per session.
- **Stateful presets** – Allow users to save and restore named configuration presets ("strict interviewer, low-temp") using Zustand persistence (@store/useAppStore.ts#140-160).
- **Better errors** – Replace generic `/api/chat` failures with actionable guidance (retry, lower max tokens, inspect prompt) (@hooks/useChat.ts#87-140).
- **Guided onboarding** – Add a first-run walkthrough that highlights topic selection, parameter tuning, and how to read streamed reasoning.

### 5. Technical & Architectural Improvements
- **API resilience** – Implement exponential backoff, request cancellation, and server-side streaming guards in `app/api/chat/route.ts` to withstand OpenAI hiccups.
- **Testing** – Add unit tests for `composeSystemPrompt` and store actions, plus integration tests for the Topic → Chat flow to prevent regressions.
- **Provider abstraction** – Define a provider interface (`OpenAI`, `Gemini`, OSS) so swapping models is configuration-only and experiments stay simple.
- **Security & validation** – Sanitize user inputs before logging/rendering and enforce prompt length limits server-side, especially once richer context fields exist.

### 6. Stretch Ideas for Prompt Mastery
- **Self-evaluation via LLM-as-a-judge** – Pipe completed answers into a secondary model that critiques the prompt strategy and highlights blind spots.
- **Prompt mutation lab** – Introduce sliders for "explain more" or "challenge user first" that mutate prompt text through deterministic templates to show causal effects.
- **Community prompt gallery** – Allow exporting/sharing preset prompt stacks so learners can import, remix, and discuss techniques.

## Next Steps
1. **Define acceptance criteria** for each priority (e.g., scoring rubric UI, prompt diff view) to scope engineering tasks.
2. **Build a lightweight roadmap**: ship P0 items first to strengthen the interview-training loop, then tackle prompt experimentation tooling.
3. **Collect user study feedback** from a few mock interview sessions to validate which features best reinforce both interviewing and prompt-crafting skills.

These improvements keep FrontPrep aligned with its dual mandate: rigorous interview rehearsal and intentional prompt-engineering practice.
