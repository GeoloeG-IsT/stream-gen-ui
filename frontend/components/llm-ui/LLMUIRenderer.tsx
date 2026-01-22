'use client';

import { Component, memo } from 'react';
import type { ReactElement, ReactNode, ErrorInfo } from 'react';

import { useLLMOutput, throttleBasic } from '@llm-ui/react';
import type {
  BlockMatch,
  LLMOutputFallbackBlock,
  LookBackFunctionParams,
} from '@llm-ui/react';
import { jsonBlock } from '@llm-ui/json';
import ReactMarkdown from 'react-markdown';

import { ContactBlockComponent } from './ContactBlockComponent';
import { CalendarBlockComponent } from './CalendarBlockComponent';

export interface LLMUIRendererProps {
  content: string;
  isStreaming?: boolean;
}

/**
 * Error boundary for graceful degradation when llm-ui parsing fails.
 * Per project context: "Fallback to raw text on parse errors"
 */
interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

class LLMUIErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[llm-ui] Render error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Create block matchers using jsonBlock from @llm-ui/json
// Format: 【TYPE:{json}】
const contactBlock = {
  ...jsonBlock({ type: 'contact' }),
  component: ContactBlockComponent,
};

const calendarBlock = {
  ...jsonBlock({ type: 'calendar' }),
  component: CalendarBlockComponent,
};

/**
 * Throttle configuration for smooth streaming with delimiter hiding.
 * readAheadChars: Buffer to hide 【TYPE:{"..."}】 during parsing (15 chars covers delimiters + type)
 * targetBufferChars: Smooth streaming lag
 */
const throttle = throttleBasic({
  readAheadChars: 30,    // Buffer to hide 【TYPE:{"..."}】 during parsing
  targetBufferChars: 50, // Larger buffer = slower streaming display
  adjustPercentage: 0.15, // Slower speed adjustment
  frameLookBackMs: 10000,
  windowLookBackMs: 2000,
});

/**
 * Markdown fallback block for regular text content.
 */
const markdownBlock: LLMOutputFallbackBlock = {
  component: ({ blockMatch }: { blockMatch: BlockMatch }): ReactElement => (
    <ReactMarkdown>{blockMatch.output}</ReactMarkdown>
  ),

  lookBack: ({ output, visibleTextLengthTarget, isStreamFinished }: LookBackFunctionParams) => {
    // For markdown, show text progressively during streaming
    if (isStreamFinished) {
      return { output, visibleText: output };
    }

    // Progressive reveal based on throttle target
    const visibleText = output.slice(0, visibleTextLengthTarget);
    return { output, visibleText };
  },
};

/**
 * LLMUIRenderer component using @llm-ui/react for delimiter-based block parsing.
 *
 * Parses content containing 【TYPE:{json}】 delimiters and renders
 * corresponding React components (ContactCard, CalendarEvent).
 * Uses frame-rate throttling for smooth streaming UX.
 */
function LLMUIRendererInner({
  content,
  isStreaming = false,
}: LLMUIRendererProps): ReactElement {
  const { blockMatches } = useLLMOutput({
    llmOutput: content,
    blocks: [contactBlock, calendarBlock],
    fallbackBlock: markdownBlock,
    isStreamFinished: !isStreaming,
    throttle,
  });

  return (
    <LLMUIErrorBoundary
      fallback={<pre className="whitespace-pre-wrap text-sm text-gray-600">{content}</pre>}
    >
      <div className="llm-ui-output" role="region" aria-label="LLM generated content">
        {blockMatches.map((match) => {
          const BlockComponent = match.block.component;
          // Use stable key based on startIndex only (endIndex changes during streaming)
          const stableKey = `block-${match.startIndex}`;
          return <BlockComponent key={stableKey} blockMatch={match} />;
        })}
      </div>
    </LLMUIErrorBoundary>
  );
}

/**
 * Memoized LLMUIRenderer for performance during streaming.
 * Per project context: "React.memo on streaming message blocks"
 */
export const LLMUIRenderer = memo(LLMUIRendererInner);
