import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { MessageList } from './MessageList';

describe('MessageList', () => {
  const mockMessages = [
    { id: '1', role: 'user' as const, content: 'Hello' },
    { id: '2', role: 'assistant' as const, content: 'Hi there!' },
    { id: '3', role: 'user' as const, content: 'How are you?' },
  ];

  describe('rendering', () => {
    it('renders all messages', () => {
      render(<MessageList messages={mockMessages} />);
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('Hi there!')).toBeInTheDocument();
      expect(screen.getByText('How are you?')).toBeInTheDocument();
    });

    it('renders empty state when no messages', () => {
      render(<MessageList messages={[]} />);
      const container = screen.getByRole('log');
      expect(container).toBeInTheDocument();
    });

    it('renders MessageBubble for each message', () => {
      render(<MessageList messages={mockMessages} />);
      const articles = screen.getAllByRole('article');
      expect(articles).toHaveLength(3);
    });
  });

  describe('container styling', () => {
    it('has scrollable container', () => {
      render(<MessageList messages={mockMessages} />);
      const container = screen.getByRole('log');
      expect(container).toHaveClass('overflow-y-auto');
    });

    it('has flex-1 for expansion', () => {
      render(<MessageList messages={mockMessages} />);
      const container = screen.getByRole('log');
      expect(container).toHaveClass('flex-1');
    });

    it('has appropriate padding', () => {
      render(<MessageList messages={mockMessages} />);
      const container = screen.getByRole('log');
      expect(container).toHaveClass('p-4');
    });
  });

  describe('accessibility', () => {
    it('has role="log" for live region', () => {
      render(<MessageList messages={mockMessages} />);
      expect(screen.getByRole('log')).toBeInTheDocument();
    });

    it('has aria-live="polite" for screen reader announcements', () => {
      render(<MessageList messages={mockMessages} />);
      const container = screen.getByRole('log');
      expect(container).toHaveAttribute('aria-live', 'polite');
    });

    it('has aria-label describing the region', () => {
      render(<MessageList messages={mockMessages} />);
      const container = screen.getByRole('log');
      expect(container).toHaveAttribute('aria-label', 'Chat messages');
    });
  });

  describe('auto-scroll behavior', () => {
    beforeEach(() => {
      // Mock scrollHeight, clientHeight, scrollTop
      Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
        configurable: true,
        value: 1000,
      });
      Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
        configurable: true,
        value: 400,
      });
    });

    it('scrolls to bottom on new messages', () => {
      const scrollIntoViewMock = vi.fn();
      window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

      const { rerender } = render(<MessageList messages={mockMessages} />);

      // Add a new message
      const newMessages = [
        ...mockMessages,
        { id: '4', role: 'assistant' as const, content: 'New message' },
      ];
      rerender(<MessageList messages={newMessages} />);

      // Should have called scrollIntoView
      expect(scrollIntoViewMock).toHaveBeenCalled();
    });

    it('renders message gap between bubbles', () => {
      render(<MessageList messages={mockMessages} />);
      const container = screen.getByRole('log');
      expect(container).toHaveClass('gap-3');
    });
  });

  describe('message content', () => {
    it('passes correct role to MessageBubble', () => {
      render(<MessageList messages={mockMessages} />);
      const userMessages = screen.getAllByLabelText('User message');
      const assistantMessages = screen.getAllByLabelText('Assistant message');
      expect(userMessages).toHaveLength(2);
      expect(assistantMessages).toHaveLength(1);
    });
  });
});
