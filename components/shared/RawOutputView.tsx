import type { ReactElement } from 'react';

import { cn } from '@/lib/utils';
import type { RawOutputViewProps } from '@/types';

/**
 * Displays raw streamed markup in a monospace font with dark background.
 * Used for debugging/evaluation to show what each parser is receiving.
 */
export function RawOutputView({
  content,
  isStreaming = false,
}: RawOutputViewProps): ReactElement {
  return (
    <div
      role="region"
      aria-label="Raw markup output"
      className={cn(
        'bg-gray-800 text-gray-100 rounded-lg p-3',
        'max-h-64 overflow-auto'
      )}
    >
      <pre
        className={cn(
          'font-mono text-[13px]',
          'whitespace-pre-wrap break-words',
          'm-0'
        )}
      >
        {content}
        {isStreaming && (
          <span
            aria-hidden="true"
            className="inline-block w-2 h-4 bg-gray-100 ml-0.5 animate-pulse"
          />
        )}
      </pre>
    </div>
  );
}
