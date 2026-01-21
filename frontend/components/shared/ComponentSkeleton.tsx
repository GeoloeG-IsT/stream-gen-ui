'use client';

import type { ReactElement } from 'react';
import { cn } from '@/lib/utils';

interface ComponentSkeletonProps {
  type: 'contact' | 'calendar';
  className?: string;
}

export function ComponentSkeleton({ type, className }: ComponentSkeletonProps): ReactElement {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg border border-gray-200 bg-white p-4',
        'transition-opacity duration-150',
        className
      )}
      aria-label={`Loading ${type}...`}
      role="status"
    >
      <div className="flex gap-4">
        {type === 'contact' && (
          <>
            <div className="h-12 w-12 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-48 bg-gray-200 rounded" />
            </div>
          </>
        )}
        {type === 'calendar' && (
          <>
            <div className="h-12 w-12 rounded bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
