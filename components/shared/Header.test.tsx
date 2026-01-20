import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Header } from './Header';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/flowtoken',
}));

describe('Header', () => {
  it('renders with correct height and background color', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('h-[56px]'); // Explicit 56px per spec
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

  it('shows active tab with white background and navy text', () => {
    render(<Header currentRoute="/flowtoken" />);
    const activeTab = screen.getByRole('link', { name: /flowtoken/i });
    expect(activeTab).toHaveClass('bg-white');
    expect(activeTab).toHaveClass('text-[#1E3A5F]');
  });

  it('shows inactive tabs with transparent background and white text', () => {
    render(<Header currentRoute="/flowtoken" />);
    const inactiveTab = screen.getByRole('link', { name: /llm-ui/i });
    expect(inactiveTab).toHaveClass('bg-transparent');
    expect(inactiveTab).toHaveClass('text-white/70');
  });

  it('uses usePathname when currentRoute not provided', () => {
    render(<Header />);
    // usePathname is mocked to return /flowtoken
    const activeTab = screen.getByRole('link', { name: /flowtoken/i });
    expect(activeTab).toHaveClass('bg-white');
  });

  it('renders fixed position header', () => {
    render(<Header />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('fixed');
    expect(header).toHaveClass('top-0');
  });

  it('has navigation element with nav role', () => {
    render(<Header />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
