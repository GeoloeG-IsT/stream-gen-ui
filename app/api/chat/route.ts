import { createMockStream } from '@/lib/mock-stream';
import { getTestContent } from '@/lib/test-content';

import type { ChatMessage, MessageFormat } from '@/types';
import { isValidMessageFormat } from '@/types';

/**
 * Request body structure
 */
interface ChatRequestBody {
  messages?: ChatMessage[];
}

/**
 * Creates a JSON error response
 */
function errorResponse(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Validates the request body structure
 */
function validateRequestBody(
  body: unknown
): body is ChatRequestBody & { messages: ChatMessage[] } {
  if (typeof body !== 'object' || body === null) {
    return false;
  }

  const { messages } = body as ChatRequestBody;

  if (!Array.isArray(messages)) {
    return false;
  }

  if (messages.length === 0) {
    return false;
  }

  // Validate each message has required fields
  return messages.every(
    (msg) =>
      typeof msg === 'object' &&
      msg !== null &&
      typeof msg.content === 'string' &&
      ['user', 'assistant', 'system'].includes(msg.role)
  );
}

/**
 * POST /api/chat
 *
 * Handles chat requests and returns a streaming SSE response.
 * Uses mock stream provider to simulate LLM output for demos.
 *
 * Query params:
 * - format: 'flowtoken' | 'llm-ui' | 'streamdown' (default: 'flowtoken')
 */
export async function POST(req: Request): Promise<Response> {
  // Parse and validate request body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse('Invalid JSON body', 400);
  }

  if (!validateRequestBody(body)) {
    return errorResponse(
      'Invalid request: messages array required with valid message objects',
      400
    );
  }

  const { messages } = body;

  // Parse and validate format from URL query params
  const url = new URL(req.url);
  const formatParam = url.searchParams.get('format') || 'flowtoken';
  const format: MessageFormat = isValidMessageFormat(formatParam)
    ? formatParam
    : 'flowtoken';

  // Get test content based on format and messages
  const content = getTestContent(messages, format);

  // Create mock stream with realistic delays
  const stream = createMockStream(content);

  // Return SSE response with proper headers for Vercel AI SDK
  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Vercel-AI-Data-Stream': 'v1',
    },
  });
}
