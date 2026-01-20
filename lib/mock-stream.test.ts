import { describe, expect, it } from 'vitest';

import {
  createMockStream,
  DEFAULT_CHUNK_DELAY_MS,
  DEFAULT_INITIAL_DELAY_MS,
} from './mock-stream';

describe('mock-stream', () => {
  describe('constants', () => {
    it('exports DEFAULT_INITIAL_DELAY_MS as 100', () => {
      expect(DEFAULT_INITIAL_DELAY_MS).toBe(100);
    });

    it('exports DEFAULT_CHUNK_DELAY_MS as 50', () => {
      expect(DEFAULT_CHUNK_DELAY_MS).toBe(50);
    });
  });

  describe('createMockStream', () => {
    it('creates a ReadableStream from content string', () => {
      const stream = createMockStream('Hello World');
      expect(stream).toBeInstanceOf(ReadableStream);
    });

    it('returns a stream with encoded text', async () => {
      const stream = createMockStream('Hello', {
        initialDelayMs: 0,
        chunkDelayMs: 0,
      });

      const reader = stream.getReader();
      const chunks: string[] = [];
      const decoder = new TextDecoder();

      let result = await reader.read();
      while (!result.done) {
        chunks.push(decoder.decode(result.value, { stream: true }));
        result = await reader.read();
      }

      const fullText = chunks.join('');
      // Should contain the token in AI SDK format
      expect(fullText).toContain('0:');
      expect(fullText).toContain('Hello');
    });

    it('formats chunks with AI SDK data stream protocol', async () => {
      const stream = createMockStream('Hi', {
        initialDelayMs: 0,
        chunkDelayMs: 0,
      });

      const reader = stream.getReader();
      const chunks: string[] = [];
      const decoder = new TextDecoder();

      let result = await reader.read();
      while (!result.done) {
        chunks.push(decoder.decode(result.value, { stream: true }));
        result = await reader.read();
      }

      const fullText = chunks.join('');
      // Should have text chunk with 0: prefix
      expect(fullText).toMatch(/0:"Hi"/);
      // Should have finish event
      expect(fullText).toContain('e:');
      // Should have done event
      expect(fullText).toContain('d:');
      expect(fullText).toContain('finishReason');
    });

    it('splits content into word tokens', async () => {
      const stream = createMockStream('Hello World', {
        initialDelayMs: 0,
        chunkDelayMs: 0,
      });

      const reader = stream.getReader();
      const chunks: string[] = [];
      const decoder = new TextDecoder();

      let result = await reader.read();
      while (!result.done) {
        chunks.push(decoder.decode(result.value, { stream: true }));
        result = await reader.read();
      }

      const fullText = chunks.join('');
      // Should contain both words as separate tokens
      expect(fullText).toContain('"Hello"');
      expect(fullText).toContain('"World"');
    });
  });
});
