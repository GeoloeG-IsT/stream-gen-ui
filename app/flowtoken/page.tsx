'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { FormEvent, ChangeEvent, ReactElement } from 'react';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

import { FlowTokenRenderer } from '@/components/flowtoken/FlowTokenRenderer';
import { Header } from '@/components/shared/Header';
import { MessageBubble } from '@/components/shared/MessageBubble';
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

  const { messages, sendMessage, status, error } = useChat({
    transport,
    onError: (err) => {
      console.error('[FlowToken] useChat onError:', err);
    },
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

  // Transform messages to include isStreaming flag for FlowToken rendering
  // Filter to only user/assistant roles and exclude system messages
  const formattedMessages = useMemo(() => {
    const filtered = messages.filter(
      (m): m is typeof m & { role: 'user' | 'assistant' } =>
        m.role === 'user' || m.role === 'assistant'
    );

    const mapped = filtered.map((m, index, arr) => ({
      id: m.id,
      role: m.role,
      content: (m.parts ?? [])
        .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map((p) => p.text)
        .join(''),
      // Only the last assistant message is streaming
      isStreaming:
        m.role === 'assistant' &&
        index === arr.length - 1 &&
        status === 'streaming',
    }));

    return mapped;
  }, [messages, status]);

  // Refs for scroll management
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);

  // Detect if user scrolled away from bottom
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    setUserHasScrolled(!isAtBottom);
  }, []);

  // Auto-scroll to bottom when new messages arrive (if user hasn't scrolled up)
  useEffect(() => {
    if (!userHasScrolled && bottomRef.current && bottomRef.current.scrollIntoView) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [formattedMessages, userHasScrolled]);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-hidden bg-gray-50 pt-14">
        <div className="h-full max-w-3xl mx-auto flex flex-col">
          <div
            ref={containerRef}
            role="log"
            aria-live="polite"
            aria-label="Chat messages"
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto flex flex-col gap-3 p-4"
          >
            {formattedMessages.map((m) => (
              <MessageBubble
                key={m.id}
                role={m.role}
                content={m.content}
                isStreaming={m.isStreaming}
              >
                {m.role === 'assistant' ? (
                  <FlowTokenRenderer
                    content={m.content}
                    isStreaming={m.isStreaming}
                  />
                ) : undefined}
              </MessageBubble>
            ))}
            <div ref={bottomRef} />
          </div>
          {error && (
            <div
              role="alert"
              className="mx-4 mb-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg"
            >
              {error.message || 'An error occurred while streaming the response.'}
            </div>
          )}
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
