'use client';

import { Component, memo, useMemo } from 'react';
import type { ReactElement, ReactNode, ErrorInfo } from 'react';

import { Streamdown } from 'streamdown';

import { CalendarEvent } from '@/components/shared/CalendarEvent';
import { ContactCard } from '@/components/shared/ContactCard';

import type { CalendarEventProps, ContactCardProps } from '@/types';

export interface StreamdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

/**
 * Error boundary for graceful degradation when Streamdown parsing fails.
 * Per project context: "Fallback to raw text on parse errors"
 */
interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

class StreamdownErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[Streamdown] Render error:', error, errorInfo);
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
 * Handles format: name="value" with double quotes.
 *
 * Limitations:
 * - Only supports double-quoted attributes (not single quotes)
 * - Escaped quotes within values may truncate (e.g., name="John \"Doe\"")
 * - Attributes without quotes are ignored
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
 * Returns undefined if required fields are missing.
 */
function toContactCardProps(attrs: Record<string, string>): ContactCardProps | undefined {
  if (!attrs.name) {
    console.warn('[Streamdown] ContactCard missing required "name" attribute');
    return undefined;
  }
  return {
    name: attrs.name,
    email: attrs.email,
    phone: attrs.phone,
    address: attrs.address,
  };
}

/**
 * Validate and convert parsed attributes to CalendarEventProps.
 * Returns undefined if required fields are missing.
 */
function toCalendarEventProps(attrs: Record<string, string>): CalendarEventProps | undefined {
  if (!attrs.title || !attrs.date) {
    console.warn('[Streamdown] CalendarEvent missing required "title" or "date" attribute');
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
 * Custom parser to extract XML-style custom elements from content.
 * Streamdown doesn't support custom HTML elements, so we parse them ourselves.
 *
 * Handles:
 * - <contactcard name="..." email="..." ...></contactcard>
 * - <calendarevent title="..." date="..." ...></calendarevent>
 *
 * Limitations:
 * - Tags must be empty (no content between opening and closing tags)
 * - Self-closing tags are not supported (use explicit closing tag)
 * - Content between tags (e.g., <tag>content</tag>) will not match
 *
 * During streaming, incomplete tags are detected and hidden until complete.
 */
function parseContent(content: string, isStreaming: boolean): ContentSegment[] {
  const segments: ContentSegment[] = [];

  // If streaming, check for incomplete tags at the end and hide them
  let contentToProcess = content;

  if (isStreaming) {
    // Find incomplete tag at end of content (tag started but not closed with />)
    const incompleteMatch = content.match(/<(contactcard|calendarevent)[^>]*$/i);
    if (incompleteMatch && incompleteMatch.index !== undefined) {
      contentToProcess = content.slice(0, incompleteMatch.index);
    }
  }

  // Pattern to match complete self-closing custom elements
  // Matches: <tagname attr="value" ... />
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
 * StreamdownRenderer component using Streamdown for streaming markdown with custom components.
 *
 * Uses a custom parser to extract XML-style custom elements (<contactcard>, <calendarevent>)
 * and renders them as React components. Markdown content is rendered via Streamdown.
 * Optimized for AI streaming with graceful handling of incomplete tags.
 */
function StreamdownRendererInner({
  content,
  isStreaming = false,
}: StreamdownRendererProps): ReactElement {
  // Parse content into segments (memoized for performance)
  const segments = useMemo(() => parseContent(content, isStreaming), [content, isStreaming]);

  return (
    <StreamdownErrorBoundary
      fallback={<pre className="whitespace-pre-wrap text-sm text-gray-600">{content}</pre>}
    >
      <div className="streamdown-output" role="region" aria-label="Streamdown generated content">
        {segments.map((segment, index) => {
          // Use stable key based on segment position
          const key = `segment-${index}`;

          if (segment.type === 'markdown') {
            // Streamdown renders pure markdown - XML tags are already extracted by parseContent()
            return (
              <Streamdown key={key} isAnimating={isStreaming}>
                {segment.content}
              </Streamdown>
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
    </StreamdownErrorBoundary>
  );
}

/**
 * Memoized StreamdownRenderer for performance during streaming.
 * Per project context: "React.memo on streaming message blocks"
 */
export const StreamdownRenderer = memo(StreamdownRendererInner);
