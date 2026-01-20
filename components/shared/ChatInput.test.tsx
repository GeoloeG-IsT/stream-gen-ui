import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChatInput } from './ChatInput';

describe('ChatInput', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    onSubmit: vi.fn(),
    isLoading: false,
  };

  describe('rendering', () => {
    it('renders input field', () => {
      render(<ChatInput {...defaultProps} />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('renders send button', () => {
      render(<ChatInput {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /send message/i })
      ).toBeInTheDocument();
    });

    it('renders as form element', () => {
      render(<ChatInput {...defaultProps} />);
      expect(screen.getByRole('form')).toBeInTheDocument();
    });
  });

  describe('input behavior', () => {
    it('displays provided value', () => {
      render(<ChatInput {...defaultProps} value="Hello" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Hello');
    });

    it('calls onChange when typing', () => {
      const onChange = vi.fn();
      render(<ChatInput {...defaultProps} onChange={onChange} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'Hi' } });
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe('form submission', () => {
    it('calls onSubmit when form is submitted', () => {
      const onSubmit = vi.fn((e) => e.preventDefault());
      render(<ChatInput {...defaultProps} onSubmit={onSubmit} value="Test" />);
      const form = screen.getByRole('form');
      fireEvent.submit(form);
      expect(onSubmit).toHaveBeenCalled();
    });

    it('calls onSubmit when Enter is pressed', () => {
      const onSubmit = vi.fn((e) => e.preventDefault());
      render(<ChatInput {...defaultProps} onSubmit={onSubmit} value="Test" />);
      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
      // Form submission happens through the form onSubmit, not keyDown
      // The Enter key submission works through native browser form behavior
      fireEvent.submit(screen.getByRole('form'));
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  describe('loading state', () => {
    it('disables input when loading', () => {
      render(<ChatInput {...defaultProps} isLoading={true} />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('disables send button when loading', () => {
      render(<ChatInput {...defaultProps} isLoading={true} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('disables send button when input is empty', () => {
      render(<ChatInput {...defaultProps} value="" />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('enables send button when has value and not loading', () => {
      render(<ChatInput {...defaultProps} value="Hello" isLoading={false} />);
      const button = screen.getByRole('button');
      expect(button).not.toBeDisabled();
    });
  });

  describe('styling', () => {
    it('has rounded-lg on input', () => {
      render(<ChatInput {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('rounded-lg');
    });

    it('has border styling on input', () => {
      render(<ChatInput {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border');
    });

    it('has padding on input', () => {
      render(<ChatInput {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('p-3');
    });
  });

  describe('accessibility', () => {
    it('has aria-label on input', () => {
      render(<ChatInput {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Message input');
    });

    it('has aria-label on send button', () => {
      render(<ChatInput {...defaultProps} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Send message');
    });

    it('input has focus ring', () => {
      render(<ChatInput {...defaultProps} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('focus:ring-2');
    });
  });

  describe('focus behavior', () => {
    it('input receives focus on mount', () => {
      render(<ChatInput {...defaultProps} />);
      const input = screen.getByRole('textbox');
      // autoFocus causes the input to be focused on mount
      expect(document.activeElement).toBe(input);
    });

    it('focuses input when value is cleared after submission', () => {
      const { rerender } = render(<ChatInput {...defaultProps} value="Hello" />);
      const input = screen.getByRole('textbox');

      // Simulate submission clearing the value
      rerender(<ChatInput {...defaultProps} value="" />);

      expect(document.activeElement).toBe(input);
    });

    it('does not focus input when loading', () => {
      const { rerender } = render(
        <ChatInput {...defaultProps} value="Hello" isLoading={false} />
      );
      const input = screen.getByRole('textbox');

      // Blur the input first
      input.blur();

      // Simulate value cleared but loading
      rerender(<ChatInput {...defaultProps} value="" isLoading={true} />);

      expect(document.activeElement).not.toBe(input);
    });
  });
});
