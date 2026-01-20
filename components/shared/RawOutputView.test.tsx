import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RawOutputView } from './RawOutputView';

describe('RawOutputView', () => {
  describe('content rendering', () => {
    it('renders raw content correctly', () => {
      render(<RawOutputView content="# Hello World" />);
      expect(screen.getByText('# Hello World')).toBeInTheDocument();
    });

    it('renders multi-line content preserving whitespace', () => {
      const content = '# Title\n\nSome **bold** text';
      render(<RawOutputView content={content} />);
      const pre = screen.getByRole('region').querySelector('pre');
      expect(pre).toHaveTextContent('# Title');
      expect(pre).toHaveTextContent('Some **bold** text');
    });

    it('handles empty content gracefully', () => {
      render(<RawOutputView content="" />);
      const container = screen.getByRole('region');
      expect(container).toBeInTheDocument();
    });

    it('renders special characters without escaping', () => {
      render(<RawOutputView content={'<contact name="John" />'} />);
      expect(screen.getByText(/<contact name="John" \/>/)).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies monospace font styling', () => {
      render(<RawOutputView content="test" />);
      const pre = screen.getByRole('region').querySelector('pre');
      expect(pre).toHaveClass('font-mono');
    });

    it('has dark background container', () => {
      render(<RawOutputView content="test" />);
      const container = screen.getByRole('region');
      expect(container).toHaveClass('bg-gray-800');
    });

    it('has light text color for contrast', () => {
      render(<RawOutputView content="test" />);
      const container = screen.getByRole('region');
      expect(container).toHaveClass('text-gray-100');
    });

    it('has rounded corners', () => {
      render(<RawOutputView content="test" />);
      const container = screen.getByRole('region');
      expect(container).toHaveClass('rounded-lg');
    });

    it('has appropriate padding', () => {
      render(<RawOutputView content="test" />);
      const container = screen.getByRole('region');
      expect(container).toHaveClass('p-3');
    });

    it('applies code font size styling (13px per UX spec)', () => {
      render(<RawOutputView content="test" />);
      const pre = screen.getByRole('region').querySelector('pre');
      expect(pre).toHaveClass('text-[13px]');
    });
  });

  describe('streaming state', () => {
    it('shows cursor animation when streaming', () => {
      render(<RawOutputView content="streaming..." isStreaming />);
      const cursor = screen.getByRole('region').querySelector('[aria-hidden="true"]');
      expect(cursor).toBeInTheDocument();
      expect(cursor).toHaveClass('animate-pulse');
    });

    it('hides cursor when not streaming', () => {
      render(<RawOutputView content="complete" isStreaming={false} />);
      const cursor = screen.getByRole('region').querySelector('[aria-hidden="true"]');
      expect(cursor).not.toBeInTheDocument();
    });

    it('defaults to not streaming when prop not provided', () => {
      render(<RawOutputView content="content" />);
      const cursor = screen.getByRole('region').querySelector('[aria-hidden="true"]');
      expect(cursor).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has region role with appropriate label', () => {
      render(<RawOutputView content="test" />);
      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label', 'Raw markup output');
    });

    it('preserves whitespace for screen readers', () => {
      render(<RawOutputView content="test" />);
      const pre = screen.getByRole('region').querySelector('pre');
      expect(pre).toHaveClass('whitespace-pre-wrap');
    });
  });

  describe('overflow handling', () => {
    it('wraps long lines', () => {
      render(<RawOutputView content="test" />);
      const pre = screen.getByRole('region').querySelector('pre');
      expect(pre).toHaveClass('break-words');
    });

    it('has max height with scroll for long content', () => {
      render(<RawOutputView content="test" />);
      const container = screen.getByRole('region');
      expect(container).toHaveClass('max-h-64');
      expect(container).toHaveClass('overflow-auto');
    });
  });
});
