import type { ReactElement } from 'react';

import { useViewRaw } from '@/contexts/ViewRawContext';
import { cn } from '@/lib/utils';

import { RawOutputView } from './RawOutputView';

/**
 * Props for RawOutputPanel component
 */
interface RawOutputPanelProps {
  /** Whether content is currently streaming */
  isStreaming?: boolean;
}

/**
 * Side panel component for raw output display.
 * Fixed position panel on the right side of the screen that shows raw markup content.
 * Only visible when viewRaw is true AND rawContent exists.
 */
export function RawOutputPanel({ isStreaming = false }: RawOutputPanelProps): ReactElement | null {
  const { viewRaw, rawContent, setViewRaw } = useViewRaw();

  // Only render when viewRaw is ON and content exists
  if (!viewRaw || !rawContent) {
    return null;
  }

  return (
    <aside
      role="complementary"
      aria-label="Raw output panel"
      className={cn(
        'fixed right-0 top-14 bottom-0 w-full md:w-[400px]',
        'bg-gray-900 text-gray-100 shadow-lg',
        'flex flex-col',
        'transform transition-transform duration-300 ease-out',
        viewRaw ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-100">Raw Output</h2>
        <button
          type="button"
          onClick={() => setViewRaw(false)}
          className="p-1 rounded hover:bg-gray-800 transition-colors"
          aria-label="Close raw output panel"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Content area - scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        <RawOutputView content={rawContent} isStreaming={isStreaming} />
      </div>
    </aside>
  );
}
