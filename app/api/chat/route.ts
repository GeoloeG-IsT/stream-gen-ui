import { createUIMessageStream, createUIMessageStreamResponse } from 'ai';

import { getTestContent } from '@/lib/test-content';
import { DEFAULT_CHUNK_DELAY_MS, DEFAULT_INITIAL_DELAY_MS } from '@/lib/mock-stream';

import type { MessageFormat } from '@/types';
import { isValidMessageFormat } from '@/types';

/**
 * AI SDK v6 message part type
 */
interface MessagePart {
  type: 'text';
  text: string;
}

/**
 * AI SDK message format (supports both v5 content and v6 parts)
 */
interface AiSdkMessage {
  role: 'user' | 'assistant' | 'system';
  content?: string;
  parts?: MessagePart[];
}

/**
 * Request body structure
 */
interface ChatRequestBody {
  messages?: AiSdkMessage[];
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
 * Supports both AI SDK v5 (content) and v6 (parts) message formats
 */
function validateRequestBody(
  body: unknown
): body is ChatRequestBody & { messages: AiSdkMessage[] } {
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

  // Validate each message has required fields (support both v5 and v6 formats)
  return messages.every(
    (msg) =>
      typeof msg === 'object' &&
      msg !== null &&
      (typeof msg.content === 'string' || Array.isArray(msg.parts)) &&
      typeof msg.role === 'string' // Accept any role string
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

  // Debug: log the request body structure in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('API request body:', JSON.stringify(body, null, 2));
  }

  if (!validateRequestBody(body)) {
    // Provide more specific error message for debugging
    const bodyObj = body as Record<string, unknown>;
    const messagesField = bodyObj?.messages;
    let detail = '';
    if (!messagesField) {
      detail = ' (messages field missing)';
    } else if (!Array.isArray(messagesField)) {
      detail = ' (messages is not an array)';
    } else if (messagesField.length === 0) {
      detail = ' (messages array is empty)';
    } else {
      detail = ` (message validation failed, first message keys: ${Object.keys(messagesField[0] || {}).join(', ')})`;
    }
    return errorResponse(
      `Invalid request: messages array required with valid message objects${detail}`,
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

  // Split content into tokens for realistic streaming
  const tokens = content.match(/\S+|\s+/g) || [];

  // Helper function to create a delay
  const delay = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Generate a message ID for the assistant response
  const messageId = `msg-${Date.now()}`;

  // Create UI message stream for AI SDK v6 useChat compatibility
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      // Initial delay before streaming starts
      await delay(DEFAULT_INITIAL_DELAY_MS);

      // Start the text part
      writer.write({ type: 'text-start', id: messageId });

      // Stream each token with delay
      for (const token of tokens) {
        writer.write({ type: 'text-delta', id: messageId, delta: token });
        await delay(DEFAULT_CHUNK_DELAY_MS);
      }

      // End the text part
      writer.write({ type: 'text-end', id: messageId });
    },
    onError: (error) => {
      console.error('Stream error:', error);
      return 'An error occurred during streaming';
    },
  });

  // Return UI message stream response
  return createUIMessageStreamResponse({ stream });
}
