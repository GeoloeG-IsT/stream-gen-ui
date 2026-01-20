import type { ReactElement } from 'react';

import { cn } from '@/lib/utils';
import type { TypingIndicatorProps } from '@/types';

const DOT_DELAYS = [0, 150, 300] as const;

export function TypingIndicator({
  isVisible,
}: TypingIndicatorProps): ReactElement | null {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="status"
      aria-label="Assistant is typing"
      className={cn(
        'flex gap-1 items-center p-3',
        'bg-white border border-gray-200 rounded-xl',
        'max-w-[85%]'
      )}
    >
      {DOT_DELAYS.map((delay, index) => (
        <span
          key={index}
          data-testid="typing-dot"
          className={cn(
            'w-2 h-2 rounded-full bg-gray-400',
            'animate-bounce-typing'
          )}
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}
