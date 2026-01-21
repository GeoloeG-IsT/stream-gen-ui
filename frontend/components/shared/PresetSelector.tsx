'use client';

import type { ReactElement } from 'react';

import { User, Calendar, HelpCircle, Sparkles, Rocket } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { PresetSelectorProps, PresetOption } from '@/types';

/**
 * Available content presets with their trigger messages
 * Designed to test different response scenarios for Berlin city assistant
 */
const PRESET_OPTIONS: PresetOption[] = [
  {
    id: 'no-results',
    label: 'No results',
    message: 'Who handles penguin complaints in Berlin?',
    icon: 'help-circle',
  },
  {
    id: 'contacts',
    label: 'Contacts',
    message: 'Who works in the Parks department?',
    icon: 'user',
  },
  {
    id: 'events',
    label: 'Events',
    message: 'What events are happening this month?',
    icon: 'calendar',
  },
  {
    id: 'both',
    label: 'Both',
    message: 'Tell me about the culture department and their upcoming events',
    icon: 'sparkles',
  },
  {
    id: 'out-of-scope',
    label: 'Off-topic',
    message: 'Can you help me debug my mass spectrometer?',
    icon: 'rocket',
  },
];

/**
 * Icon component mapping
 */
const ICONS: Record<string, typeof User> = {
  user: User,
  calendar: Calendar,
  'help-circle': HelpCircle,
  sparkles: Sparkles,
  rocket: Rocket,
};

/**
 * PresetSelector displays buttons for quick content preset selection
 */
export function PresetSelector({
  onSelect,
  disabled = false,
}: PresetSelectorProps): ReactElement {
  return (
    <div
      className="flex flex-wrap gap-2 px-4 py-2 border-t border-gray-200 bg-gray-50"
      role="group"
      aria-label="Content presets"
    >
      <span className="text-xs text-gray-500 self-center mr-1">Try:</span>
      {PRESET_OPTIONS.map((preset) => {
        const IconComponent = preset.icon ? ICONS[preset.icon] : null;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelect(preset.message)}
            disabled={disabled}
            aria-label={`Send "${preset.message}"`}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
              'text-xs font-medium',
              'bg-white border border-gray-300 text-gray-700',
              'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700',
              'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1',
              'transition-colors duration-150',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300 disabled:hover:text-gray-700'
            )}
          >
            {IconComponent && (
              <IconComponent className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}
