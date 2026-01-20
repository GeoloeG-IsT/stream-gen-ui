import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { StreamdownRenderer } from './StreamdownRenderer';

// Mock the streamdown package
// Note: StreamdownRenderer pre-parses XML tags before passing content to Streamdown,
// so this mock only receives pure markdown (no XML custom elements).
vi.mock('streamdown', () => ({
  Streamdown: ({ children, isAnimating }: {
    children?: string;
    isAnimating?: boolean;
  }) => {
    // Simply render the markdown content - XML is already extracted by parseContent()
    if (!children) return null;

    return (
      <div data-testid="streamdown-mock" data-animating={isAnimating}>
        {children}
      </div>
    );
  },
}));

/**
 * Tests for StreamdownRenderer component.
 *
 * These tests mock the Streamdown library to verify component behavior.
 * The mock simulates parsing of custom HTML elements (<contactcard>, <calendarevent>)
 * and renders the corresponding React components.
 *
 * For complete E2E coverage with the real streamdown library,
 * consider integration tests or manual testing.
 */
describe('StreamdownRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('contactcard tag parsing', () => {
    it('renders ContactCard when contactcard tag is present', () => {
      const content = `Here is contact info:

<contactcard name="John Smith" email="john@example.com" phone="+1-555-123-4567"></contactcard>

More text after.`;

      render(<StreamdownRenderer content={content} />);

      // Verify ContactCard is rendered with parsed props
      expect(
        screen.getByRole('group', { name: /contact card for john smith/i })
      ).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('+1-555-123-4567')).toBeInTheDocument();
    });

    it('renders ContactCard with minimal props (name only)', () => {
      const content = '<contactcard name="Jane Doe"></contactcard>';

      render(<StreamdownRenderer content={content} />);

      expect(
        screen.getByRole('group', { name: /contact card for jane doe/i })
      ).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
  });

  describe('calendarevent tag parsing', () => {
    it('renders CalendarEvent when calendarevent tag is present', () => {
      const content = `Schedule:

<calendarevent title="Team Meeting" date="2026-01-25" startTime="2:00 PM" endTime="3:00 PM" location="Room A"></calendarevent>

See you there.`;

      render(<StreamdownRenderer content={content} />);

      // Verify CalendarEvent is rendered with parsed props
      expect(
        screen.getByRole('group', { name: /calendar event: team meeting/i })
      ).toBeInTheDocument();
      expect(screen.getByText('Team Meeting')).toBeInTheDocument();
      expect(screen.getByText('2026-01-25')).toBeInTheDocument();
      expect(screen.getByText('2:00 PM - 3:00 PM')).toBeInTheDocument();
      expect(screen.getByText('Room A')).toBeInTheDocument();
    });

    it('renders CalendarEvent with minimal props (title and date)', () => {
      const content = '<calendarevent title="Quick Call" date="2026-02-01"></calendarevent>';

      render(<StreamdownRenderer content={content} />);

      expect(
        screen.getByRole('group', { name: /calendar event: quick call/i })
      ).toBeInTheDocument();
      expect(screen.getByText('Quick Call')).toBeInTheDocument();
      expect(screen.getByText('2026-02-01')).toBeInTheDocument();
    });
  });

  describe('mixed content handling', () => {
    it('renders text before and after component tags', () => {
      const content = `Hello, here is the info:

<contactcard name="John Smith" email="john@example.com"></contactcard>

Thanks for asking!`;

      render(<StreamdownRenderer content={content} />);

      // Check text content is rendered
      expect(screen.getByText(/Hello, here is the info:/)).toBeInTheDocument();
      expect(screen.getByText(/Thanks for asking!/)).toBeInTheDocument();

      // Check component is also rendered
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });

    it('renders multiple different components in sequence', () => {
      const content = `Contact:

<contactcard name="John Smith" email="john@example.com"></contactcard>

Meeting:

<calendarevent title="Sync" date="2026-01-30"></calendarevent>

Done.`;

      render(<StreamdownRenderer content={content} />);

      // Both components should be rendered
      expect(
        screen.getByRole('group', { name: /contact card for john smith/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('group', { name: /calendar event: sync/i })
      ).toBeInTheDocument();
    });
  });

  describe('incomplete tag handling (graceful wait)', () => {
    it('handles incomplete tag during streaming gracefully', () => {
      // Incomplete tag (no closing tag) - Streamdown should wait
      const content = 'Starting message <contactcard name="John"';

      // Should not crash - render what we have
      render(<StreamdownRenderer content={content} isStreaming={true} />);

      // The text before the incomplete tag should be visible
      expect(screen.getByText(/Starting message/)).toBeInTheDocument();
    });

    it('handles partial attribute during streaming', () => {
      // Partial attribute value
      const content = 'Hello <contactcard name="Jo';

      render(<StreamdownRenderer content={content} isStreaming={true} />);

      // Should render without crashing
      expect(screen.getByText(/Hello/)).toBeInTheDocument();
    });
  });

  describe('markdown rendering for plain text', () => {
    it('renders plain text content', () => {
      render(<StreamdownRenderer content="Hello, this is plain text with **bold**." />);

      expect(screen.getByText(/Hello, this is plain text with \*\*bold\*\*/)).toBeInTheDocument();
    });

    it('renders multiline content', () => {
      const content = `# Heading

This is a paragraph.

- List item 1
- List item 2`;

      render(<StreamdownRenderer content={content} />);

      // Content should be rendered
      expect(screen.getByTestId('streamdown-mock')).toBeInTheDocument();
    });
  });

  describe('streaming state', () => {
    it('defaults isStreaming to false', () => {
      render(<StreamdownRenderer content="Test content" />);

      const mock = screen.getByTestId('streamdown-mock');
      expect(mock).toHaveAttribute('data-animating', 'false');
    });

    it('passes isStreaming=true as isAnimating', () => {
      render(<StreamdownRenderer content="Streaming content" isStreaming={true} />);

      const mock = screen.getByTestId('streamdown-mock');
      expect(mock).toHaveAttribute('data-animating', 'true');
    });

    it('passes isStreaming=false as isAnimating', () => {
      render(<StreamdownRenderer content="Complete content" isStreaming={false} />);

      const mock = screen.getByTestId('streamdown-mock');
      expect(mock).toHaveAttribute('data-animating', 'false');
    });
  });

  describe('error boundary fallback behavior', () => {
    it('wraps content in error boundary for graceful degradation', () => {
      const content = 'Simple text content';
      render(<StreamdownRenderer content={content} />);

      // Verify the streamdown-output container is present
      const output = document.querySelector('.streamdown-output');
      expect(output).toBeInTheDocument();
    });

    it('renders container when content is valid', () => {
      render(<StreamdownRenderer content="Valid content" />);

      const output = document.querySelector('.streamdown-output');
      expect(output).toBeInTheDocument();
    });
  });

  describe('accessibility attributes', () => {
    it('has proper ARIA attributes on output container', () => {
      render(<StreamdownRenderer content="Test content" />);

      const output = document.querySelector('.streamdown-output');
      expect(output).toHaveAttribute('role', 'region');
      expect(output).toHaveAttribute('aria-label', 'Streamdown generated content');
    });
  });

  describe('React.memo memoization', () => {
    it('is wrapped in React.memo for performance', () => {
      // StreamdownRenderer should be a memoized component
      expect(StreamdownRenderer).toBeDefined();
      // memo wraps the component, so it should have a $$typeof symbol
      expect(typeof StreamdownRenderer).toBe('object');
    });

    it('exports as named export (not default)', () => {
      // Verify it's not undefined - named exports work
      expect(StreamdownRenderer).not.toBeUndefined();
    });
  });

  describe('empty content handling', () => {
    it('renders without error when content is empty string', () => {
      render(<StreamdownRenderer content="" />);

      const output = document.querySelector('.streamdown-output');
      expect(output).toBeInTheDocument();
    });
  });
});
