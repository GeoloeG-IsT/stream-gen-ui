import type { ReactNode } from 'react';

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { Header } from './Header';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
    'aria-current': ariaCurrent,
  }: {
    children: ReactNode;
    href: string;
    className?: string;
    'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false' | boolean;
  }) => (
    <a href={href} className={className} aria-current={ariaCurrent}>
      {children}
    </a>
  ),
}));

// Create a mutable pathname for dynamic testing
let mockPathname = '/flowtoken';

// Mock next/navigation with dynamic pathname
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

describe('Header', () => {
  beforeEach(() => {
    // Reset to default pathname before each test
    mockPathname = '/flowtoken';
  });

  describe('Basic Rendering', () => {
    it('renders with correct height and background color', () => {
      render(<Header />);
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('h-14'); // 56px per spec (h-14 = 3.5rem = 56px)
      expect(header).toHaveClass('bg-[#1E3A5F]');
    });

    it('renders three navigation tabs', () => {
      render(<Header />);
      expect(screen.getByRole('link', { name: /flowtoken/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /llm-ui/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /streamdown/i })).toBeInTheDocument();
    });

    it('links to correct routes', () => {
      render(<Header />);
      expect(screen.getByRole('link', { name: /flowtoken/i })).toHaveAttribute(
        'href',
        '/flowtoken'
      );
      expect(screen.getByRole('link', { name: /llm-ui/i })).toHaveAttribute(
        'href',
        '/llm-ui'
      );
      expect(screen.getByRole('link', { name: /streamdown/i })).toHaveAttribute(
        'href',
        '/streamdown'
      );
    });

    it('renders fixed position header', () => {
      render(<Header />);
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('fixed');
      expect(header).toHaveClass('top-0');
      expect(header).toHaveClass('left-0');
      expect(header).toHaveClass('right-0');
      expect(header).toHaveClass('z-50');
    });
  });

  describe('Active State - All Routes', () => {
    it('shows FlowToken as active when on /flowtoken route', () => {
      mockPathname = '/flowtoken';
      render(<Header />);

      const flowTokenTab = screen.getByRole('link', { name: /flowtoken/i });
      const llmUiTab = screen.getByRole('link', { name: /llm-ui/i });
      const streamdownTab = screen.getByRole('link', { name: /streamdown/i });

      // Active tab styling
      expect(flowTokenTab).toHaveClass('bg-white');
      expect(flowTokenTab).toHaveClass('text-[#1E3A5F]');

      // Inactive tab styling
      expect(llmUiTab).toHaveClass('text-white/70');
      expect(streamdownTab).toHaveClass('text-white/70');
    });

    it('shows llm-ui as active when on /llm-ui route', () => {
      mockPathname = '/llm-ui';
      render(<Header />);

      const flowTokenTab = screen.getByRole('link', { name: /flowtoken/i });
      const llmUiTab = screen.getByRole('link', { name: /llm-ui/i });
      const streamdownTab = screen.getByRole('link', { name: /streamdown/i });

      // Active tab styling
      expect(llmUiTab).toHaveClass('bg-white');
      expect(llmUiTab).toHaveClass('text-[#1E3A5F]');

      // Inactive tab styling
      expect(flowTokenTab).toHaveClass('text-white/70');
      expect(streamdownTab).toHaveClass('text-white/70');
    });

    it('shows Streamdown as active when on /streamdown route', () => {
      mockPathname = '/streamdown';
      render(<Header />);

      const flowTokenTab = screen.getByRole('link', { name: /flowtoken/i });
      const llmUiTab = screen.getByRole('link', { name: /llm-ui/i });
      const streamdownTab = screen.getByRole('link', { name: /streamdown/i });

      // Active tab styling
      expect(streamdownTab).toHaveClass('bg-white');
      expect(streamdownTab).toHaveClass('text-[#1E3A5F]');

      // Inactive tab styling
      expect(flowTokenTab).toHaveClass('text-white/70');
      expect(llmUiTab).toHaveClass('text-white/70');
    });

    it('shows no active tab when on unknown route', () => {
      mockPathname = '/unknown';
      render(<Header />);

      const flowTokenTab = screen.getByRole('link', { name: /flowtoken/i });
      const llmUiTab = screen.getByRole('link', { name: /llm-ui/i });
      const streamdownTab = screen.getByRole('link', { name: /streamdown/i });

      // All tabs inactive
      expect(flowTokenTab).toHaveClass('text-white/70');
      expect(llmUiTab).toHaveClass('text-white/70');
      expect(streamdownTab).toHaveClass('text-white/70');
    });
  });

  describe('Accessibility', () => {
    it('has navigation element with aria-label', () => {
      render(<Header />);
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('aria-label', 'Implementation navigation');
    });

    it('sets aria-current="page" on FlowToken tab when active', () => {
      mockPathname = '/flowtoken';
      render(<Header />);

      expect(screen.getByRole('link', { name: /flowtoken/i })).toHaveAttribute(
        'aria-current',
        'page'
      );
      expect(screen.getByRole('link', { name: /llm-ui/i })).not.toHaveAttribute('aria-current');
      expect(screen.getByRole('link', { name: /streamdown/i })).not.toHaveAttribute('aria-current');
    });

    it('sets aria-current="page" on llm-ui tab when active', () => {
      mockPathname = '/llm-ui';
      render(<Header />);

      expect(screen.getByRole('link', { name: /flowtoken/i })).not.toHaveAttribute('aria-current');
      expect(screen.getByRole('link', { name: /llm-ui/i })).toHaveAttribute('aria-current', 'page');
      expect(screen.getByRole('link', { name: /streamdown/i })).not.toHaveAttribute('aria-current');
    });

    it('sets aria-current="page" on Streamdown tab when active', () => {
      mockPathname = '/streamdown';
      render(<Header />);

      expect(screen.getByRole('link', { name: /flowtoken/i })).not.toHaveAttribute('aria-current');
      expect(screen.getByRole('link', { name: /llm-ui/i })).not.toHaveAttribute('aria-current');
      expect(screen.getByRole('link', { name: /streamdown/i })).toHaveAttribute(
        'aria-current',
        'page'
      );
    });

    it('applies focus-visible styling classes to tabs', () => {
      render(<Header />);
      const tab = screen.getByRole('link', { name: /flowtoken/i });
      expect(tab).toHaveClass('focus-visible:ring-2');
      expect(tab).toHaveClass('focus-visible:ring-blue-500');
      expect(tab).toHaveClass('focus-visible:ring-offset-2');
      expect(tab).toHaveClass('focus-visible:ring-offset-[#1E3A5F]');
    });

    it('maintains minimum touch target size of 44px for all tabs', () => {
      render(<Header />);
      const tabs = screen.getAllByRole('link');

      tabs.forEach((tab) => {
        expect(tab).toHaveClass('min-h-[44px]');
        expect(tab).toHaveClass('min-w-[44px]');
      });
    });
  });

  describe('Responsive Design', () => {
    it('has horizontal scroll overflow for mobile responsiveness', () => {
      render(<Header />);
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('overflow-x-auto');
    });

    it('has max-width constraint for responsive nav containment', () => {
      render(<Header />);
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('max-w-full');
    });

    it('uses flexbox layout for tab arrangement', () => {
      render(<Header />);
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('flex');
      expect(nav).toHaveClass('items-center');
      expect(nav).toHaveClass('gap-1');
    });

    it('header has horizontal padding for mobile spacing', () => {
      render(<Header />);
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('px-4');
    });
  });

  describe('Hover States', () => {
    it('applies hover text color class to inactive tabs', () => {
      mockPathname = '/flowtoken';
      render(<Header />);

      // Inactive tabs should have hover styling
      const llmUiTab = screen.getByRole('link', { name: /llm-ui/i });
      const streamdownTab = screen.getByRole('link', { name: /streamdown/i });

      expect(llmUiTab).toHaveClass('hover:text-white');
      expect(streamdownTab).toHaveClass('hover:text-white');
    });

    it('applies transition class for smooth hover effect', () => {
      render(<Header />);
      const tabs = screen.getAllByRole('link');

      tabs.forEach((tab) => {
        expect(tab).toHaveClass('transition-colors');
      });
    });
  });

  describe('Tab Styling', () => {
    it('applies correct border radius to tabs', () => {
      render(<Header />);
      const tabs = screen.getAllByRole('link');

      tabs.forEach((tab) => {
        expect(tab).toHaveClass('rounded-lg');
      });
    });

    it('applies correct font styling to tabs', () => {
      render(<Header />);
      const tabs = screen.getAllByRole('link');

      tabs.forEach((tab) => {
        expect(tab).toHaveClass('text-sm');
        expect(tab).toHaveClass('font-medium');
      });
    });

    it('applies correct padding to tabs', () => {
      render(<Header />);
      const tabs = screen.getAllByRole('link');

      tabs.forEach((tab) => {
        expect(tab).toHaveClass('px-4');
        expect(tab).toHaveClass('py-2');
      });
    });
  });
});
