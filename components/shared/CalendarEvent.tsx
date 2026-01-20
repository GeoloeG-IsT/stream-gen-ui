import type { ReactElement } from 'react';

import { Calendar, MapPin } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { CalendarEventProps } from '@/types';

export function CalendarEvent({
  title,
  date,
  time,
  location,
}: CalendarEventProps): ReactElement {
  // Format the date/time display
  const dateTimeDisplay = time ? `${date} at ${time}` : date;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 p-4',
        'bg-white rounded-xl border border-gray-200 shadow-md'
      )}
    >
      {/* Header with calendar icon and title */}
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-500" />
        <span className="font-medium text-gray-700">{title}</span>
      </div>

      {/* Event details */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{dateTimeDisplay}</span>
        </div>

        {location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        )}
      </div>
    </div>
  );
}
