/**
 * Shared type definitions for stream-gen-ui
 */

/**
 * Supported message formats for the streaming implementations
 */
export type MessageFormat = 'flowtoken' | 'llm-ui' | 'streamdown';

/**
 * Valid message format values for runtime validation
 */
export const MESSAGE_FORMATS: readonly MessageFormat[] = [
  'flowtoken',
  'llm-ui',
  'streamdown',
] as const;

/**
 * Type guard to check if a string is a valid MessageFormat
 */
export function isValidMessageFormat(value: string): value is MessageFormat {
  return MESSAGE_FORMATS.includes(value as MessageFormat);
}

/**
 * Chat message structure for API requests
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Options for mock stream creation
 */
export interface MockStreamOptions {
  /** Delay before first token (milliseconds) */
  initialDelayMs?: number;
  /** Delay between tokens (milliseconds) */
  chunkDelayMs?: number;
}

/**
 * Props for ContactCard component
 */
export interface ContactCardProps {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

/**
 * Props for CalendarEvent component
 */
export interface CalendarEventProps {
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
}

/**
 * Props for Header component
 */
export interface HeaderProps {
  currentRoute?: string;
}

/**
 * Props for MessageBubble component
 */
export interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

/**
 * Props for TypingIndicator component
 */
export interface TypingIndicatorProps {
  isVisible: boolean;
}

/**
 * Props for MessageList component
 */
export interface MessageListProps {
  messages: Array<{ id: string; role: 'user' | 'assistant'; content: string }>;
}

/**
 * Props for ChatInput component
 */
export interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}
