'use client';

import { useState, useCallback, useMemo } from 'react';
import type { FormEvent, ChangeEvent, ReactElement } from 'react';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

import { Header } from '@/components/shared/Header';
import { MessageList } from '@/components/shared/MessageList';
import { ChatInput } from '@/components/shared/ChatInput';
import { TypingIndicator } from '@/components/shared/TypingIndicator';

export default function FlowTokenPage(): ReactElement {
  const [input, setInput] = useState('');

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat?format=flowtoken',
      }),
    []
  );

  const { messages, sendMessage, status } = useChat({
    transport,
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setInput(e.target.value);
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      const message = input;
      setInput('');
      await sendMessage({ text: message });
    },
    [input, isLoading, sendMessage]
  );

  // Transform messages to match MessageList expected format
  // Filter to only user/assistant roles and exclude system messages
  const formattedMessages = useMemo(
    () =>
      messages
        .filter((m): m is typeof m & { role: 'user' | 'assistant' } =>
          m.role === 'user' || m.role === 'assistant'
        )
        .map((m) => ({
          id: m.id,
          role: m.role,
          content: (m.parts ?? [])
            .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
            .map((p) => p.text)
            .join(''),
        })),
    [messages]
  );

  return (
    <div className="flex flex-col h-screen">
      <Header currentRoute="/flowtoken" />
      <main className="flex-1 overflow-hidden bg-gray-50 pt-14">
        <div className="h-full max-w-3xl mx-auto flex flex-col">
          <MessageList messages={formattedMessages} />
          {isLoading && <TypingIndicator isVisible />}
          <ChatInput
            value={input}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}
