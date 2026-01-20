import type { ReactElement } from 'react';

import { Send } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ChatInputProps } from '@/types';

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading,
}: ChatInputProps): ReactElement {
  const isDisabled = isLoading || !value.trim();

  return (
    <form
      role="form"
      onSubmit={onSubmit}
      className={cn(
        'sticky bottom-0 bg-white border-t border-gray-200',
        'p-4 flex gap-2'
      )}
    >
      <input
        type="text"
        value={value}
        onChange={onChange}
        disabled={isLoading}
        placeholder="Type a message..."
        aria-label="Message input"
        className={cn(
          'flex-1 rounded-lg border border-gray-300 p-3',
          'text-gray-800 placeholder-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent',
          'disabled:bg-gray-100 disabled:cursor-not-allowed'
        )}
      />
      <button
        type="submit"
        disabled={isDisabled}
        aria-label="Send message"
        className={cn(
          'p-3 rounded-lg bg-blue-500 text-white',
          'hover:bg-blue-600 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-blue-400',
          'disabled:bg-gray-300 disabled:cursor-not-allowed'
        )}
      >
        <Send className="w-5 h-5" aria-hidden="true" />
      </button>
    </form>
  );
}
