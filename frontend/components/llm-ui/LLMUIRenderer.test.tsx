import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { LLMUIRenderer } from './LLMUIRenderer';

// Mock the @llm-ui/react package
vi.mock('@llm-ui/react', () => ({
  useLLMOutput: vi.fn(({ llmOutput, blocks, fallbackBlock, isStreamFinished }) => {
    // Parse the content and identify blocks based on delimiters
    const blockMatches: Array<{
      block: { component: React.FC<{ blockMatch: unknown }> };
      output: string;
      outputRaw: string;
      visibleText: string;
      startIndex: number;
      endIndex: number;
      isVisible: boolean;
      isComplete: boolean;
      priority: number;
      llmOutput: string;
    }> = [];

    let remainingOutput = llmOutput;
    let currentIndex = 0;

    // Process the content looking for delimiter blocks
    while (remainingOutput.length > 0) {
      // Check for CONTACT block
      const contactMatch = remainingOutput.match(/【CONTACT:(\{[\s\S]*?\})】/);
      const calendarMatch = remainingOutput.match(/【CALENDAR:(\{[\s\S]*?\})】/);

      let firstMatch: { type: string; match: RegExpMatchArray; block: typeof blocks[number] } | null = null;

      if (contactMatch && contactMatch.index !== undefined) {
        if (!calendarMatch || (calendarMatch.index !== undefined && contactMatch.index <= calendarMatch.index)) {
          firstMatch = { type: 'CONTACT', match: contactMatch, block: blocks[0] };
        }
      }

      if (calendarMatch && calendarMatch.index !== undefined) {
        if (!contactMatch || (contactMatch.index !== undefined && calendarMatch.index < contactMatch.index)) {
          firstMatch = { type: 'CALENDAR', match: calendarMatch, block: blocks[1] };
        }
      }

      if (firstMatch && firstMatch.match.index !== undefined) {
        // Add text before the match as fallback block
        if (firstMatch.match.index > 0) {
          const textBefore = remainingOutput.slice(0, firstMatch.match.index);
          if (textBefore.trim()) {
            blockMatches.push({
              block: fallbackBlock,
              output: textBefore,
              outputRaw: textBefore,
              visibleText: textBefore,
              startIndex: currentIndex,
              endIndex: currentIndex + textBefore.length,
              isVisible: true,
              isComplete: true,
              priority: 0,
              llmOutput,
            });
          }
          currentIndex += textBefore.length;
        }

        // Add the component block
        const fullMatch = firstMatch.match[0];
        blockMatches.push({
          block: firstMatch.block,
          output: fullMatch,
          outputRaw: fullMatch,
          visibleText: '',
          startIndex: currentIndex,
          endIndex: currentIndex + fullMatch.length,
          isVisible: true,
          isComplete: true,
          priority: 1,
          llmOutput,
        });

        currentIndex += fullMatch.length;
        remainingOutput = remainingOutput.slice(firstMatch.match.index + fullMatch.length);
      } else {
        // No more delimiter blocks, add remaining as fallback
        if (remainingOutput.trim()) {
          blockMatches.push({
            block: fallbackBlock,
            output: remainingOutput,
            outputRaw: remainingOutput,
            visibleText: remainingOutput,
            startIndex: currentIndex,
            endIndex: currentIndex + remainingOutput.length,
            isVisible: true,
            isComplete: true,
            priority: 0,
            llmOutput,
          });
        }
        break;
      }
    }

    return {
      blockMatches,
      isFinished: isStreamFinished,
      finishCount: 0,
      visibleText: llmOutput,
      restart: vi.fn(),
    };
  }),
}));

// Mock react-markdown
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => (
    <div data-testid="markdown">{children}</div>
  ),
}));

/**
 * NOTE: These tests mock useLLMOutput to verify component behavior.
 * The mock simulates the llm-ui library's block matching logic.
 *
 * The actual block matchers (findCompleteMatch, findPartialMatch, lookBack)
 * are defined in the component but tested indirectly through integration.
 * For complete coverage, consider E2E tests with real llm-ui library.
 */
describe('LLMUIRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CONTACT delimiter parsing', () => {
    it('renders ContactCard when CONTACT delimiter is present', () => {
      const content = `Here is contact info:

【CONTACT:{"name":"John Smith","email":"john@example.com","phone":"+1-555-123-4567"}】

More text after.`;

      render(<LLMUIRenderer content={content} />);

      // Verify ContactCard is rendered with parsed props
      expect(
        screen.getByRole('group', { name: /contact card for john smith/i })
      ).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('+1-555-123-4567')).toBeInTheDocument();
    });

    it('renders ContactCard with minimal props (name only)', () => {
      const content = '【CONTACT:{"name":"Jane Doe"}】';

      render(<LLMUIRenderer content={content} />);

      expect(
        screen.getByRole('group', { name: /contact card for jane doe/i })
      ).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
  });

  describe('CALENDAR delimiter parsing', () => {
    it('renders CalendarEvent when CALENDAR delimiter is present', () => {
      const content = `Schedule:

【CALENDAR:{"title":"Team Meeting","date":"2026-01-25","startTime":"2:00 PM","endTime":"3:00 PM","location":"Room A"}】

See you there.`;

      render(<LLMUIRenderer content={content} />);

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
      const content = '【CALENDAR:{"title":"Quick Call","date":"2026-02-01"}】';

      render(<LLMUIRenderer content={content} />);

      expect(
        screen.getByRole('group', { name: /calendar event: quick call/i })
      ).toBeInTheDocument();
      expect(screen.getByText('Quick Call')).toBeInTheDocument();
      expect(screen.getByText('2026-02-01')).toBeInTheDocument();
    });
  });

  describe('mixed content handling', () => {
    it('renders text before and after component blocks', () => {
      const content = `Hello, here is the info:

【CONTACT:{"name":"John Smith","email":"john@example.com"}】

Thanks for asking!`;

      render(<LLMUIRenderer content={content} />);

      // Check text content is rendered
      expect(screen.getByText(/Hello, here is the info:/)).toBeInTheDocument();
      expect(screen.getByText(/Thanks for asking!/)).toBeInTheDocument();

      // Check component is also rendered
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });

    it('renders multiple different components in sequence', () => {
      const content = `Contact:

【CONTACT:{"name":"John Smith","email":"john@example.com"}】

Meeting:

【CALENDAR:{"title":"Sync","date":"2026-01-30"}】

Done.`;

      render(<LLMUIRenderer content={content} />);

      // Both components should be rendered
      expect(
        screen.getByRole('group', { name: /contact card for john smith/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('group', { name: /calendar event: sync/i })
      ).toBeInTheDocument();
    });
  });

  describe('malformed delimiter handling', () => {
    it('renders raw text for malformed JSON in delimiter', () => {
      const content = '【CONTACT:{invalid json here}】';

      render(<LLMUIRenderer content={content} />);

      // Should render the raw delimiter as span (graceful fallback)
      expect(screen.getByText('【CONTACT:{invalid json here}】')).toBeInTheDocument();
    });

    it('handles incomplete delimiter during streaming gracefully', () => {
      // Incomplete delimiter (no closing bracket)
      const content = 'Starting message 【CONTACT:{"name":"John"';

      render(<LLMUIRenderer content={content} isStreaming={true} />);

      // Should render what it can without crashing
      expect(screen.getByText(/Starting message/)).toBeInTheDocument();
    });
  });

  describe('markdown rendering for plain text', () => {
    it('renders plain text through markdown fallback', () => {
      render(<LLMUIRenderer content="Hello, this is plain text with **bold**." />);

      // Check that markdown component is used
      expect(screen.getByTestId('markdown')).toBeInTheDocument();
      expect(screen.getByText(/Hello, this is plain text with \*\*bold\*\*/)).toBeInTheDocument();
    });

    it('renders multiline markdown content', () => {
      const content = `# Heading

This is a paragraph.

- List item 1
- List item 2`;

      render(<LLMUIRenderer content={content} />);

      expect(screen.getByTestId('markdown')).toBeInTheDocument();
    });
  });

  describe('streaming state', () => {
    it('defaults isStreaming to false', () => {
      render(<LLMUIRenderer content="Test content" />);
      // Component should render without error
      expect(screen.getByText(/Test content/)).toBeInTheDocument();
    });

    it('handles isStreaming=true', () => {
      render(<LLMUIRenderer content="Streaming content" isStreaming={true} />);
      expect(screen.getByText(/Streaming content/)).toBeInTheDocument();
    });

    it('handles isStreaming=false explicitly', () => {
      render(<LLMUIRenderer content="Complete content" isStreaming={false} />);
      expect(screen.getByText(/Complete content/)).toBeInTheDocument();
    });
  });

  describe('error boundary', () => {
    it('wraps content in error boundary for graceful degradation', () => {
      // The error boundary should exist and content should render
      const content = 'Simple text content';
      render(<LLMUIRenderer content={content} />);

      // Verify the llm-ui-output container is present
      const output = document.querySelector('.llm-ui-output');
      expect(output).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA attributes on output container', () => {
      render(<LLMUIRenderer content="Test content" />);

      const output = document.querySelector('.llm-ui-output');
      expect(output).toHaveAttribute('role', 'region');
      expect(output).toHaveAttribute('aria-label', 'LLM generated content');
    });
  });

  describe('memoization', () => {
    it('is wrapped in React.memo for performance', () => {
      // LLMUIRenderer should be a memoized component
      // This is verified by the component's displayName or type
      expect(LLMUIRenderer).toBeDefined();
      // memo wraps the component, so it should have a $$typeof symbol
      expect(typeof LLMUIRenderer).toBe('object');
    });
  });
});
