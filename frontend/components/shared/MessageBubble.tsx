import type { ReactElement } from 'react';

import { cn } from '@/lib/utils';
import type { MessageBubbleProps } from '@/types';

export function MessageBubble({
  role,
  content,
  isStreaming = false,
  children,
}: MessageBubbleProps): ReactElement {
  const isUser = role === 'user';

  return (
    <div
      role="article"
      aria-label={isUser ? 'User message' : 'Assistant message'}
      className={cn(
        'rounded-xl p-4 max-w-[85%]',
        isUser
          ? 'bg-blue-500 text-white ml-auto'
          : 'bg-white border border-gray-200 text-gray-800',
        isStreaming && 'animate-pulse'
      )}
    >
      {children ?? content}
      {isStreaming && !content && !children && (
        <span className="inline-block w-2 h-4 bg-current animate-pulse" />
      )}
    </div>
  );
}
