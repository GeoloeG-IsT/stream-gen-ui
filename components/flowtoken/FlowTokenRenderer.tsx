import type { ReactElement } from 'react';

import { AnimatedMarkdown } from 'flowtoken';

import { CalendarEvent } from '@/components/shared/CalendarEvent';
import { ContactCard } from '@/components/shared/ContactCard';

export interface FlowTokenRendererProps {
  content: string;
  isStreaming?: boolean;
}

export function FlowTokenRenderer({
  content,
  isStreaming = false,
}: FlowTokenRendererProps): ReactElement {
  return (
    <AnimatedMarkdown
      content={content}
      animation={isStreaming ? 'fadeIn' : null}
      customComponents={{
        // FlowToken lowercases tag names when parsing, so use lowercase keys
        contactcard: ContactCard,
        calendarevent: CalendarEvent,
      }}
    />
  );
}
