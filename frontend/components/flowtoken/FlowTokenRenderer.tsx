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
 * Custom component tag names (lowercase) that need incomplete tag filtering.
 */
const CUSTOM_TAGS = ['contactcard', 'calendarevent'];

/**
 * Filter out incomplete custom component tags during streaming.
 * This prevents transient display of raw attribute text while tags are being streamed.
 *
 * For multi-line tags like:
 *   <contactcard
 *       name="John"
 *       email="john@
 *
 * The incomplete tag (no closing />) will be stripped to prevent showing raw attributes.
 */
function filterIncompleteCustomTags(content: string): string {
  if (!content) return content;

  // Find the last occurrence of any custom tag opening
  let lastIncompleteTagStart = -1;

  for (const tag of CUSTOM_TAGS) {
    // Find all occurrences of this tag
    let searchStart = 0;
    while (true) {
      const tagStart = content.indexOf(`<${tag}`, searchStart);
      if (tagStart === -1) break;

      // Check if this tag is complete (has /> or ></tagname>)
      const afterTag = content.substring(tagStart);
      const selfCloseMatch = afterTag.match(/\/>/);
      const explicitCloseMatch = afterTag.match(new RegExp(`></${tag}>`));

      // If neither closing pattern found, this tag is incomplete
      if (!selfCloseMatch && !explicitCloseMatch) {
        lastIncompleteTagStart = tagStart;
      }

      searchStart = tagStart + 1;
    }
  }

  // If we found an incomplete tag, strip from that point
  if (lastIncompleteTagStart !== -1) {
    return content.substring(0, lastIncompleteTagStart);
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
