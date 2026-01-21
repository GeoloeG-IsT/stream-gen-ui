'use client';

import { Component, memo, useMemo } from 'react';
import type { ReactElement, ReactNode, ErrorInfo } from 'react';

import { AnimatedMarkdown } from 'flowtoken';

import { CalendarEvent } from '@/components/shared/CalendarEvent';
import { ContactCard } from '@/components/shared/ContactCard';

import type { CalendarEventProps, ContactCardProps } from '@/types';

export interface FlowTokenRendererProps {
  content: string;
  isStreaming?: boolean;
}

/**
 * Error boundary to catch FlowToken parse errors and fall back to raw text.
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

/**
 * Parsed content segment - either markdown text or a custom component
 */
type ContentSegment =
  | { type: 'markdown'; content: string }
  | { type: 'contactcard'; props: ContactCardProps }
  | { type: 'calendarevent'; props: CalendarEventProps };

/**
 * Parse attributes from an XML tag string.
 */
function parseAttributes(attrString: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /(\w+)="([^"]*)"/g;
  let match;
  while ((match = attrRegex.exec(attrString)) !== null) {
    attrs[match[1]] = match[2];
  }
  return attrs;
}

/**
 * Validate and convert parsed attributes to ContactCardProps.
 */
function toContactCardProps(attrs: Record<string, string>): ContactCardProps | undefined {
  if (!attrs.name) {
    console.warn('[FlowToken] ContactCard missing required "name" attribute');
    return undefined;
  }
  return {
    name: attrs.name,
    email: attrs.email,
    phone: attrs.phone,
    address: attrs.address,
    avatar: attrs.avatar,
  };
}

/**
 * Validate and convert parsed attributes to CalendarEventProps.
 */
function toCalendarEventProps(attrs: Record<string, string>): CalendarEventProps | undefined {
  if (!attrs.title || !attrs.date) {
    console.warn('[FlowToken] CalendarEvent missing required "title" or "date" attribute');
    return undefined;
  }
  return {
    title: attrs.title,
    date: attrs.date,
    startTime: attrs.startTime,
    endTime: attrs.endTime,
    location: attrs.location,
    description: attrs.description,
  };
}

/**
 * Parse content into segments, extracting XML custom components.
 * During streaming, incomplete tags are hidden.
 */
function parseContent(content: string, isStreaming: boolean): ContentSegment[] {
  const segments: ContentSegment[] = [];

  // If streaming, check for incomplete tags at the end and hide them
  let contentToProcess = content;

  if (isStreaming) {
    const incompleteMatch = content.match(/<(contactcard|calendarevent)[^>]*$/i);
    if (incompleteMatch && incompleteMatch.index !== undefined) {
      contentToProcess = content.slice(0, incompleteMatch.index);
    }
  }

  // Pattern to match complete self-closing custom elements
  const customTagPattern = /<(contactcard|calendarevent)([^>]*)\s*\/>/gi;

  let lastIndex = 0;
  let match;

  while ((match = customTagPattern.exec(contentToProcess)) !== null) {
    // Add markdown segment before this match
    if (match.index > lastIndex) {
      const markdownContent = contentToProcess.slice(lastIndex, match.index);
      if (markdownContent.trim()) {
        segments.push({ type: 'markdown', content: markdownContent });
      }
    }

    const tagName = match[1].toLowerCase() as 'contactcard' | 'calendarevent';
    const attrString = match[2];
    const attrs = parseAttributes(attrString);

    if (tagName === 'contactcard') {
      const props = toContactCardProps(attrs);
      if (props) {
        segments.push({ type: 'contactcard', props });
      }
    } else if (tagName === 'calendarevent') {
      const props = toCalendarEventProps(attrs);
      if (props) {
        segments.push({ type: 'calendarevent', props });
      }
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining markdown content
  if (lastIndex < contentToProcess.length) {
    const remainingContent = contentToProcess.slice(lastIndex);
    if (remainingContent.trim()) {
      segments.push({ type: 'markdown', content: remainingContent });
    }
  }

  // If no segments were created, treat entire content as markdown
  if (segments.length === 0 && contentToProcess.trim()) {
    segments.push({ type: 'markdown', content: contentToProcess });
  }

  return segments;
}

/**
 * FlowTokenRenderer with manual XML parsing for reliable multi-component rendering.
 */
function FlowTokenRendererInner({
  content,
  isStreaming = false,
}: FlowTokenRendererProps): ReactElement {
  const segments = useMemo(() => parseContent(content, isStreaming), [content, isStreaming]);

  return (
    <FlowTokenErrorBoundary
      fallback={<pre className="whitespace-pre-wrap text-sm text-gray-600">{content}</pre>}
    >
      <div className="flowtoken-output" role="region" aria-label="FlowToken generated content">
        {segments.map((segment, index) => {
          const key = `segment-${index}`;

          if (segment.type === 'markdown') {
            return (
              <AnimatedMarkdown
                key={key}
                content={segment.content}
                animation={isStreaming ? 'fadeIn' : null}
              />
            );
          }

          if (segment.type === 'contactcard') {
            return (
              <div key={key} className="component-fade-in">
                <ContactCard {...segment.props} />
              </div>
            );
          }

          if (segment.type === 'calendarevent') {
            return (
              <div key={key} className="component-fade-in">
                <CalendarEvent {...segment.props} />
              </div>
            );
          }

          return null;
        })}
      </div>
    </FlowTokenErrorBoundary>
  );
}

/**
 * Memoized FlowTokenRenderer for performance during streaming.
 */
export const FlowTokenRenderer = memo(FlowTokenRendererInner);
