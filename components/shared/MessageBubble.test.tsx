import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MessageBubble } from './MessageBubble';

describe('MessageBubble', () => {
  describe('user messages', () => {
    it('renders user message with blue background', () => {
      render(<MessageBubble role="user" content="Hello there" />);
      const bubble = screen.getByText('Hello there').closest('div');
      expect(bubble).toHaveClass('bg-blue-500');
    });

    it('renders user message with white text', () => {
      render(<MessageBubble role="user" content="Hello there" />);
      const bubble = screen.getByText('Hello there').closest('div');
      expect(bubble).toHaveClass('text-white');
    });

    it('renders user message right-aligned', () => {
      render(<MessageBubble role="user" content="Hello there" />);
      const bubble = screen.getByText('Hello there').closest('div');
      expect(bubble).toHaveClass('ml-auto');
    });
  });

  describe('assistant messages', () => {
    it('renders assistant message with light gray background', () => {
      render(<MessageBubble role="assistant" content="Hi! How can I help?" />);
      const bubble = screen.getByText('Hi! How can I help?').closest('div');
      expect(bubble).toHaveClass('bg-white');
    });

    it('renders assistant message with border', () => {
      render(<MessageBubble role="assistant" content="Hi! How can I help?" />);
      const bubble = screen.getByText('Hi! How can I help?').closest('div');
      expect(bubble).toHaveClass('border');
      expect(bubble).toHaveClass('border-gray-200');
    });

    it('renders assistant message left-aligned (no ml-auto)', () => {
      render(<MessageBubble role="assistant" content="Hi! How can I help?" />);
      const bubble = screen.getByText('Hi! How can I help?').closest('div');
      expect(bubble).not.toHaveClass('ml-auto');
    });
  });

  describe('common styling', () => {
    it('has rounded-xl border radius', () => {
      render(<MessageBubble role="user" content="Test" />);
      const bubble = screen.getByText('Test').closest('div');
      expect(bubble).toHaveClass('rounded-xl');
    });

    it('has appropriate padding', () => {
      render(<MessageBubble role="user" content="Test" />);
      const bubble = screen.getByText('Test').closest('div');
      expect(bubble).toHaveClass('p-4');
    });

    it('has max-width of 85%', () => {
      render(<MessageBubble role="user" content="Test" />);
      const bubble = screen.getByText('Test').closest('div');
      expect(bubble).toHaveClass('max-w-[85%]');
    });
  });

  describe('content rendering', () => {
    it('renders message content correctly', () => {
      render(<MessageBubble role="user" content="This is my message" />);
      expect(screen.getByText('This is my message')).toBeInTheDocument();
    });

    it('handles multiline content', () => {
      const multiline = "Line 1\nLine 2\nLine 3";
      render(<MessageBubble role="assistant" content={multiline} />);
      // Use custom matcher to find text with whitespace preserved
      expect(
        screen.getByText((content) => content.includes('Line 1') && content.includes('Line 2'))
      ).toBeInTheDocument();
    });

    it('handles empty content gracefully', () => {
      render(<MessageBubble role="user" content="" />);
      const bubble = screen.getByRole('article');
      expect(bubble).toBeInTheDocument();
    });
  });

  describe('streaming state', () => {
    it('accepts isStreaming prop', () => {
      render(<MessageBubble role="assistant" content="Streaming..." isStreaming />);
      expect(screen.getByText('Streaming...')).toBeInTheDocument();
    });

    it('renders without isStreaming prop', () => {
      render(<MessageBubble role="assistant" content="Complete message" />);
      expect(screen.getByText('Complete message')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has article role', () => {
      render(<MessageBubble role="user" content="Test" />);
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('has aria-label indicating message role', () => {
      render(<MessageBubble role="user" content="Test" />);
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-label', 'User message');
    });

    it('has correct aria-label for assistant', () => {
      render(<MessageBubble role="assistant" content="Test" />);
      const article = screen.getByRole('article');
      expect(article).toHaveAttribute('aria-label', 'Assistant message');
    });
  });
});
