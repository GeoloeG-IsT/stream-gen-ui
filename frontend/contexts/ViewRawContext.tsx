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
  /** Raw content to display in the side panel */
  rawContent: string | null;
  /** Function to update the raw content */
  setRawContent: (content: string | null) => void;
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
  const [rawContent, setRawContent] = useState<string | null>(null);

  return (
    <ViewRawContext.Provider value={{ viewRaw, setViewRaw, rawContent, setRawContent }}>
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
