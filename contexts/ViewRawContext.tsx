'use client';

import { createContext, useContext, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';

/**
 * Context value for ViewRaw state
 */
interface ViewRawContextValue {
  /** Whether raw output view is enabled */
  viewRaw: boolean;
  /** Function to update the viewRaw state */
  setViewRaw: (value: boolean) => void;
}

const ViewRawContext = createContext<ViewRawContextValue | undefined>(undefined);

/**
 * Props for ViewRawProvider component
 */
interface ViewRawProviderProps {
  children: ReactNode;
}

/**
 * Provider component for ViewRaw context.
 * Provides global state for the "View Raw" toggle that persists across route changes.
 */
export function ViewRawProvider({ children }: ViewRawProviderProps): ReactElement {
  const [viewRaw, setViewRaw] = useState(false);

  return (
    <ViewRawContext.Provider value={{ viewRaw, setViewRaw }}>
      {children}
    </ViewRawContext.Provider>
  );
}

/**
 * Hook to access the ViewRaw context.
 * Must be used within a ViewRawProvider.
 * @throws Error if used outside of ViewRawProvider
 */
export function useViewRaw(): ViewRawContextValue {
  const context = useContext(ViewRawContext);
  if (!context) {
    throw new Error('useViewRaw must be used within a ViewRawProvider');
  }
  return context;
}
