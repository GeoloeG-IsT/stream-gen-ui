'use client';

import { Component, memo } from 'react';
import type { ReactElement, ReactNode, ErrorInfo } from 'react';

import { useLLMOutput, throttleBasic } from '@llm-ui/react';
import type { BlockMatch } from '@llm-ui/react';
import { jsonBlock } from '@llm-ui/json';
import { markdownLookBack } from '@llm-ui/markdown';
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
// Format: 【{"type":"contact",...}】
const contactBlock = {
  ...jsonBlock({ type: 'contact' }),
  component: ContactBlockComponent,
};

const calendarBlock = {
  ...jsonBlock({ type: 'calendar' }),
  component: CalendarBlockComponent,
};

/**
 * Markdown fallback block using llm-ui's proper markdownLookBack.
 * This handles streaming speed correctly, showing one visible character
 * at a time while respecting the throttle.
 */
const markdownBlock = {
  component: ({ blockMatch }: { blockMatch: BlockMatch }): ReactElement => (
    <ReactMarkdown>{blockMatch.output}</ReactMarkdown>
  ),
  lookBack: markdownLookBack(),
};

/**
 * Throttle configuration for smooth streaming.
 * Uses llm-ui defaults with slight adjustments for our JSON blocks.
 */
const throttle = throttleBasic();

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
