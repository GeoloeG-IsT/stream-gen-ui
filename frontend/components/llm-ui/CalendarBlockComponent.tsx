'use client';

import type { LLMOutputComponent } from '@llm-ui/react';
import { parseJson5 } from '@llm-ui/json';

import { calendarBlockSchema } from './schemas';
import { CalendarEvent } from '@/components/shared/CalendarEvent';

/**
 * LLMOutputComponent wrapper for calendar blocks.
 * Parses JSON5 block output and renders CalendarEvent component.
 */
export const CalendarBlockComponent: LLMOutputComponent = ({ blockMatch }) => {
  if (!blockMatch.isVisible) return null;

  const { data, error } = calendarBlockSchema.safeParse(
    parseJson5(blockMatch.output)
  );

  if (error) {
    return (
      <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
        Invalid calendar data: {error.message}
      </div>
    );
  }

  // Destructure to exclude 'type' from props
  const { type, ...calendarProps } = data;

  return (
    <div className="component-fade-in">
      <CalendarEvent {...calendarProps} />
    </div>
  );
};
