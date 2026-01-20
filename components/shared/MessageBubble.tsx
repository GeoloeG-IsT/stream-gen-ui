import type { ReactElement } from 'react';

import { useViewRaw } from '@/contexts/ViewRawContext';
import { cn } from '@/lib/utils';
import type { MessageBubbleProps } from '@/types';

import { RawOutputView } from './RawOutputView';

export function MessageBubble({
  role,
  content,
  isStreaming = false,
  children,
  rawContent,
}: MessageBubbleProps): ReactElement {
  const isUser = role === 'user';
  const { viewRaw } = useViewRaw();

  // Only show raw output for assistant messages when viewRaw is ON and rawContent is provided
  const showRawOutput = viewRaw && !isUser && rawContent;

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
      {showRawOutput && (
        <div className="mt-3">
          <RawOutputView content={rawContent} isStreaming={isStreaming} />
        </div>
      )}
    </div>
  );
}
