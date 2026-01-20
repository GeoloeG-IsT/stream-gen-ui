import { simulateReadableStream } from 'ai';

import type { MockStreamOptions } from '@/types';

/**
 * Default delay before first token (milliseconds)
 */
export const DEFAULT_INITIAL_DELAY_MS = 100;

/**
 * Default delay between tokens (milliseconds)
 */
export const DEFAULT_CHUNK_DELAY_MS = 50;

/**
 * Default prompt tokens for mock usage stats
 * Used to simulate realistic token counts in stream metadata
 */
export const DEFAULT_PROMPT_TOKENS = 10;

/**
 * Creates a mock stream that simulates LLM token-by-token delivery.
 * Uses Vercel AI SDK's simulateReadableStream for realistic streaming behavior.
 *
 * @param content - The full content string to stream
 * @param options - Optional delay configuration
 * @returns A ReadableStream compatible with Vercel AI SDK
 */
export function createMockStream(
  content: string,
  options: MockStreamOptions = {}
): ReadableStream<Uint8Array> {
  const {
    initialDelayMs = DEFAULT_INITIAL_DELAY_MS,
    chunkDelayMs = DEFAULT_CHUNK_DELAY_MS,
  } = options;

  // Split content into tokens (words + spaces) for realistic streaming
  const tokens = content.match(/\S+|\s+/g) || [];

  // Format chunks for AI SDK data stream protocol
  // Text chunks use prefix 0:
  const chunks = tokens.map((token) => `0:${JSON.stringify(token)}\n`);

  // Add finish event (e:) and done event (d:)
  const usage = { promptTokens: DEFAULT_PROMPT_TOKENS, completionTokens: tokens.length };
  chunks.push(
    `e:${JSON.stringify({ finishReason: 'stop', usage })}\n`
  );
  chunks.push(
    `d:${JSON.stringify({ finishReason: 'stop', usage })}\n`
  );

  // Create simulated stream with delays
  const stream = simulateReadableStream({
    chunks,
    initialDelayInMs: initialDelayMs,
    chunkDelayInMs: chunkDelayMs,
  });

  // Pipe through TextEncoder for proper byte stream
  return stream.pipeThrough(new TextEncoderStream());
}
