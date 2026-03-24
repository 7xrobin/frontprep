# FrontPrep

FrontPrep is a lightweight frontend interview coach built with Next.js. It pairs a curated topic list, an adaptive chat interface, and configurable coaching styles so candidates can drill core concepts with AI-powered feedback.

## Features

- **Guided topic list** – pick from curated frontend subjects to focus each practice session.
- **Streaming chat assistant** – interact with an OpenAI-powered coach that streams answers in real time.
- **Configurable personas & techniques** – mix teaching styles, reasoning techniques, and guardrails to match your preferred study flow.
- **Session telemetry** – basic token usage tracking keeps you mindful of OpenAI consumption.

## Getting started

### Prerequisites

- Node.js 18+ and npm
- An OpenAI API key with access to the desired chat model

### Installation & setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a local env file and add your OpenAI key:
   ```bash
   cp .env.local.example .env.local
   # Then edit .env.local
   OPENAI_API_KEY=sk-...
   ```

### Available scripts

| Command        | Description                |
| -------------- | -------------------------- |
| `npm run dev`  | Start the Next.js dev server (hot reload) |
| `npm run build`| Create an optimized production build |
| `npm run start`| Serve the production build |
| `npm run lint` | Run ESLint checks |
| `npm run type-check` | Run TypeScript in noEmit mode |

## Usage

1. Run `npm run dev` and open the provided localhost URL.
2. Choose a topic from the left column to set context for the session.
3. Type a question or prompt in the chat input and send it to stream an assistant response.
4. Use the Settings panel to experiment with:
   - Prompting techniques (zero-shot, few-shot, chain-of-thought, etc.)
   - Teaching approaches (mentor vs interviewer)
   - Personas and guard levels for safety boundaries
   - Model parameters such as temperature, max tokens, and penalties
5. Review token usage to gauge estimated API consumption per conversation.

## Technologies

- [Next.js 14](https://nextjs.org/) App Router
- React 18 & TypeScript
- Zustand for global UI/application state
- OpenAI Chat Completions API (edge runtime streaming)
- Modern CSS modules for scoped styling

## Project structure

```
app/              # Next.js app router entry points and API routes
components/       # Topic list, chat interface, and settings UI pieces
hooks/useChat.ts  # Client hook orchestrating messages & streaming state
lib/prompts.ts    # Prebuilt prompt templates and personas
store/            # Zustand store for UI state & settings
```

Feel free to extend the topic catalog, add analytics, or wire in alternative model providers to tailor the coaching experience.
