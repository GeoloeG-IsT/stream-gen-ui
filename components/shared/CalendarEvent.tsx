import type { ReactElement } from 'react';

import { Calendar, Clock, MapPin } from 'lucide-react';

import type { CalendarEventProps } from '@/types';

export function CalendarEvent({
  title,
  date,
  startTime,
  endTime,
  location,
  description,
}: CalendarEventProps): ReactElement {
  // Format time display
  const timeDisplay = startTime
    ? endTime
      ? `${startTime} - ${endTime}`
      : startTime
    : null;

  return (
    <span
      className="flex flex-col gap-3 my-3 p-4 bg-gradient-to-r from-emerald-50 to-white rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow"
      role="article"
      aria-label={`Calendar event: ${title}`}
    >
      {/* Header with calendar icon and title */}
      <span className="flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100">
          <Calendar className="w-4 h-4 text-emerald-600" aria-hidden="true" />
        </span>
        <span className="font-semibold text-gray-800">{title}</span>
      </span>

      {/* Event details */}
      <span className="flex flex-col gap-2 pl-10">
        {/* Date */}
        <span className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-emerald-500" aria-hidden="true" />
          <span>{date}</span>
        </span>

        {/* Time */}
        {timeDisplay && (
          <span
            className="flex items-center gap-2 text-sm text-gray-600"
            aria-label={`Time: ${timeDisplay}`}
          >
            <Clock className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            <span>{timeDisplay}</span>
          </span>
        )}

        {/* Location */}
        {location && (
          <span
            className="flex items-center gap-2 text-sm text-gray-600"
            aria-label={`Location: ${location}`}
          >
            <MapPin className="w-4 h-4 text-emerald-500" aria-hidden="true" />
            <span>{location}</span>
          </span>
        )}

        {/* Description */}
        {description && (
          <span className="block text-sm text-gray-500 mt-1">{description}</span>
        )}
      </span>
    </span>
  );
}
