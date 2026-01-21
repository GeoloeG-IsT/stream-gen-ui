/**
 * Entity parser for extracting Contact and CalendarEvent from markdown markers.
 *
 * The agent emits structured entities using markdown markers:
 * - :::contact\n```json\n{...}\n```\n::: for Contact cards
 * - :::event\n```json\n{...}\n```\n::: for CalendarEvent cards
 *
 * This parser extracts these markers and returns structured data
 * that EntityRenderer can display.
 */

import type { ContactCardProps, CalendarEventProps } from '@/types';

export type EntityType = 'contact' | 'event';

export interface ParsedContact {
  type: 'contact';
  data: ContactCardProps;
  raw: string;
  startIndex: number;
  endIndex: number;
}

export interface ParsedEvent {
  type: 'event';
  data: CalendarEventProps;
  raw: string;
  startIndex: number;
  endIndex: number;
}

export type ParsedEntity = ParsedContact | ParsedEvent;

export interface ParseResult {
  /** Text segments between entities */
  textSegments: string[];
  /** Parsed entities in order of appearance */
  entities: ParsedEntity[];
  /** Whether content has incomplete entity marker (still streaming) */
  hasIncompleteEntity: boolean;
}

// Regex patterns matching backend format
// Format: :::type\n```json\n{...}\n```\n:::
const CONTACT_PATTERN = /:::contact\s*\n```json\s*\n([\s\S]*?)\n```\s*\n:::/g;
const EVENT_PATTERN = /:::event\s*\n```json\s*\n([\s\S]*?)\n```\s*\n:::/g;

// Pattern to detect incomplete entity markers (still streaming)
const INCOMPLETE_PATTERN = /:::(?:contact|event)(?:\s*\n```json\s*\n[\s\S]*)?$/;

/**
 * Parse entities from markdown content.
 *
 * Extracts Contact and CalendarEvent entities from markdown markers,
 * returning both the entities and the remaining text segments.
 *
 * @param content - The markdown content to parse
 * @returns ParseResult with text segments, entities, and streaming status
 */
export function parseEntities(content: string): ParseResult {
  const entities: ParsedEntity[] = [];
  const allMatches: Array<{ match: RegExpExecArray; type: EntityType }> = [];

  // Find all contact matches
  let match: RegExpExecArray | null;
  const contactRegex = new RegExp(CONTACT_PATTERN.source, 'g');
  while ((match = contactRegex.exec(content)) !== null) {
    allMatches.push({ match, type: 'contact' });
  }

  // Find all event matches
  const eventRegex = new RegExp(EVENT_PATTERN.source, 'g');
  while ((match = eventRegex.exec(content)) !== null) {
    allMatches.push({ match, type: 'event' });
  }

  // Sort by position in content
  allMatches.sort((a, b) => a.match.index - b.match.index);

  // Parse each match
  for (const { match, type } of allMatches) {
    try {
      const jsonStr = match[1].trim();
      const data = JSON.parse(jsonStr);

      if (type === 'contact') {
        // Validate required field
        if (typeof data.name !== 'string') {
          console.warn('Contact missing required name field:', jsonStr.slice(0, 50));
          continue;
        }
        entities.push({
          type: 'contact',
          data: data as ContactCardProps,
          raw: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      } else if (type === 'event') {
        // Validate required fields
        if (typeof data.title !== 'string' || typeof data.date !== 'string') {
          console.warn('Event missing required fields:', jsonStr.slice(0, 50));
          continue;
        }
        entities.push({
          type: 'event',
          data: data as CalendarEventProps,
          raw: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    } catch (e) {
      console.warn(`Failed to parse ${type} JSON:`, e);
      continue;
    }
  }

  // Build text segments (content between entities)
  const textSegments: string[] = [];
  let lastEnd = 0;

  for (const entity of entities) {
    // Text before this entity
    if (entity.startIndex > lastEnd) {
      textSegments.push(content.slice(lastEnd, entity.startIndex));
    }
    lastEnd = entity.endIndex;
  }

  // Text after last entity
  if (lastEnd < content.length) {
    const remaining = content.slice(lastEnd);
    // Check if remaining has incomplete entity marker
    const hasIncomplete = INCOMPLETE_PATTERN.test(remaining);
    if (hasIncomplete) {
      // Don't include incomplete marker in text segments
      const incompleteMatch = remaining.match(INCOMPLETE_PATTERN);
      if (incompleteMatch && incompleteMatch.index !== undefined) {
        textSegments.push(remaining.slice(0, incompleteMatch.index));
      }
    } else {
      textSegments.push(remaining);
    }
  }

  return {
    textSegments,
    entities,
    hasIncompleteEntity: INCOMPLETE_PATTERN.test(content.slice(lastEnd)),
  };
}

/**
 * Check if content contains any entity markers (complete or incomplete).
 */
export function hasEntityMarkers(content: string): boolean {
  return content.includes(':::contact') || content.includes(':::event');
}
