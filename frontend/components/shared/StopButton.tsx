'use client';

import type { ReactElement } from 'react';
import { StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StopButtonProps {
  onClick: () => void;
  className?: string;
}

export function StopButton({ onClick, className }: StopButtonProps): ReactElement {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 text-sm',
        'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
        'rounded-lg transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-gray-400',
        className
      )}
      aria-label="Stop generating"
    >
      <StopCircle className="h-4 w-4" aria-hidden="true" />
      Stop
    </button>
  );
}
