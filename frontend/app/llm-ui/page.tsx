'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { FormEvent, ChangeEvent, ReactElement } from 'react';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { toast } from 'sonner';

import { LLMUIRenderer } from '@/components/llm-ui/LLMUIRenderer';
import { Header } from '@/components/shared/Header';
import { MessageBubble } from '@/components/shared/MessageBubble';
import { ChatInput } from '@/components/shared/ChatInput';
import { StopButton } from '@/components/shared/StopButton';

export default function LlmUiPage(): ReactElement {
  const [input, setInput] = useState('');
  const [lastUserMessage, setLastUserMessage] = useState('');

  // Point to backend agent API
  // Use environment variable or fallback to public IP for cross-origin access
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://188.245.108.179:8000';
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${backendUrl}/api/chat?marker=llm-ui`,
      }),
    [backendUrl]
  );

  const { messages, sendMessage, status, error, stop } = useChat({
    transport,
    onError: (err) => {
      console.error('[llm-ui] useChat onError:', err);
      const message = err.message.includes('fetch')
        ? 'Network error - check your connection'
        : err.message.includes('500')
          ? 'Server error - please try again'
          : 'An error occurred';
      toast.error(message);
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';
  const isStreaming = status === 'streaming';

  // Abort stream on unmount (prevents background streaming)
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

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
      setLastUserMessage(message);
      await sendMessage({ text: message });
    },
    [input, isLoading, sendMessage]
  );

  const handlePresetSelect = useCallback(
    async (message: string) => {
      if (isLoading) return;
      setLastUserMessage(message);
      await sendMessage({ text: message });
    },
    [isLoading, sendMessage]
  );

  // Transform messages to include isStreaming flag for LLMUIRenderer
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
                rawContent={m.role === 'assistant' ? m.content : undefined}
              >
                {m.role === 'assistant' ? (
                  <LLMUIRenderer
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
          {isStreaming && (
            <div className="flex justify-center py-2">
              <StopButton onClick={stop} />
            </div>
          )}
          <ChatInput
            value={input}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onPresetSelect={handlePresetSelect}
          />
        </div>
      </main>
    </div>
  );
}
