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
    <span
      className="flex flex-col gap-3 my-3 p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow"
      role="group"
      aria-label={`Contact card for ${name}`}
    >
      {/* Header with avatar and name */}
      <span className="flex items-center gap-3">
        {avatar ? (
          <Image
            src={avatar}
            alt={`${name}'s avatar`}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
            <User className="w-5 h-5 text-blue-600" aria-hidden="true" />
          </span>
        )}
        <span className="font-semibold text-gray-800">{name}</span>
      </span>

      {/* Contact details */}
      <span className="flex flex-col gap-2">
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
          <span
            className="flex items-center gap-2 text-sm text-gray-600"
            aria-label={`Address: ${address}`}
          >
            <MapPin className="w-4 h-4" aria-hidden="true" />
            <span>{address}</span>
          </span>
        )}
      </span>
    </span>
  );
}
