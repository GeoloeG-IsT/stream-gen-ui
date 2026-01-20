'use client';

import type { ReactElement } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const NAVIGATION_TABS = [
  { label: 'FlowToken', href: '/flowtoken' },
  { label: 'llm-ui', href: '/llm-ui' },
  { label: 'Streamdown', href: '/streamdown' },
] as const;

export function Header(): ReactElement {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'h-14 bg-[#1E3A5F]',
        'flex items-center justify-center px-4'
      )}
    >
      <nav
        className="flex items-center gap-1 overflow-x-auto max-w-full"
        aria-label="Implementation navigation"
      >
        {NAVIGATION_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                'min-h-[44px] min-w-[44px] flex items-center justify-center',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E3A5F]',
                isActive
                  ? 'bg-white text-[#1E3A5F]'
                  : 'text-[#94A3B8] hover:text-white'
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
