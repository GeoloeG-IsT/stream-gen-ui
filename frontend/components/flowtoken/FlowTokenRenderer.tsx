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
  return (
    <FlowTokenErrorBoundary
      fallback={<pre className="whitespace-pre-wrap text-sm text-gray-600">{content}</pre>}
    >
      <AnimatedMarkdown
        content={content}
        // Always use an animation value to maintain consistent wrapper styling
        // 'none' keeps the inline-block wrapper but without visible animation
        animation={isStreaming ? 'fadeIn' : 'none'}
        customComponents={{
          contactcard: ContactCard,
          calendarevent: CalendarEvent,
        }}
      />
    </FlowTokenErrorBoundary>
  );
}
