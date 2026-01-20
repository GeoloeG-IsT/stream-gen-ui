import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CalendarEvent } from './CalendarEvent';

describe('CalendarEvent', () => {
  it('renders title correctly', () => {
    render(<CalendarEvent title="Team Meeting" date="January 20, 2026" />);
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
  });

  it('renders date correctly', () => {
    render(<CalendarEvent title="Team Meeting" date="January 20, 2026" />);
    expect(screen.getByText('January 20, 2026')).toBeInTheDocument();
  });

  it('renders startTime only when endTime not provided', () => {
    render(
      <CalendarEvent title="Team Meeting" date="January 20, 2026" startTime="2:00 PM" />
    );
    expect(screen.getByText('2:00 PM')).toBeInTheDocument();
  });

  it('renders time range when both startTime and endTime provided', () => {
    render(
      <CalendarEvent
        title="Team Meeting"
        date="January 20, 2026"
        startTime="2:00 PM"
        endTime="3:00 PM"
      />
    );
    expect(screen.getByText('2:00 PM - 3:00 PM')).toBeInTheDocument();
  });

  it('renders location when provided', () => {
    render(
      <CalendarEvent
        title="Team Meeting"
        date="January 20, 2026"
        location="Conference Room A"
      />
    );
    expect(screen.getByText('Conference Room A')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <CalendarEvent
        title="Team Meeting"
        date="January 20, 2026"
        description="Quarterly planning session"
      />
    );
    expect(screen.getByText('Quarterly planning session')).toBeInTheDocument();
  });

  it('has correct aria-label on container', () => {
    render(<CalendarEvent title="Team Meeting" date="January 20, 2026" />);
    expect(screen.getByRole('group')).toHaveAttribute(
      'aria-label',
      'Calendar event: Team Meeting'
    );
  });

  it('applies shadow-md class', () => {
    render(<CalendarEvent title="Team Meeting" date="January 20, 2026" />);
    const container = screen.getByRole('group');
    expect(container.className).toContain('shadow-md');
  });

  it('renders all event details together', () => {
    render(
      <CalendarEvent
        title="Annual Review"
        date="February 15, 2026"
        startTime="10:00 AM"
        endTime="11:30 AM"
        location="Board Room"
        description="Year-end performance review"
      />
    );
    expect(screen.getByText('Annual Review')).toBeInTheDocument();
    expect(screen.getByText('February 15, 2026')).toBeInTheDocument();
    expect(screen.getByText('10:00 AM - 11:30 AM')).toBeInTheDocument();
    expect(screen.getByText('Board Room')).toBeInTheDocument();
    expect(screen.getByText('Year-end performance review')).toBeInTheDocument();
  });

  it('does not render time section when no time provided', () => {
    render(<CalendarEvent title="All Day Event" date="March 1, 2026" />);
    // Should only have the date, not a time entry
    const timeLabel = screen.queryByLabelText(/time:/i);
    expect(timeLabel).not.toBeInTheDocument();
  });
});
