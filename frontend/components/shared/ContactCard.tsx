import type { ReactElement } from 'react';

import Image from 'next/image';
import { Mail, MapPin, Phone, User } from 'lucide-react';

import type { ContactCardProps } from '@/types';

export function ContactCard({
  name,
  email,
  phone,
  address,
}: ContactCardProps): ReactElement {
  // Normalize email: convert ".at." back to "@" (workaround for remark-gfm autolink issue)
  const normalizedEmail = email?.replace('.at.', '@');

  // DEBUG: Log all props received by ContactCard
  console.log('[ContactCard] Props received:', { name, email, normalizedEmail, phone, address });

  return (
    <span
      className="inline-flex flex-col gap-3 my-3 p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow"
      role="group"
      aria-label={`Contact card for ${name}`}
    >
      {/* Header with name */}
      <span className="flex items-center gap-3">
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
          <User className="w-5 h-5 text-blue-600" aria-hidden="true" />
        </span>
        <span className="font-semibold text-gray-800">{name}</span>
      </span>

      {/* Contact details */}
      <span className="flex flex-col gap-2">
        {normalizedEmail && (
          <a
            href={`mailto:${normalizedEmail}`}
            className="flex items-center gap-2 text-sm text-blue-500 hover:underline"
            aria-label={`Email ${name} at ${normalizedEmail}`}
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            <span>{normalizedEmail}</span>
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
