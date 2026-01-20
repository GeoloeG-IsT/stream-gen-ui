import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { PresetSelector } from './PresetSelector';

describe('PresetSelector', () => {
  describe('rendering', () => {
    it('renders all preset buttons', () => {
      const onSelect = vi.fn();
      render(<PresetSelector onSelect={onSelect} />);

      // Buttons have aria-labels like 'Send "Show me a contact"'
      expect(screen.getByLabelText(/send "show me a contact"/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/send "schedule a meeting"/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/send "show me everything"/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/send "just text please"/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/send "show multiple items"/i)).toBeInTheDocument();
    });

    it('renders visible button labels', () => {
      const onSelect = vi.fn();
      render(<PresetSelector onSelect={onSelect} />);

      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText('Calendar')).toBeInTheDocument();
      expect(screen.getByText('Both')).toBeInTheDocument();
      expect(screen.getByText('Text Only')).toBeInTheDocument();
      expect(screen.getByText('Multiple')).toBeInTheDocument();
    });

    it('renders with "Try:" label', () => {
      const onSelect = vi.fn();
      render(<PresetSelector onSelect={onSelect} />);

      expect(screen.getByText('Try:')).toBeInTheDocument();
    });

    it('has proper group aria-label', () => {
      const onSelect = vi.fn();
      render(<PresetSelector onSelect={onSelect} />);

      expect(screen.getByRole('group', { name: /content presets/i })).toBeInTheDocument();
    });
  });

  describe('interaction', () => {
    it('calls onSelect with correct message when Contact is clicked', () => {
      const onSelect = vi.fn();
      render(<PresetSelector onSelect={onSelect} />);

      fireEvent.click(screen.getByLabelText(/send "show me a contact"/i));

      expect(onSelect).toHaveBeenCalledWith('Show me a contact');
    });

    it('calls onSelect with correct message when Calendar is clicked', () => {
      const onSelect = vi.fn();
      render(<PresetSelector onSelect={onSelect} />);

      fireEvent.click(screen.getByLabelText(/send "schedule a meeting"/i));

      expect(onSelect).toHaveBeenCalledWith('Schedule a meeting');
    });

    it('calls onSelect with correct message when Both is clicked', () => {
      const onSelect = vi.fn();
      render(<PresetSelector onSelect={onSelect} />);

      fireEvent.click(screen.getByLabelText(/send "show me everything"/i));

      expect(onSelect).toHaveBeenCalledWith('Show me everything');
    });

    it('calls onSelect with correct message when Text Only is clicked', () => {
      const onSelect = vi.fn();
      render(<PresetSelector onSelect={onSelect} />);

      fireEvent.click(screen.getByLabelText(/send "just text please"/i));

      expect(onSelect).toHaveBeenCalledWith('Just text please');
    });

    it('calls onSelect with correct message when Multiple is clicked', () => {
      const onSelect = vi.fn();
      render(<PresetSelector onSelect={onSelect} />);

      fireEvent.click(screen.getByLabelText(/send "show multiple items"/i));

      expect(onSelect).toHaveBeenCalledWith('Show multiple items');
    });
  });

  describe('disabled state', () => {
    it('disables all buttons when disabled prop is true', () => {
      const onSelect = vi.fn();
      render(<PresetSelector onSelect={onSelect} disabled />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('does not call onSelect when disabled button is clicked', () => {
      const onSelect = vi.fn();
      render(<PresetSelector onSelect={onSelect} disabled />);

      fireEvent.click(screen.getByLabelText(/send "show me a contact"/i));

      expect(onSelect).not.toHaveBeenCalled();
    });

    it('enables buttons when disabled is false', () => {
      const onSelect = vi.fn();
      render(<PresetSelector onSelect={onSelect} disabled={false} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).not.toBeDisabled();
      });
    });
  });

  describe('accessibility', () => {
    it('each button has an aria-label with the message to send', () => {
      const onSelect = vi.fn();
      render(<PresetSelector onSelect={onSelect} />);

      expect(screen.getByLabelText(/send "show me a contact"/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/send "schedule a meeting"/i)).toBeInTheDocument();
    });

    it('icons are hidden from screen readers', () => {
      const onSelect = vi.fn();
      const { container } = render(<PresetSelector onSelect={onSelect} />);

      const icons = container.querySelectorAll('svg');
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });
});
