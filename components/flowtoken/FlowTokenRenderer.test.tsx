import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FlowTokenRenderer } from './FlowTokenRenderer';

// Mock the flowtoken package
// Note: FlowToken uses lowercase HTML custom elements with explicit closing tags
vi.mock('flowtoken', () => ({
  AnimatedMarkdown: vi.fn(({ content, animation, customComponents }) => {
    // Simple mock that renders content and custom components
    // FlowToken lowercases tag names, so we use lowercase keys
    // Match lowercase contactcard with explicit closing tag (HTML custom element format)
    const contactMatch = content.match(
      /<contactcard\s+name="([^"]+)"(?:\s+email="([^"]+)")?(?:\s+phone="([^"]+)")?\s*><\/contactcard>/
    );
    if (contactMatch) {
      const ContactCard = customComponents?.['contactcard'];
      if (ContactCard) {
        const beforeText = content.split(/<contactcard/)[0];
        const afterText = content.split(/<\/contactcard>/)[1] || '';
        return (
          <div data-testid="animated-markdown" data-animation={animation}>
            <span>{beforeText}</span>
            <ContactCard
              name={contactMatch[1]}
              email={contactMatch[2]}
              phone={contactMatch[3]}
            />
            <span>{afterText}</span>
          </div>
        );
      }
    }

    // Match lowercase calendarevent with explicit closing tag (HTML custom element format)
    const calendarMatch = content.match(
      /<calendarevent\s+title="([^"]+)"\s+date="([^"]+)"(?:\s+startTime="([^"]+)")?(?:\s+endTime="([^"]+)")?(?:\s+location="([^"]+)")?\s*><\/calendarevent>/
    );
    if (calendarMatch) {
      const CalendarEvent = customComponents?.['calendarevent'];
      if (CalendarEvent) {
        const beforeText = content.split(/<calendarevent/)[0];
        const afterText = content.split(/<\/calendarevent>/)[1] || '';
        return (
          <div data-testid="animated-markdown" data-animation={animation}>
            <span>{beforeText}</span>
            <CalendarEvent
              title={calendarMatch[1]}
              date={calendarMatch[2]}
              startTime={calendarMatch[3]}
              endTime={calendarMatch[4]}
              location={calendarMatch[5]}
            />
            <span>{afterText}</span>
          </div>
        );
      }
    }

    // Plain markdown - just render content
    return (
      <div data-testid="animated-markdown" data-animation={animation}>
        {content}
      </div>
    );
  }),
}));

describe('FlowTokenRenderer', () => {
  it('renders plain markdown content', () => {
    render(<FlowTokenRenderer content="Hello, this is plain text." />);
    expect(screen.getByText('Hello, this is plain text.')).toBeInTheDocument();
  });

  it('renders ContactCard when XML tag present', () => {
    // Use lowercase with explicit closing tags (HTML custom element format)
    const content = `Here is contact info:

<contactcard name="John Smith" email="john@example.com" phone="+1-555-123-4567"></contactcard>

More text after.`;

    render(<FlowTokenRenderer content={content} />);

    // Verify ContactCard component is rendered
    expect(
      screen.getByRole('group', { name: /contact card for john smith/i })
    ).toBeInTheDocument();
    expect(screen.getByText('John Smith')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('renders CalendarEvent when XML tag present', () => {
    // Use lowercase with explicit closing tags (HTML custom element format)
    const content = `Schedule:

<calendarevent title="Team Meeting" date="2026-01-25" startTime="2:00 PM" endTime="3:00 PM" location="Room A"></calendarevent>

See you there.`;

    render(<FlowTokenRenderer content={content} />);

    // Verify CalendarEvent component is rendered
    expect(
      screen.getByRole('group', { name: /calendar event: team meeting/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('2026-01-25')).toBeInTheDocument();
  });

  it('applies fadeIn animation prop when streaming', () => {
    render(<FlowTokenRenderer content="Streaming content" isStreaming={true} />);
    const markdown = screen.getByTestId('animated-markdown');
    expect(markdown).toHaveAttribute('data-animation', 'fadeIn');
  });

  it('applies null animation when not streaming', () => {
    render(<FlowTokenRenderer content="Complete content" isStreaming={false} />);
    const markdown = screen.getByTestId('animated-markdown');
    expect(markdown.getAttribute('data-animation')).toBeNull();
  });

  it('defaults to not streaming when isStreaming prop not provided', () => {
    render(<FlowTokenRenderer content="Default behavior" />);
    const markdown = screen.getByTestId('animated-markdown');
    expect(markdown.getAttribute('data-animation')).toBeNull();
  });
});
