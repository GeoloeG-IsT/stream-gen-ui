import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ViewRawProvider, useViewRaw } from './ViewRawContext';

// Test component that uses the context
function TestConsumer(): React.ReactElement {
  const { viewRaw, setViewRaw } = useViewRaw();
  return (
    <div>
      <span data-testid="view-raw-value">{viewRaw ? 'ON' : 'OFF'}</span>
      <button onClick={() => setViewRaw(true)} data-testid="turn-on">
        Turn On
      </button>
      <button onClick={() => setViewRaw(false)} data-testid="turn-off">
        Turn Off
      </button>
      <button onClick={() => setViewRaw(!viewRaw)} data-testid="toggle">
        Toggle
      </button>
    </div>
  );
}

describe('ViewRawContext', () => {
  describe('ViewRawProvider', () => {
    it('provides default value of false', () => {
      render(
        <ViewRawProvider>
          <TestConsumer />
        </ViewRawProvider>
      );
      expect(screen.getByTestId('view-raw-value')).toHaveTextContent('OFF');
    });

    it('allows setting viewRaw to true', () => {
      render(
        <ViewRawProvider>
          <TestConsumer />
        </ViewRawProvider>
      );
      fireEvent.click(screen.getByTestId('turn-on'));
      expect(screen.getByTestId('view-raw-value')).toHaveTextContent('ON');
    });

    it('allows setting viewRaw to false', () => {
      render(
        <ViewRawProvider>
          <TestConsumer />
        </ViewRawProvider>
      );
      fireEvent.click(screen.getByTestId('turn-on'));
      fireEvent.click(screen.getByTestId('turn-off'));
      expect(screen.getByTestId('view-raw-value')).toHaveTextContent('OFF');
    });

    it('allows toggling viewRaw', () => {
      render(
        <ViewRawProvider>
          <TestConsumer />
        </ViewRawProvider>
      );
      expect(screen.getByTestId('view-raw-value')).toHaveTextContent('OFF');
      fireEvent.click(screen.getByTestId('toggle'));
      expect(screen.getByTestId('view-raw-value')).toHaveTextContent('ON');
      fireEvent.click(screen.getByTestId('toggle'));
      expect(screen.getByTestId('view-raw-value')).toHaveTextContent('OFF');
    });

    it('shares state between multiple consumers', () => {
      function MultipleConsumers(): React.ReactElement {
        return (
          <>
            <div data-testid="consumer-1">
              <TestConsumer />
            </div>
            <div data-testid="consumer-2">
              <TestConsumer />
            </div>
          </>
        );
      }

      render(
        <ViewRawProvider>
          <MultipleConsumers />
        </ViewRawProvider>
      );

      const consumer1 = screen.getByTestId('consumer-1');
      const consumer2 = screen.getByTestId('consumer-2');

      // Both start OFF
      expect(
        consumer1.querySelector('[data-testid="view-raw-value"]')
      ).toHaveTextContent('OFF');
      expect(
        consumer2.querySelector('[data-testid="view-raw-value"]')
      ).toHaveTextContent('OFF');

      // Toggle from consumer 1
      fireEvent.click(consumer1.querySelector('[data-testid="toggle"]')!);

      // Both should now be ON
      expect(
        consumer1.querySelector('[data-testid="view-raw-value"]')
      ).toHaveTextContent('ON');
      expect(
        consumer2.querySelector('[data-testid="view-raw-value"]')
      ).toHaveTextContent('ON');
    });

    it('wraps children correctly', () => {
      render(
        <ViewRawProvider>
          <div data-testid="child">Child content</div>
        </ViewRawProvider>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('useViewRaw', () => {
    it('throws error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = () => {};

      expect(() => {
        render(<TestConsumer />);
      }).toThrow('useViewRaw must be used within a ViewRawProvider');

      console.error = originalError;
    });
  });
});
