# Component Inventory

## Overview

This document catalogs all React components in the stream-gen-ui project, organized by category and purpose.

## Shared Components (`/components/shared`)

### Display Components

#### ContactCard
**File:** `components/shared/ContactCard.tsx`

**Purpose:** Displays contact information with avatar, name, email, phone, and address.

**Props:**
```typescript
interface ContactCardProps {
  name: string;           // Required - contact name
  email?: string;         // Optional - email address (mailto link)
  phone?: string;         // Optional - phone number (tel link)
  address?: string;       // Optional - physical address
  avatar?: string;        // Optional - avatar image URL
}
```

**Features:**
- Gradient background (blue tones)
- Default avatar icon when no image provided
- Clickable email and phone links
- Lucide icons (User, Mail, Phone, MapPin)
- ARIA labels for accessibility

---

#### CalendarEvent
**File:** `components/shared/CalendarEvent.tsx`

**Purpose:** Displays calendar event details with title, date, time range, location, and description.

**Props:**
```typescript
interface CalendarEventProps {
  title: string;          // Required - event title
  date: string;           // Required - event date
  startTime?: string;     // Optional - start time
  endTime?: string;       // Optional - end time
  location?: string;      // Optional - event location
  description?: string;   // Optional - event description
}
```

**Features:**
- Gradient background (emerald/green tones)
- Time range formatting (`startTime - endTime`)
- Lucide icons (Calendar, Clock, MapPin)
- ARIA labels for accessibility

---

#### RawOutputView
**File:** `components/shared/RawOutputView.tsx`

**Purpose:** Debug panel showing raw unparsed markup for evaluation purposes.

**Props:**
```typescript
interface RawOutputViewProps {
  content: string;        // Raw markup content
  isStreaming?: boolean;  // Show cursor animation
}
```

**Features:**
- Dark background with monospace font
- Scrollable with max-height constraint
- Animated cursor during streaming
- Used by MessageBubble when View Raw is enabled

---

### Chat Components

#### Header
**File:** `components/shared/Header.tsx`

**Purpose:** Fixed navigation header with implementation tabs and View Raw toggle.

**Props:** None (uses `usePathname()` and `useViewRaw()`)

**Features:**
- Fixed positioning at top
- Tab navigation: FlowToken | llm-ui | Streamdown
- Active tab highlighting
- View Raw toggle switch
- ARIA attributes for accessibility
- Minimum touch target size (44x44px)

---

#### ChatInput
**File:** `components/shared/ChatInput.tsx`

**Purpose:** Message input field with send button and optional preset selector.

**Props:**
```typescript
interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  onPresetSelect?: (message: string) => void;
}
```

**Features:**
- Controlled input with ref for auto-focus
- Send button with Lucide Send icon
- Integrates PresetSelector when `onPresetSelect` provided
- Disabled state during loading
- Auto-focus after submission

---

#### MessageBubble
**File:** `components/shared/MessageBubble.tsx`

**Purpose:** Container for individual chat messages with user/assistant styling.

**Props:**
```typescript
interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  children?: React.ReactNode;
  rawContent?: string;
}
```

**Features:**
- User messages: blue background, right-aligned
- Assistant messages: white background, left-aligned
- Pulse animation during streaming
- Renders children (renderer output) or content
- Shows RawOutputView when View Raw enabled

---

#### MessageList
**File:** `components/shared/MessageList.tsx`

**Purpose:** Container for rendering message history (basic implementation).

**Props:**
```typescript
interface MessageListProps {
  messages: Array<{ id: string; role: 'user' | 'assistant'; content: string }>;
}
```

---

#### PresetSelector
**File:** `components/shared/PresetSelector.tsx`

**Purpose:** Quick action buttons for sending predefined content requests.

**Props:**
```typescript
interface PresetSelectorProps {
  onSelect: (message: string) => void;
  disabled?: boolean;
}
```

**Presets:**
| ID | Label | Message | Icon |
|----|-------|---------|------|
| contact | Contact | "Show me a contact" | User |
| calendar | Calendar | "Schedule a meeting" | Calendar |
| both | Both | "Show me everything" | Layers |
| text | Text Only | "Just text please" | FileText |
| multi | Multiple | "Show multiple items" | Grid |

---

#### TypingIndicator
**File:** `components/shared/TypingIndicator.tsx`

**Purpose:** Animated typing indicator with three bouncing dots.

**Props:**
```typescript
interface TypingIndicatorProps {
  isVisible: boolean;
}
```

**Features:**
- Three dots with staggered animation delays
- CSS animation via `animate-bounce-typing` class
- ARIA status role with label
- Returns null when not visible

---

## Implementation-Specific Renderers

### FlowTokenRenderer
**File:** `components/flowtoken/FlowTokenRenderer.tsx`

**Purpose:** Renders streaming content using FlowToken's AnimatedMarkdown.

**Props:**
```typescript
interface FlowTokenRendererProps {
  content: string;
  isStreaming?: boolean;
}
```

**Implementation:**
```tsx
<AnimatedMarkdown
  content={content}
  animation={isStreaming ? 'fadeIn' : null}
  customComponents={{
    contactcard: ContactCard,
    calendarevent: CalendarEvent,
  }}
/>
```

**Features:**
- Error boundary with raw text fallback
- Built-in animation during streaming
- Lowercase tag name mapping

---

### LLMUIRenderer
**File:** `components/llm-ui/LLMUIRenderer.tsx`

**Purpose:** Renders streaming content using llm-ui's block parsing.

**Props:**
```typescript
interface LLMUIRendererProps {
  content: string;
  isStreaming?: boolean;
}
```

**Implementation:**
- Custom block matchers for `【CONTACT:{json}】` and `【CALENDAR:{json}】`
- `useLLMOutput` hook with `blocks` and `fallbackBlock`
- ReactMarkdown for markdown fallback
- `lookBack` functions for streaming visibility control

**Features:**
- Error boundary with raw text fallback
- React.memo for performance
- Frame-rate throttling via lookBack

---

### StreamdownRenderer
**File:** `components/streamdown/StreamdownRenderer.tsx`

**Purpose:** Renders streaming content using Streamdown with custom XML parsing.

**Props:**
```typescript
interface StreamdownRendererProps {
  content: string;
  isStreaming?: boolean;
}
```

**Implementation:**
- Custom `parseContent()` function extracts XML tags
- Separates content into `ContentSegment[]` (markdown or component)
- Streamdown component for markdown segments
- Direct component rendering for contactcard/calendarevent

**Features:**
- Error boundary with raw text fallback
- React.memo for performance
- useMemo for parsed content caching
- Graceful handling of incomplete tags during streaming

---

## Component Dependencies

```
Page Components (flowtoken, llm-ui, streamdown)
    │
    ├── Header (shared)
    │       └── useViewRaw (context)
    │
    ├── MessageBubble (shared)
    │       ├── RawOutputView (shared)
    │       └── useViewRaw (context)
    │
    ├── ChatInput (shared)
    │       └── PresetSelector (shared)
    │
    ├── TypingIndicator (shared)
    │
    └── {Implementation}Renderer
            ├── ContactCard (shared)
            └── CalendarEvent (shared)
```

## Design System Elements

### Color Palette
- **Primary:** Blue (`bg-blue-500`, `text-blue-600`)
- **Secondary:** Emerald/Green (`bg-emerald-50`, `text-emerald-600`)
- **Neutral:** Gray scale (`bg-gray-50` to `bg-gray-800`)
- **Header:** Navy (`#1E3A5F`)

### Spacing
- Consistent padding: `p-3`, `p-4`
- Gap spacing: `gap-1`, `gap-2`, `gap-3`
- Border radius: `rounded-lg`, `rounded-xl`, `rounded-full`

### Accessibility
- All interactive elements have `aria-label`
- ARIA roles: `log`, `status`, `article`, `group`, `region`, `switch`
- Focus indicators: `focus-visible:ring-2`
- Minimum touch targets: 44x44px
- Reduced motion support in animations
