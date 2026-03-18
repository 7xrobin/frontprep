import type { Topic } from '@/types';

export const TOPICS: Topic[] = [
  {
    id: 'react-hooks-basics',
    label: 'React Hooks Basics',
    technology: 'React',
    difficulty: 'junior',
    seedQuestion:
      'Can you explain the difference between useState and useReducer, and when you would choose one over the other?',
  },
  {
    id: 'react-reconciliation',
    label: 'Reconciliation & Virtual DOM',
    technology: 'React',
    difficulty: 'mid',
    seedQuestion:
      'How does React\'s reconciliation algorithm work, and what role does the "key" prop play in list rendering?',
  },
  {
    id: 'react-concurrent',
    label: 'Concurrent Features',
    technology: 'React',
    difficulty: 'senior',
    seedQuestion:
      'What are React concurrent features and how do useTransition and useDeferredValue improve user experience?',
  },
  {
    id: 'react-context',
    label: 'Context API & Performance',
    technology: 'React',
    difficulty: 'mid',
    seedQuestion:
      'What are the performance pitfalls of overusing React Context, and how would you optimize a context-heavy app?',
  },
  {
    id: 'react-patterns',
    label: 'Component Patterns',
    technology: 'React',
    difficulty: 'senior',
    seedQuestion:
      'Walk me through the compound component pattern — what problem does it solve and how would you implement it?',
  },
  {
    id: 'ts-generics',
    label: 'Generics & Constraints',
    technology: 'TypeScript',
    difficulty: 'mid',
    seedQuestion:
      'How do generic constraints work in TypeScript? Give an example of using "extends" to restrict a type parameter.',
  },
  {
    id: 'ts-utility-types',
    label: 'Utility Types',
    technology: 'TypeScript',
    difficulty: 'junior',
    seedQuestion:
      'What are Partial, Required, Pick, and Omit utility types, and when would you use each one?',
  },
  {
    id: 'ts-conditional',
    label: 'Conditional & Mapped Types',
    technology: 'TypeScript',
    difficulty: 'senior',
    seedQuestion:
      'Explain how conditional types work in TypeScript and write a DeepReadonly<T> mapped type.',
  },
  {
    id: 'ts-discriminated-unions',
    label: 'Discriminated Unions',
    technology: 'TypeScript',
    difficulty: 'mid',
    seedQuestion:
      'What is a discriminated union and how does it help with exhaustive type narrowing in switch statements?',
  },
  {
    id: 'js-closures',
    label: 'Closures & Scope',
    technology: 'JavaScript',
    difficulty: 'junior',
    seedQuestion:
      'Can you explain what a closure is in JavaScript and give a practical use case where closures are essential?',
  },
  {
    id: 'js-event-loop',
    label: 'Event Loop & Async',
    technology: 'JavaScript',
    difficulty: 'mid',
    seedQuestion:
      'Walk me through the JavaScript event loop. How do the call stack, microtask queue, and macrotask queue interact?',
  },
  {
    id: 'js-prototypes',
    label: 'Prototypal Inheritance',
    technology: 'JavaScript',
    difficulty: 'mid',
    seedQuestion:
      'How does prototypal inheritance differ from classical inheritance, and how does the prototype chain resolve property lookups?',
  },
  {
    id: 'js-promises',
    label: 'Promises & Async/Await',
    technology: 'JavaScript',
    difficulty: 'junior',
    seedQuestion:
      'What is the difference between Promise.all, Promise.allSettled, Promise.race, and Promise.any?',
  },
  {
    id: 'js-memory',
    label: 'Memory Management',
    technology: 'JavaScript',
    difficulty: 'senior',
    seedQuestion:
      'How does JavaScript garbage collection work, and what common patterns lead to memory leaks in SPAs?',
  },
  {
    id: 'nextjs-rendering',
    label: 'Rendering Strategies',
    technology: 'Next.js',
    difficulty: 'mid',
    seedQuestion:
      'Compare SSR, SSG, ISR, and RSC in Next.js 14. When would you choose each strategy for a production app?',
  },
  {
    id: 'nextjs-app-router',
    label: 'App Router Architecture',
    technology: 'Next.js',
    difficulty: 'mid',
    seedQuestion:
      'How does the App Router differ from the Pages Router in Next.js, and what are the trade-offs of Server Components?',
  },
  {
    id: 'nextjs-data-fetching',
    label: 'Data Fetching Patterns',
    technology: 'Next.js',
    difficulty: 'senior',
    seedQuestion:
      'How would you implement streaming with Suspense in Next.js 14, and how does it affect Time to First Byte?',
  },
  // Add more topics here following the Topic interface
];
