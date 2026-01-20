import type { ReactNode } from 'react';

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { ViewRawProvider } from '@/contexts/ViewRawContext';

import { Header } from './Header';

// Helper to render with ViewRawProvider
function renderWithProvider(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<ViewRawProvider>{ui}</ViewRawProvider>);
}

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
      renderWithProvider(<Header />);
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('h-14'); // 56px per spec (h-14 = 3.5rem = 56px)
      expect(header).toHaveClass('bg-[#1E3A5F]');
    });

    it('renders three navigation tabs', () => {
      renderWithProvider(<Header />);
      expect(screen.getByRole('link', { name: /flowtoken/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /llm-ui/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /streamdown/i })).toBeInTheDocument();
    });

    it('links to correct routes', () => {
      renderWithProvider(<Header />);
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
      renderWithProvider(<Header />);
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
      renderWithProvider(<Header />);

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
      renderWithProvider(<Header />);

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
      renderWithProvider(<Header />);

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
      renderWithProvider(<Header />);

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
      renderWithProvider(<Header />);
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('aria-label', 'Implementation navigation');
    });

    it('sets aria-current="page" on FlowToken tab when active', () => {
      mockPathname = '/flowtoken';
      renderWithProvider(<Header />);

      expect(screen.getByRole('link', { name: /flowtoken/i })).toHaveAttribute(
        'aria-current',
        'page'
      );
      expect(screen.getByRole('link', { name: /llm-ui/i })).not.toHaveAttribute('aria-current');
      expect(screen.getByRole('link', { name: /streamdown/i })).not.toHaveAttribute('aria-current');
    });

    it('sets aria-current="page" on llm-ui tab when active', () => {
      mockPathname = '/llm-ui';
      renderWithProvider(<Header />);

      expect(screen.getByRole('link', { name: /flowtoken/i })).not.toHaveAttribute('aria-current');
      expect(screen.getByRole('link', { name: /llm-ui/i })).toHaveAttribute('aria-current', 'page');
      expect(screen.getByRole('link', { name: /streamdown/i })).not.toHaveAttribute('aria-current');
    });

    it('sets aria-current="page" on Streamdown tab when active', () => {
      mockPathname = '/streamdown';
      renderWithProvider(<Header />);

      expect(screen.getByRole('link', { name: /flowtoken/i })).not.toHaveAttribute('aria-current');
      expect(screen.getByRole('link', { name: /llm-ui/i })).not.toHaveAttribute('aria-current');
      expect(screen.getByRole('link', { name: /streamdown/i })).toHaveAttribute(
        'aria-current',
        'page'
      );
    });

    it('applies focus-visible styling classes to tabs', () => {
      renderWithProvider(<Header />);
      const tab = screen.getByRole('link', { name: /flowtoken/i });
      expect(tab).toHaveClass('focus-visible:ring-2');
      expect(tab).toHaveClass('focus-visible:ring-blue-500');
      expect(tab).toHaveClass('focus-visible:ring-offset-2');
      expect(tab).toHaveClass('focus-visible:ring-offset-[#1E3A5F]');
    });

    it('maintains minimum touch target size of 44px for all tabs', () => {
      renderWithProvider(<Header />);
      const tabs = screen.getAllByRole('link');

      tabs.forEach((tab) => {
        expect(tab).toHaveClass('min-h-[44px]');
        expect(tab).toHaveClass('min-w-[44px]');
      });
    });
  });

  describe('Responsive Design', () => {
    it('has horizontal scroll overflow for mobile responsiveness', () => {
      renderWithProvider(<Header />);
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('overflow-x-auto');
    });

    it('has max-width constraint for responsive nav containment', () => {
      renderWithProvider(<Header />);
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('max-w-full');
    });

    it('uses flexbox layout for tab arrangement', () => {
      renderWithProvider(<Header />);
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('flex');
      expect(nav).toHaveClass('items-center');
      expect(nav).toHaveClass('gap-1');
    });

    it('header has horizontal padding for mobile spacing', () => {
      renderWithProvider(<Header />);
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('px-4');
    });
  });

  describe('Hover States', () => {
    it('applies hover text color class to inactive tabs', () => {
      mockPathname = '/flowtoken';
      renderWithProvider(<Header />);

      // Inactive tabs should have hover styling
      const llmUiTab = screen.getByRole('link', { name: /llm-ui/i });
      const streamdownTab = screen.getByRole('link', { name: /streamdown/i });

      expect(llmUiTab).toHaveClass('hover:text-white');
      expect(streamdownTab).toHaveClass('hover:text-white');
    });

    it('applies transition class for smooth hover effect', () => {
      renderWithProvider(<Header />);
      const tabs = screen.getAllByRole('link');

      tabs.forEach((tab) => {
        expect(tab).toHaveClass('transition-colors');
      });
    });
  });

  describe('Tab Styling', () => {
    it('applies correct border radius to tabs', () => {
      renderWithProvider(<Header />);
      const tabs = screen.getAllByRole('link');

      tabs.forEach((tab) => {
        expect(tab).toHaveClass('rounded-lg');
      });
    });

    it('applies correct font styling to tabs', () => {
      renderWithProvider(<Header />);
      const tabs = screen.getAllByRole('link');

      tabs.forEach((tab) => {
        expect(tab).toHaveClass('text-sm');
        expect(tab).toHaveClass('font-medium');
      });
    });

    it('applies correct padding to tabs', () => {
      renderWithProvider(<Header />);
      const tabs = screen.getAllByRole('link');

      tabs.forEach((tab) => {
        expect(tab).toHaveClass('px-4');
        expect(tab).toHaveClass('py-2');
      });
    });
  });

  describe('View Raw Toggle', () => {
    it('renders the View Raw toggle button', () => {
      renderWithProvider(<Header />);
      const toggle = screen.getByRole('switch', { name: /view raw/i });
      expect(toggle).toBeInTheDocument();
    });

    it('toggle is positioned after navigation tabs', () => {
      renderWithProvider(<Header />);
      const header = screen.getByRole('banner');
      const nav = screen.getByRole('navigation');
      const toggle = screen.getByRole('switch', { name: /view raw/i });

      // Toggle should be inside nav, centered together with tabs
      expect(nav.contains(toggle)).toBe(true);
      expect(header.contains(toggle)).toBe(true);
    });

    it('toggle starts in OFF state (gray background)', () => {
      renderWithProvider(<Header />);
      const toggle = screen.getByRole('switch', { name: /view raw/i });
      expect(toggle).toHaveAttribute('aria-checked', 'false');
      expect(toggle).toHaveClass('bg-gray-300');
    });

    it('toggle changes to ON state when clicked (blue background)', () => {
      renderWithProvider(<Header />);
      const toggle = screen.getByRole('switch', { name: /view raw/i });

      fireEvent.click(toggle);

      expect(toggle).toHaveAttribute('aria-checked', 'true');
      expect(toggle).toHaveClass('bg-blue-500');
    });

    it('toggle changes back to OFF state when clicked again', () => {
      renderWithProvider(<Header />);
      const toggle = screen.getByRole('switch', { name: /view raw/i });

      fireEvent.click(toggle); // ON
      fireEvent.click(toggle); // OFF

      expect(toggle).toHaveAttribute('aria-checked', 'false');
      expect(toggle).toHaveClass('bg-gray-300');
    });

    it('toggle has minimum 44px touch target', () => {
      renderWithProvider(<Header />);
      const toggle = screen.getByRole('switch', { name: /view raw/i });
      expect(toggle).toHaveClass('min-h-[44px]');
      expect(toggle).toHaveClass('min-w-[44px]');
    });

    it('toggle has focus-visible styling', () => {
      renderWithProvider(<Header />);
      const toggle = screen.getByRole('switch', { name: /view raw/i });
      expect(toggle).toHaveClass('focus-visible:ring-2');
      expect(toggle).toHaveClass('focus-visible:ring-blue-500');
    });

    it('toggle has transition for smooth color change', () => {
      renderWithProvider(<Header />);
      const toggle = screen.getByRole('switch', { name: /view raw/i });
      expect(toggle).toHaveClass('transition-colors');
    });

    it('renders View Raw label text', () => {
      renderWithProvider(<Header />);
      expect(screen.getByText('View Raw')).toBeInTheDocument();
    });

    it('label has correct styling for visibility', () => {
      renderWithProvider(<Header />);
      const label = screen.getByText('View Raw');
      expect(label).toHaveClass('text-white/70');
      expect(label).toHaveClass('text-sm');
    });
  });
});
