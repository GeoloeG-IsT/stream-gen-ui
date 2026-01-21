'use client';

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { FormEvent, ChangeEvent, ReactElement } from 'react';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { toast } from 'sonner';

import { StreamdownRenderer } from '@/components/streamdown/StreamdownRenderer';
import { Header } from '@/components/shared/Header';
import { MessageBubble } from '@/components/shared/MessageBubble';
import { ChatInput } from '@/components/shared/ChatInput';
import { StopButton } from '@/components/shared/StopButton';
import { RawOutputPanel } from '@/components/shared/RawOutputPanel';
import { useViewRaw } from '@/contexts/ViewRawContext';
import { cn } from '@/lib/utils';

export default function StreamdownPage(): ReactElement {
  const [input, setInput] = useState('');
  const { viewRaw, setRawContent } = useViewRaw();

  // Point to backend agent API with Streamdown marker
  // Use environment variable or fallback to public IP for cross-origin access
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://188.245.108.179:8000';
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: `${backendUrl}/api/chat?marker=streamdown`,
      }),
    [backendUrl]
  );

  const { messages, sendMessage, status, error, stop } = useChat({
    transport,
    onError: (err) => {
      console.error('[Streamdown] useChat onError:', err);
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
      await sendMessage({ text: message });
    },
    [input, isLoading, sendMessage]
  );

  const handlePresetSelect = useCallback(
    async (message: string) => {
      if (isLoading) return;
      await sendMessage({ text: message });
    },
    [isLoading, sendMessage]
  );

  // Transform messages to include isStreaming flag for Streamdown rendering
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

  // Update raw content for side panel whenever last assistant message changes
  useEffect(() => {
    const lastAssistantMessage = formattedMessages.filter(m => m.role === 'assistant').pop();
    if (lastAssistantMessage) {
      setRawContent(lastAssistantMessage.content);
    } else {
      setRawContent(null);
    }
  }, [formattedMessages, setRawContent]);

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-hidden bg-gray-50 pt-14">
        <div className="h-full flex">
          {/* Chat area - shrinks when panel open */}
          <div className={cn(
            "flex-1 flex flex-col transition-all duration-300",
            viewRaw ? "mr-[400px]" : ""
          )}>
            <div className="h-full max-w-3xl mx-auto flex flex-col w-full">
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
                      <StreamdownRenderer
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
          </div>
          {/* Side panel - fixed position */}
          <RawOutputPanel isStreaming={isStreaming} />
        </div>
      </main>
    </div>
  );
}
