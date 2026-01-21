import { Component, useMemo } from 'react';
import type { ReactElement, ReactNode, ErrorInfo } from 'react';

import { AnimatedMarkdown } from 'flowtoken';

import { CalendarEvent } from '@/components/shared/CalendarEvent';
import { ContactCard } from '@/components/shared/ContactCard';

export interface FlowTokenRendererProps {
  content: string;
  isStreaming?: boolean;
}

/**
 * Filter out incomplete XML tags from content during streaming.
 * Returns content with incomplete tags removed.
 */
function filterIncompleteXml(content: string, isStreaming: boolean): string {
  if (!isStreaming) return content;

  // Find incomplete self-closing tag at end of content
  // Matches: <contactcard or <calendarevent followed by anything except />
  const incompleteMatch = content.match(/<(contactcard|calendarevent)(?:(?!\s*\/>).)*$/i);
  if (incompleteMatch && incompleteMatch.index !== undefined) {
    return content.slice(0, incompleteMatch.index);
  }
  return content;
}

/**
 * Error boundary to catch FlowToken parse errors and fall back to raw text.
 * Per project context: "Fallback to raw text on parse errors"
 */
interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

class FlowTokenErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[FlowToken] Render error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function FlowTokenRenderer({
  content,
  isStreaming = false,
}: FlowTokenRendererProps): ReactElement {
  // Filter out incomplete XML tags during streaming
  const filteredContent = useMemo(
    () => filterIncompleteXml(content, isStreaming),
    [content, isStreaming]
  );

  return (
    <FlowTokenErrorBoundary
      fallback={<pre className="whitespace-pre-wrap text-sm text-gray-600">{content}</pre>}
    >
      <AnimatedMarkdown
        content={filteredContent}
        animation={isStreaming ? 'fadeIn' : null}
        customComponents={{
          // FlowToken lowercases tag names when parsing, so use lowercase keys
          contactcard: ContactCard,
          calendarevent: CalendarEvent,
        }}
      />
    </FlowTokenErrorBoundary>
  );
}
