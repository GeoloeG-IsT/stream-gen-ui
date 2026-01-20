'use client';

import type { ReactElement } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import type { HeaderProps } from '@/types';

const NAVIGATION_TABS = [
  { label: 'FlowToken', href: '/flowtoken' },
  { label: 'llm-ui', href: '/llm-ui' },
  { label: 'Streamdown', href: '/streamdown' },
] as const;

export function Header({ currentRoute }: HeaderProps): ReactElement {
  const pathname = usePathname();
  const activeRoute = currentRoute ?? pathname;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50',
        'h-[56px] bg-[#1E3A5F]',
        'flex items-center justify-center px-4'
      )}
    >
      <nav className="flex items-center gap-1">
        {NAVIGATION_TABS.map((tab) => {
          const isActive = activeRoute === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-blue-400',
                isActive
                  ? 'bg-white text-[#1E3A5F]'
                  : 'bg-transparent text-white/70 hover:text-white hover:bg-white/10'
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
