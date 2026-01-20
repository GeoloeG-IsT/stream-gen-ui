import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TypingIndicator } from './TypingIndicator';

describe('TypingIndicator', () => {
  describe('visibility', () => {
    it('renders when isVisible is true', () => {
      render(<TypingIndicator isVisible={true} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('does not render when isVisible is false', () => {
      render(<TypingIndicator isVisible={false} />);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  describe('dots', () => {
    it('renders three dots', () => {
      render(<TypingIndicator isVisible={true} />);
      const dots = screen.getAllByTestId('typing-dot');
      expect(dots).toHaveLength(3);
    });

    it('dots have animation class', () => {
      render(<TypingIndicator isVisible={true} />);
      const dots = screen.getAllByTestId('typing-dot');
      dots.forEach((dot) => {
        expect(dot).toHaveClass('animate-bounce-typing');
      });
    });

    it('dots have staggered animation delay', () => {
      render(<TypingIndicator isVisible={true} />);
      const dots = screen.getAllByTestId('typing-dot');
      expect(dots[0]).toHaveStyle({ animationDelay: '0ms' });
      expect(dots[1]).toHaveStyle({ animationDelay: '150ms' });
      expect(dots[2]).toHaveStyle({ animationDelay: '300ms' });
    });
  });

  describe('accessibility', () => {
    it('has role="status"', () => {
      render(<TypingIndicator isVisible={true} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has aria-label for screen readers', () => {
      render(<TypingIndicator isVisible={true} />);
      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        'Assistant is typing'
      );
    });
  });

  describe('styling', () => {
    it('renders with appropriate container styling', () => {
      render(<TypingIndicator isVisible={true} />);
      const container = screen.getByRole('status');
      expect(container).toHaveClass('flex');
      expect(container).toHaveClass('gap-1');
    });

    it('dots have background color', () => {
      render(<TypingIndicator isVisible={true} />);
      const dots = screen.getAllByTestId('typing-dot');
      dots.forEach((dot) => {
        expect(dot).toHaveClass('bg-gray-400');
      });
    });

    it('dots have rounded shape', () => {
      render(<TypingIndicator isVisible={true} />);
      const dots = screen.getAllByTestId('typing-dot');
      dots.forEach((dot) => {
        expect(dot).toHaveClass('rounded-full');
      });
    });
  });
});
