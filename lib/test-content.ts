import type { MessageFormat } from '@/types';

/**
 * FlowToken/Streamdown format content (HTML custom elements)
 * Note: HTML5 custom elements require explicit closing tags, not self-closing syntax
 */
const FLOWTOKEN_CONTENT = `Here's the contact information you requested:

<contactcard name="John Smith" email="john.smith@example.com" phone="+1-555-123-4567"></contactcard>

I found John's details in our database. He's a senior developer based in San Francisco.

Would you like me to schedule a meeting with John? I can set something up for next week:

<calendarevent title="Meeting with John" date="2026-01-25" startTime="2:00 PM" endTime="3:00 PM" location="Conference Room A"></calendarevent>

Let me know if you'd like to adjust the time or add any notes to the meeting invite.`;

/**
 * llm-ui format content (delimiters + JSON)
 */
const LLM_UI_CONTENT = `Here's the contact information you requested:

【CONTACT:{"name":"John Smith","email":"john.smith@example.com","phone":"+1-555-123-4567"}】

I found John's details in our database. He's a senior developer based in San Francisco.

Would you like me to schedule a meeting with John? I can set something up for next week:

【CALENDAR:{"title":"Meeting with John","date":"2026-01-25","startTime":"2:00 PM","endTime":"3:00 PM","location":"Conference Room A"}】

Let me know if you'd like to adjust the time or add any notes to the meeting invite.`;

/**
 * Streamdown format uses same XML as FlowToken
 */
const STREAMDOWN_CONTENT = FLOWTOKEN_CONTENT;

/**
 * Content presets by format type
 */
const CONTENT_BY_FORMAT: Record<MessageFormat, string> = {
  flowtoken: FLOWTOKEN_CONTENT,
  'llm-ui': LLM_UI_CONTENT,
  streamdown: STREAMDOWN_CONTENT,
};

/**
 * Returns test content appropriate for the specified format.
 * The content includes embedded custom component markup that can be
 * parsed by each implementation's parser.
 *
 * @param _messages - Chat messages (currently unused, reserved for future content selection)
 * @param format - The message format to generate content for
 * @returns Formatted content string with embedded component markup
 */
export function getTestContent(
  _messages: unknown[],
  format: MessageFormat | string
): string {
  // Default to flowtoken if format is unknown
  const validFormat = (
    format in CONTENT_BY_FORMAT ? format : 'flowtoken'
  ) as MessageFormat;

  return CONTENT_BY_FORMAT[validFormat];
}
