'use client';

import type { ReactElement } from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';

import { cn } from '@/lib/utils';
import type { MessageListProps } from '@/types';
import { MessageBubble } from './MessageBubble';

export function MessageList({ messages }: MessageListProps): ReactElement {
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
  }, [messages, userHasScrolled]);

  return (
    <div
      ref={containerRef}
      role="log"
      aria-live="polite"
      aria-label="Chat messages"
      onScroll={handleScroll}
      className={cn(
        'flex-1 overflow-y-auto',
        'flex flex-col gap-3 p-4'
      )}
    >
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          role={message.role}
          content={message.content}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
