'use client';

import { Component, memo } from 'react';
import type { ReactElement, ReactNode, ErrorInfo } from 'react';

import { useLLMOutput } from '@llm-ui/react';
import type {
  BlockMatch,
  LLMOutputBlock,
  LLMOutputFallbackBlock,
  LookBackFunctionParams,
} from '@llm-ui/react';
import ReactMarkdown from 'react-markdown';

import { CalendarEvent } from '@/components/shared/CalendarEvent';
import { ContactCard } from '@/components/shared/ContactCard';

import type { CalendarEventProps, ContactCardProps } from '@/types';

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

/**
 * Creates a block matcher for delimiter-based blocks.
 * Matches format: 【TYPE:{json}】
 */
function createBlockMatcher<T extends ContactCardProps | CalendarEventProps>(
  blockType: string,
  BlockComponent: React.ComponentType<T>
): LLMOutputBlock {
  const startDelimiter = `【${blockType}:`;
  const endDelimiter = '】';

  return {
    component: ({ blockMatch }: { blockMatch: BlockMatch }): ReactElement | null => {
      // Extract JSON from the block content
      const rawOutput = blockMatch.outputRaw;
      const jsonMatch = rawOutput.match(/【[A-Z]+:(\{[\s\S]*?\})】/);

      if (!jsonMatch) {
        return <span>{rawOutput}</span>;
      }

      try {
        const props = JSON.parse(jsonMatch[1]) as T;
        return <BlockComponent {...props} />;
      } catch {
        // Malformed JSON - render raw text as fallback
        return <span>{rawOutput}</span>;
      }
    },

    findCompleteMatch: (llmOutput: string) => {
      const startIndex = llmOutput.indexOf(startDelimiter);
      if (startIndex === -1) return undefined;

      const endIndex = llmOutput.indexOf(endDelimiter, startIndex);
      if (endIndex === -1) return undefined;

      const outputRaw = llmOutput.slice(startIndex, endIndex + endDelimiter.length);

      return {
        startIndex,
        endIndex: endIndex + endDelimiter.length,
        outputRaw,
      };
    },

    findPartialMatch: (llmOutput: string) => {
      const startIndex = llmOutput.indexOf(startDelimiter);
      if (startIndex === -1) return undefined;

      // Check if we have an end delimiter after the start
      const afterStart = llmOutput.slice(startIndex);
      if (afterStart.includes(endDelimiter)) {
        // Complete match exists - not partial
        return undefined;
      }

      // Partial match - delimiter started but not closed
      return {
        startIndex,
        endIndex: llmOutput.length,
        outputRaw: afterStart,
      };
    },

    lookBack: ({ output, isComplete }: LookBackFunctionParams) => {
      // For component blocks, hide the raw delimiter text
      if (isComplete) {
        return { output, visibleText: '' };
      }
      // During streaming, show nothing until complete
      return { output, visibleText: '' };
    },
  };
}

// Create block matchers for each component type
const contactBlock = createBlockMatcher('CONTACT', ContactCard);
const calendarBlock = createBlockMatcher('CALENDAR', CalendarEvent);

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
  });

  return (
    <LLMUIErrorBoundary
      key={content.length}
      fallback={<pre className="whitespace-pre-wrap text-sm text-gray-600">{content}</pre>}
    >
      <div className="llm-ui-output" role="region" aria-label="LLM generated content">
        {blockMatches.map((match) => {
          const BlockComponent = match.block.component;
          // Use stable key based on match position to avoid React reconciliation issues
          const stableKey = `${match.startIndex}-${match.endIndex}`;
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
