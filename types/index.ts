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
