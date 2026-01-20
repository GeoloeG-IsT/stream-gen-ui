import type { ReactElement } from 'react';

import { Mail, Phone, User } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { ContactCardProps } from '@/types';

export function ContactCard({ name, email, phone }: ContactCardProps): ReactElement {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 p-4',
        'bg-white rounded-xl border border-gray-200 shadow-md'
      )}
    >
      {/* Header with avatar and name */}
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex items-center justify-center',
            'w-10 h-10 rounded-full bg-gray-100'
          )}
        >
          <User className="w-5 h-5 text-gray-500" />
        </div>
        <span className="font-medium text-gray-700">{name}</span>
      </div>

      {/* Contact details */}
      <div className="flex flex-col gap-2">
        {email && (
          <a
            href={`mailto:${email}`}
            className={cn(
              'flex items-center gap-2 text-sm',
              'text-blue-500 hover:underline'
            )}
          >
            <Mail className="w-4 h-4" />
            <span>{email}</span>
          </a>
        )}

        {phone && (
          <a
            href={`tel:${phone}`}
            className={cn(
              'flex items-center gap-2 text-sm',
              'text-blue-500 hover:underline'
            )}
          >
            <Phone className="w-4 h-4" />
            <span>{phone}</span>
          </a>
        )}
      </div>
    </div>
  );
}
