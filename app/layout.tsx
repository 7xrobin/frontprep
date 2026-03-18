import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FrontPrep — Frontend Interview Coach',
  description:
    'AI-powered frontend interview coaching chatbot covering React, TypeScript, JavaScript, and Next.js.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
