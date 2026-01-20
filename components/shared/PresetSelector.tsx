'use client';

import type { ReactElement } from 'react';

import { User, Calendar, FileText, Layers, Grid } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { PresetSelectorProps, PresetOption } from '@/types';

/**
 * Available content presets with their trigger messages
 */
const PRESET_OPTIONS: PresetOption[] = [
  {
    id: 'contact',
    label: 'Contact',
    message: 'Show me a contact',
    icon: 'user',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    message: 'Schedule a meeting',
    icon: 'calendar',
  },
  {
    id: 'both',
    label: 'Both',
    message: 'Show me everything',
    icon: 'layers',
  },
  {
    id: 'text',
    label: 'Text Only',
    message: 'Just text please',
    icon: 'file-text',
  },
  {
    id: 'multi',
    label: 'Multiple',
    message: 'Show multiple items',
    icon: 'grid',
  },
];

/**
 * Icon component mapping
 */
const ICONS: Record<string, typeof User> = {
  user: User,
  calendar: Calendar,
  'file-text': FileText,
  layers: Layers,
  grid: Grid,
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
