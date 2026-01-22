'use client';

import type { LLMOutputComponent } from '@llm-ui/react';
import { parseJson5 } from '@llm-ui/json';

import { contactBlockSchema } from './schemas';
import { ContactCard } from '@/components/shared/ContactCard';

/**
 * LLMOutputComponent wrapper for contact blocks.
 * Parses JSON5 block output and renders ContactCard component.
 */
export const ContactBlockComponent: LLMOutputComponent = ({ blockMatch }) => {
  if (!blockMatch.isVisible) return null;

  const { data, error } = contactBlockSchema.safeParse(
    parseJson5(blockMatch.output)
  );

  if (error) {
    return (
      <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
        Invalid contact data: {error.message}
      </div>
    );
  }

  // Destructure to exclude 'type' from props
  const { type, ...contactProps } = data;

  return (
    <div className="component-fade-in">
      <ContactCard {...contactProps} />
    </div>
  );
};
