import { describe, expect, it } from 'vitest';

import { detectPreset, getTestContent } from './test-content';

describe('test-content', () => {
  describe('detectPreset', () => {
    it('returns "contact" for contact-related keywords', () => {
      expect(detectPreset('Show me a contact')).toBe('contact');
      expect(detectPreset('Find email for John')).toBe('contact');
      expect(detectPreset('What is the phone number?')).toBe('contact');
    });

    it('returns "calendar" for calendar-related keywords', () => {
      expect(detectPreset('Schedule a meeting')).toBe('calendar');
      expect(detectPreset('Check my calendar')).toBe('calendar');
    });

    it('returns "event" for event keyword', () => {
      expect(detectPreset('Show me the event')).toBe('event');
    });

    it('returns "text" for text-only keywords', () => {
      expect(detectPreset('Show me plain text')).toBe('text');
      expect(detectPreset('Just markdown please')).toBe('text');
    });

    it('returns "multi" for multi-component keywords', () => {
      expect(detectPreset('Show multiple contacts')).toBe('multi');
      expect(detectPreset('Show me several items')).toBe('multi');
    });

    it('returns "both" for "everything" keyword', () => {
      expect(detectPreset('Show me everything')).toBe('both');
    });

    it('returns "both" as default for unknown messages', () => {
      expect(detectPreset('hello there')).toBe('both');
      expect(detectPreset('random message')).toBe('both');
    });
  });

  describe('getTestContent', () => {
    const mockMessages = [{ role: 'user' as const, content: 'hello' }];

    describe('FlowToken format', () => {
      it('returns content with XML ContactCard tag', () => {
        const content = getTestContent(mockMessages, 'flowtoken');
        expect(content).toContain('<contactcard');
        expect(content).toContain('name="');
        expect(content).toContain('</contactcard>');
      });

      it('returns content with XML CalendarEvent tag', () => {
        const content = getTestContent(mockMessages, 'flowtoken');
        expect(content).toContain('<calendarevent');
        expect(content).toContain('title="');
        expect(content).toContain('</calendarevent>');
      });

      it('includes narrative text around components', () => {
        const content = getTestContent(mockMessages, 'flowtoken');
        // Should have text before/after components
        expect(content.length).toBeGreaterThan(200);
        // Should not be just tags
        const textContent = content.replace(/<[^>]+>/g, '').trim();
        expect(textContent.length).toBeGreaterThan(50);
      });
    });

    describe('llm-ui format', () => {
      it('returns content with delimiter-based CONTACT', () => {
        const content = getTestContent(mockMessages, 'llm-ui');
        expect(content).toContain('【CONTACT:');
        expect(content).toContain('】');
      });

      it('returns content with delimiter-based CALENDAR', () => {
        const content = getTestContent(mockMessages, 'llm-ui');
        expect(content).toContain('【CALENDAR:');
        expect(content).toContain('】');
      });

      it('includes JSON data in delimiters', () => {
        const content = getTestContent(mockMessages, 'llm-ui');
        // Should have JSON structure
        expect(content).toContain('"name"');
        expect(content).toContain('"title"');
      });
    });

    describe('Streamdown format', () => {
      it('returns content with XML tags (same as FlowToken)', () => {
        const content = getTestContent(mockMessages, 'streamdown');
        expect(content).toContain('<contactcard');
        expect(content).toContain('<calendarevent');
      });
    });

    describe('format defaults', () => {
      it('defaults to flowtoken when format is unknown', () => {
        const content = getTestContent(mockMessages, 'unknown' as 'flowtoken');
        expect(content).toContain('<contactcard');
      });
    });

    describe('message-based content selection', () => {
      it('returns contact-only content when message contains "contact"', () => {
        const messages = [{ role: 'user' as const, content: 'Show me a contact' }];
        const content = getTestContent(messages, 'flowtoken');
        expect(content).toContain('<contactcard');
        expect(content).not.toContain('<calendarevent');
      });

      it('returns calendar-only content when message contains "meeting"', () => {
        const messages = [{ role: 'user' as const, content: 'Schedule a meeting' }];
        const content = getTestContent(messages, 'flowtoken');
        expect(content).toContain('<calendarevent');
        expect(content).not.toContain('<contactcard');
      });

      it('returns text-only content when message contains "text"', () => {
        const messages = [{ role: 'user' as const, content: 'Just text please' }];
        const content = getTestContent(messages, 'flowtoken');
        expect(content).not.toContain('<contactcard');
        expect(content).not.toContain('<calendarevent');
        expect(content.length).toBeGreaterThan(50);
      });

      it('returns multi-component content when message contains "multiple"', () => {
        const messages = [{ role: 'user' as const, content: 'Show multiple items' }];
        const content = getTestContent(messages, 'flowtoken');
        // Should have multiple contact cards
        const contactMatches = content.match(/<contactcard/g);
        expect(contactMatches?.length).toBeGreaterThanOrEqual(2);
        // Should have multiple calendar events
        const calendarMatches = content.match(/<calendarevent/g);
        expect(calendarMatches?.length).toBeGreaterThanOrEqual(2);
      });

      it('uses last user message for content selection', () => {
        const messages = [
          { role: 'user' as const, content: 'Show me a contact' },
          { role: 'assistant' as const, content: 'Here is the contact' },
          { role: 'user' as const, content: 'Now schedule a meeting' },
        ];
        const content = getTestContent(messages, 'flowtoken');
        expect(content).toContain('<calendarevent');
        expect(content).not.toContain('<contactcard');
      });

      it('supports AI SDK v6 parts format for message content', () => {
        const messages = [
          {
            role: 'user' as const,
            parts: [{ type: 'text', text: 'Show me a contact' }],
          },
        ];
        const content = getTestContent(messages, 'flowtoken');
        expect(content).toContain('<contactcard');
        expect(content).not.toContain('<calendarevent');
      });

      it('prefers content over parts when both exist (v5 compatibility)', () => {
        const messages = [
          {
            role: 'user' as const,
            content: 'Show me a contact',
            parts: [{ type: 'text', text: 'Schedule a meeting' }],
          },
        ];
        const content = getTestContent(messages, 'flowtoken');
        // Should use content (v5) which says "contact"
        expect(content).toContain('<contactcard');
      });

      it('returns "both" preset for unknown messages (default)', () => {
        const messages = [{ role: 'user' as const, content: 'hello there' }];
        const content = getTestContent(messages, 'flowtoken');
        expect(content).toContain('<contactcard');
        expect(content).toContain('<calendarevent');
      });
    });

    describe('format-specific content for presets', () => {
      it('returns delimiter format for llm-ui with contact preset', () => {
        const messages = [{ role: 'user' as const, content: 'Show me a contact' }];
        const content = getTestContent(messages, 'llm-ui');
        expect(content).toContain('【CONTACT:');
        expect(content).not.toContain('【CALENDAR:');
      });

      it('returns delimiter format for llm-ui with calendar preset', () => {
        const messages = [{ role: 'user' as const, content: 'Schedule a meeting' }];
        const content = getTestContent(messages, 'llm-ui');
        expect(content).toContain('【CALENDAR:');
        expect(content).not.toContain('【CONTACT:');
      });

      it('returns XML format for streamdown with contact preset', () => {
        const messages = [{ role: 'user' as const, content: 'Show me a contact' }];
        const content = getTestContent(messages, 'streamdown');
        expect(content).toContain('<contactcard');
        expect(content).not.toContain('<calendarevent');
      });
    });

    describe('semantic equivalence across formats', () => {
      it('all formats contain same contact data for contact preset', () => {
        const messages = [{ role: 'user' as const, content: 'Show me a contact' }];
        const flowtoken = getTestContent(messages, 'flowtoken');
        const llmui = getTestContent(messages, 'llm-ui');
        const streamdown = getTestContent(messages, 'streamdown');

        // All should contain John Smith
        expect(flowtoken).toContain('John Smith');
        expect(llmui).toContain('John Smith');
        expect(streamdown).toContain('John Smith');
      });

      it('all formats contain same calendar data for calendar preset', () => {
        const messages = [{ role: 'user' as const, content: 'Schedule a meeting' }];
        const flowtoken = getTestContent(messages, 'flowtoken');
        const llmui = getTestContent(messages, 'llm-ui');
        const streamdown = getTestContent(messages, 'streamdown');

        // All should contain meeting details
        expect(flowtoken).toContain('Meeting');
        expect(llmui).toContain('Meeting');
        expect(streamdown).toContain('Meeting');
      });
    });
  });
});
