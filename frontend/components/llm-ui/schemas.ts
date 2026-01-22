import { z } from 'zod';

/**
 * Zod schema for contact block validation.
 * Matches ContactCardProps from @/types
 */
export const contactBlockSchema = z.object({
  type: z.literal('contact'),
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

/**
 * Zod schema for calendar block validation.
 * Matches CalendarEventProps from @/types
 */
export const calendarBlockSchema = z.object({
  type: z.literal('calendar'),
  title: z.string(),
  date: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});

export type ContactBlock = z.infer<typeof contactBlockSchema>;
export type CalendarBlock = z.infer<typeof calendarBlockSchema>;
