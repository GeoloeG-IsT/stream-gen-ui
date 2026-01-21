'use client';

/**
 * EntityRenderer - Renders parsed entities inline with text.
 *
 * Takes parsed content (text segments + entities) and renders
 * them in order, using ContactCard and CalendarEvent components
 * for entities.
 */

import React from 'react';
import { ContactCard } from '@/components/shared/ContactCard';
import { CalendarEvent } from '@/components/shared/CalendarEvent';
import type { ParseResult, ParsedEntity } from '@/lib/entity-parser';

interface EntityRendererProps {
  /** Parse result from parseEntities() */
  parseResult: ParseResult;
  /** Whether content is actively streaming */
  isStreaming?: boolean;
  /** Render function for text segments (allows custom markdown rendering) */
  renderText?: (text: string, index: number) => React.ReactNode;
}

/**
 * Render a single entity as its corresponding component.
 */
function renderEntity(entity: ParsedEntity, index: number): React.ReactNode {
  if (entity.type === 'contact') {
    return (
      <div key={`entity-${index}`} className="my-3">
        <ContactCard {...entity.data} />
      </div>
    );
  }

  if (entity.type === 'event') {
    return (
      <div key={`entity-${index}`} className="my-3">
        <CalendarEvent {...entity.data} />
      </div>
    );
  }

  return null;
}

/**
 * Default text renderer - just returns the text as-is.
 * Override with custom markdown renderer if needed.
 */
function defaultRenderText(text: string, index: number): React.ReactNode {
  // Preserve whitespace and newlines
  return (
    <span key={`text-${index}`} className="whitespace-pre-wrap">
      {text}
    </span>
  );
}

export function EntityRenderer({
  parseResult,
  isStreaming = false,
  renderText = defaultRenderText,
}: EntityRendererProps): React.ReactElement {
  const { textSegments, entities, hasIncompleteEntity } = parseResult;

  // Interleave text segments and entities
  const elements: React.ReactNode[] = [];
  let entityIndex = 0;
  let textIndex = 0;

  // Build output by position
  // Text segments and entities alternate, starting with text before first entity
  for (let i = 0; i < textSegments.length + entities.length; i++) {
    if (i % 2 === 0 || entities.length === 0) {
      // Even indices: text segment
      if (textIndex < textSegments.length) {
        const text = textSegments[textIndex];
        if (text.trim()) {
          elements.push(renderText(text, textIndex));
        }
        textIndex++;
      }
    } else {
      // Odd indices: entity
      if (entityIndex < entities.length) {
        elements.push(renderEntity(entities[entityIndex], entityIndex));
        entityIndex++;
      }
    }
  }

  // Handle remaining items if counts don't match perfectly
  while (textIndex < textSegments.length) {
    const text = textSegments[textIndex];
    if (text.trim()) {
      elements.push(renderText(text, textIndex));
    }
    textIndex++;
  }

  while (entityIndex < entities.length) {
    elements.push(renderEntity(entities[entityIndex], entityIndex));
    entityIndex++;
  }

  return (
    <div className="entity-renderer">
      {elements}
      {isStreaming && hasIncompleteEntity && (
        <span className="inline-block animate-pulse text-gray-400 ml-1">
          ...
        </span>
      )}
    </div>
  );
}
