/**
 * Shared type definitions for stream-gen-ui
 */

/**
 * Props for ContactCard component
 */
export interface ContactCardProps {
  name: string;
  email?: string;
  phone?: string;
}

/**
 * Props for CalendarEvent component
 */
export interface CalendarEventProps {
  title: string;
  date: string;
  time?: string;
  location?: string;
}
