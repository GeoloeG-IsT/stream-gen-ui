'use client';

import type { ReactElement } from 'react';

import { Header } from '@/components/shared/Header';

export default function LlmUiPage(): ReactElement {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-hidden bg-gray-50 pt-14">
        <div className="h-full max-w-3xl mx-auto flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold text-gray-800">
              llm-ui Implementation
            </h1>
            <p className="text-gray-600">
              This page will showcase the llm-ui streaming implementation.
            </p>
            <p className="text-sm text-gray-500">
              Coming in Epic 2: Three-Way Implementation Comparison
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
