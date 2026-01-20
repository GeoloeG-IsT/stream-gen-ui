import { describe, expect, it } from 'vitest';

import { getTestContent } from './test-content';

describe('test-content', () => {
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
  });
});
