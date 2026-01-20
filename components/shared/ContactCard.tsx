import type { ReactElement } from 'react';

import Image from 'next/image';
import { Mail, MapPin, Phone, User } from 'lucide-react';

import type { ContactCardProps } from '@/types';

export function ContactCard({
  name,
  email,
  phone,
  address,
  avatar,
}: ContactCardProps): ReactElement {
  return (
    <div
      className="flex flex-col gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-md"
      role="article"
      aria-label={`Contact card for ${name}`}
    >
      {/* Header with avatar and name */}
      <div className="flex items-center gap-3">
        {avatar ? (
          <Image
            src={avatar}
            alt={`${name}'s avatar`}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100">
            <User className="w-5 h-5 text-gray-500" aria-hidden="true" />
          </div>
        )}
        <span className="font-medium text-gray-700">{name}</span>
      </div>

      {/* Contact details */}
      <div className="flex flex-col gap-2">
        {email && (
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
            aria-label={`Email ${name} at ${email}`}
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            <span>{email}</span>
          </a>
        )}

        {phone && (
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
            aria-label={`Call ${name} at ${phone}`}
          >
            <Phone className="w-4 h-4" aria-hidden="true" />
            <span>{phone}</span>
          </a>
        )}

        {address && (
          <div
            className="flex items-center gap-2 text-sm text-gray-600"
            aria-label={`Address: ${address}`}
          >
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <span>{address}</span>
          </div>
        )}
      </div>
    </div>
  );
}
