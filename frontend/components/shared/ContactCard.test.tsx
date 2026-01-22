import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ContactCard } from './ContactCard';

describe('ContactCard', () => {
  it('renders name correctly', () => {
    render(<ContactCard name="John Doe" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders email as mailto link', () => {
    render(<ContactCard name="John Doe" email="john@example.com" />);
    const emailLink = screen.getByRole('link', { name: /email john doe/i });
    expect(emailLink).toHaveAttribute('href', 'mailto:john@example.com');
  });

  it('renders phone as tel link', () => {
    render(<ContactCard name="John Doe" phone="+1-555-123-4567" />);
    const phoneLink = screen.getByRole('link', { name: /call john doe/i });
    expect(phoneLink).toHaveAttribute('href', 'tel:+1-555-123-4567');
  });

  it('renders address when provided', () => {
    render(<ContactCard name="John Doe" address="123 Main St, City" />);
    expect(screen.getByText('123 Main St, City')).toBeInTheDocument();
  });

  it('has correct aria-label on container', () => {
    render(<ContactCard name="John Doe" />);
    expect(screen.getByRole('group')).toHaveAttribute(
      'aria-label',
      'Contact card for John Doe'
    );
  });

  it('applies shadow-md class', () => {
    render(<ContactCard name="John Doe" />);
    const container = screen.getByRole('group');
    expect(container.className).toContain('shadow-md');
  });

  it('renders all contact details together', () => {
    render(
      <ContactCard
        name="Jane Smith"
        email="jane@example.com"
        phone="+1-555-987-6543"
        address="456 Oak Ave, Town"
      />
    );
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('+1-555-987-6543')).toBeInTheDocument();
    expect(screen.getByText('456 Oak Ave, Town')).toBeInTheDocument();
  });
});
