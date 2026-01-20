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
    <div
      className="flex flex-col gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-md"
      role="article"
      aria-label={`Calendar event: ${title}`}
    >
      {/* Header with calendar icon and title */}
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-500" aria-hidden="true" />
        <span className="font-medium text-gray-700">{title}</span>
      </div>

      {/* Event details */}
      <div className="flex flex-col gap-2">
        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" aria-hidden="true" />
          <span>{date}</span>
        </div>

        {/* Time */}
        {timeDisplay && (
          <div
            className="flex items-center gap-2 text-sm text-gray-600"
            aria-label={`Time: ${timeDisplay}`}
          >
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>{timeDisplay}</span>
          </div>
        )}

        {/* Location */}
        {location && (
          <div
            className="flex items-center gap-2 text-sm text-gray-600"
            aria-label={`Location: ${location}`}
          >
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <span>{location}</span>
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
