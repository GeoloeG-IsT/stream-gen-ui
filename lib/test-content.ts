import type { MessageFormat } from '@/types';

/**
 * Content preset types for test scenarios
 */
type ContentPreset = 'contact' | 'calendar' | 'both' | 'text' | 'multi' | 'event';

/**
 * Keywords mapped to content presets, ordered by priority
 * (multi-component keywords checked first to avoid false matches)
 */
const PRESET_KEYWORDS: Array<[string, ContentPreset]> = [
  // Multi-component (check first - most specific)
  ['multiple', 'multi'],
  ['several', 'multi'],
  ['many', 'multi'],
  // Both (check before text to catch "everything")
  ['everything', 'both'],
  // Text only
  ['text', 'text'],
  ['markdown', 'text'],
  ['plain', 'text'],
  // Contact
  ['contact', 'contact'],
  ['email', 'contact'],
  ['phone', 'contact'],
  // Calendar/Event
  ['meeting', 'calendar'],
  ['schedule', 'calendar'],
  ['event', 'event'],
  ['calendar', 'calendar'],
];

/**
 * Detects which content preset to use based on message content
 */
export function detectPreset(message: string): ContentPreset {
  const lower = message.toLowerCase();
  for (const [keyword, preset] of PRESET_KEYWORDS) {
    if (lower.includes(keyword)) {
      return preset;
    }
  }
  return 'both';
}

// =============================================================================
// FlowToken/Streamdown Content (XML format)
// =============================================================================

const FLOWTOKEN_CONTACT = `Here's the contact information you requested:

<contactcard name="John Smith" email="john.smith@example.com" phone="+1-555-123-4567"></contactcard>

I found John's details in our database. He's a senior developer based in San Francisco.`;

const FLOWTOKEN_CALENDAR = `I've scheduled the meeting for you:

<calendarevent title="Meeting with John" date="2026-01-25" startTime="2:00 PM" endTime="3:00 PM" location="Conference Room A"></calendarevent>

Let me know if you'd like to adjust the time or add any notes to the meeting invite.`;

const FLOWTOKEN_BOTH = `Here's the contact information you requested:

<contactcard name="John Smith" email="john.smith@example.com" phone="+1-555-123-4567"></contactcard>

I found John's details in our database. He's a senior developer based in San Francisco.

Would you like me to schedule a meeting with John? I can set something up for next week:

<calendarevent title="Meeting with John" date="2026-01-25" startTime="2:00 PM" endTime="3:00 PM" location="Conference Room A"></calendarevent>

Let me know if you'd like to adjust the time or add any notes to the meeting invite.`;

const FLOWTOKEN_TEXT = `Here's a summary of the project status:

## Current Progress
The development team has completed the following milestones:

1. **Authentication System** - Fully implemented with JWT tokens
2. **User Dashboard** - Basic layout complete, needs polish
3. **API Integration** - Connected to all external services

### Next Steps
We need to focus on testing and documentation before the release.

Let me know if you have any questions about the timeline.`;

const FLOWTOKEN_MULTI = `Here are all the contacts from our team:

<contactcard name="John Smith" email="john.smith@example.com" phone="+1-555-123-4567"></contactcard>

<contactcard name="Jane Doe" email="jane.doe@example.com" phone="+1-555-987-6543"></contactcard>

And here are the upcoming team meetings:

<calendarevent title="Sprint Planning" date="2026-01-25" startTime="10:00 AM" endTime="11:00 AM" location="Conference Room A"></calendarevent>

<calendarevent title="Design Review" date="2026-01-26" startTime="2:00 PM" endTime="3:00 PM" location="Virtual - Zoom"></calendarevent>

Let me know if you need to add anyone else to these meetings.`;

// =============================================================================
// llm-ui Content (Delimiter format)
// =============================================================================

const LLM_UI_CONTACT = `Here's the contact information you requested:

【CONTACT:{"name":"John Smith","email":"john.smith@example.com","phone":"+1-555-123-4567"}】

I found John's details in our database. He's a senior developer based in San Francisco.`;

const LLM_UI_CALENDAR = `I've scheduled the meeting for you:

【CALENDAR:{"title":"Meeting with John","date":"2026-01-25","startTime":"2:00 PM","endTime":"3:00 PM","location":"Conference Room A"}】

Let me know if you'd like to adjust the time or add any notes to the meeting invite.`;

const LLM_UI_BOTH = `Here's the contact information you requested:

【CONTACT:{"name":"John Smith","email":"john.smith@example.com","phone":"+1-555-123-4567"}】

I found John's details in our database. He's a senior developer based in San Francisco.

Would you like me to schedule a meeting with John? I can set something up for next week:

【CALENDAR:{"title":"Meeting with John","date":"2026-01-25","startTime":"2:00 PM","endTime":"3:00 PM","location":"Conference Room A"}】

Let me know if you'd like to adjust the time or add any notes to the meeting invite.`;

const LLM_UI_TEXT = `Here's a summary of the project status:

## Current Progress
The development team has completed the following milestones:

1. **Authentication System** - Fully implemented with JWT tokens
2. **User Dashboard** - Basic layout complete, needs polish
3. **API Integration** - Connected to all external services

### Next Steps
We need to focus on testing and documentation before the release.

Let me know if you have any questions about the timeline.`;

const LLM_UI_MULTI = `Here are all the contacts from our team:

【CONTACT:{"name":"John Smith","email":"john.smith@example.com","phone":"+1-555-123-4567"}】

【CONTACT:{"name":"Jane Doe","email":"jane.doe@example.com","phone":"+1-555-987-6543"}】

And here are the upcoming team meetings:

【CALENDAR:{"title":"Sprint Planning","date":"2026-01-25","startTime":"10:00 AM","endTime":"11:00 AM","location":"Conference Room A"}】

【CALENDAR:{"title":"Design Review","date":"2026-01-26","startTime":"2:00 PM","endTime":"3:00 PM","location":"Virtual - Zoom"}】

Let me know if you need to add anyone else to these meetings.`;

// =============================================================================
// Content Maps
// =============================================================================

type PresetKey = 'contact' | 'calendar' | 'both' | 'text' | 'multi';

const FLOWTOKEN_PRESETS: Record<PresetKey, string> = {
  contact: FLOWTOKEN_CONTACT,
  calendar: FLOWTOKEN_CALENDAR,
  both: FLOWTOKEN_BOTH,
  text: FLOWTOKEN_TEXT,
  multi: FLOWTOKEN_MULTI,
};

const LLM_UI_PRESETS: Record<PresetKey, string> = {
  contact: LLM_UI_CONTACT,
  calendar: LLM_UI_CALENDAR,
  both: LLM_UI_BOTH,
  text: LLM_UI_TEXT,
  multi: LLM_UI_MULTI,
};

const CONTENT_BY_FORMAT_AND_PRESET: Record<
  MessageFormat,
  Record<PresetKey, string>
> = {
  flowtoken: FLOWTOKEN_PRESETS,
  'llm-ui': LLM_UI_PRESETS,
  streamdown: FLOWTOKEN_PRESETS, // Streamdown uses same XML format as FlowToken
};

/**
 * Message part structure (AI SDK v6)
 */
interface MessagePart {
  type: string;
  text?: string;
}

/**
 * Message structure for content selection (supports both AI SDK v5 and v6)
 */
interface ChatMessage {
  role: string;
  content?: string;
  parts?: MessagePart[];
}

/**
 * Extracts text content from a message (supports both v5 content and v6 parts)
 */
function extractMessageContent(msg: ChatMessage): string {
  // AI SDK v5: content is a string
  if (typeof msg.content === 'string') {
    return msg.content;
  }
  // AI SDK v6: parts is an array of message parts
  if (Array.isArray(msg.parts)) {
    return msg.parts
      .filter((p): p is MessagePart & { text: string } => p.type === 'text' && typeof p.text === 'string')
      .map((p) => p.text)
      .join('');
  }
  return '';
}

/**
 * Gets the last user message content from the messages array
 */
function getLastUserMessage(messages: unknown[]): string {
  // Find the last message with role 'user'
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i] as ChatMessage | undefined;
    if (msg && typeof msg === 'object' && msg.role === 'user') {
      const content = extractMessageContent(msg);
      if (content) {
        return content;
      }
    }
  }
  return '';
}

/**
 * Normalizes content preset to a valid PresetKey
 * Maps 'event' to 'calendar' since they share content
 */
function normalizePreset(preset: ContentPreset): PresetKey {
  if (preset === 'event') {
    return 'calendar';
  }
  return preset as PresetKey;
}

/**
 * Returns test content appropriate for the specified format.
 * The content includes embedded custom component markup that can be
 * parsed by each implementation's parser.
 *
 * @param messages - Chat messages used for content selection based on last user message
 * @param format - The message format to generate content for
 * @returns Formatted content string with embedded component markup
 */
export function getTestContent(
  messages: unknown[],
  format: MessageFormat | string
): string {
  // Default to flowtoken if format is unknown
  const validFormat = (
    format in CONTENT_BY_FORMAT_AND_PRESET ? format : 'flowtoken'
  ) as MessageFormat;

  // Get last user message for content selection
  const lastUserMessage = getLastUserMessage(messages);
  const detectedPreset = detectPreset(lastUserMessage);
  const presetKey = normalizePreset(detectedPreset);

  return CONTENT_BY_FORMAT_AND_PRESET[validFormat][presetKey];
}
