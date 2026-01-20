# Story 2.3: Test Content Presets

Status: ready-for-dev

## Story

As an **evaluator**,
I want **identical test scenarios across all implementations**,
so that **I can make fair side-by-side comparisons**.

## Acceptance Criteria

1. **Given** the test content library exists in `lib/test-content.ts` **When** a user sends common test messages (e.g., "Show me a contact", "Schedule a meeting") **Then** each implementation receives semantically equivalent content **And** FlowToken receives XML-tagged content **And** llm-ui receives delimiter-based content **And** Streamdown receives XML-tagged content

2. **Given** I switch between implementation routes **When** I send the same test message **Then** I can visually compare how each parser handles the content

## Tasks / Subtasks

- [ ] Task 1: Analyze current test content structure (AC: #1, #2)
  - [ ] Review existing `lib/test-content.ts` implementation
  - [ ] Identify what content presets already exist (contact + calendar)
  - [ ] Determine what additional presets would enable fair comparison

- [ ] Task 2: Implement message-based content selection (AC: #1, #2)
  - [ ] Modify `getTestContent()` to use message content for selection
  - [ ] Create content preset map with trigger keywords
  - [ ] Map preset names: "contact", "calendar", "both", "mixed"
  - [ ] Add keyword detection for common queries ("contact", "meeting", "schedule", etc.)
  - [ ] Maintain existing behavior as fallback (return full content)

- [ ] Task 3: Create additional content presets (AC: #1, #2)
  - [ ] Create "contact-only" preset: just ContactCard component
  - [ ] Create "calendar-only" preset: just CalendarEvent component
  - [ ] Create "text-only" preset: markdown with no custom components
  - [ ] Create "multi-component" preset: multiple of each type
  - [ ] Ensure all presets have equivalent content across formats

- [ ] Task 4: Update API route to leverage content selection (AC: #1, #2)
  - [ ] Ensure `/api/chat` passes user message to `getTestContent()`
  - [ ] Verify format-specific content returned correctly
  - [ ] Test keyword matching works as expected

- [ ] Task 5: Create comprehensive tests (AC: #1, #2)
  - [ ] Add tests for keyword-based content selection
  - [ ] Test format-specific content generation
  - [ ] Test fallback behavior for unknown messages
  - [ ] Test multi-component content rendering
  - [ ] Verify semantic equivalence across formats

- [ ] Task 6: Verify integration and run tests (AC: #1, #2)
  - [ ] Run `npm run build` - no TypeScript errors
  - [ ] Run `npm run lint` - no ESLint warnings
  - [ ] Run `npm test` - all tests pass
  - [ ] Manual testing: verify same message produces comparable output across routes

## Dev Notes

### Current State Analysis

The existing `lib/test-content.ts` already has:
- `FLOWTOKEN_CONTENT`: XML-tagged content with ContactCard + CalendarEvent
- `LLM_UI_CONTENT`: Delimiter-based content with same components
- `STREAMDOWN_CONTENT`: Reuses FLOWTOKEN_CONTENT (same XML format)
- `getTestContent()`: Returns format-specific content, but ignores `_messages` param

**Current limitation:** Every message returns the same content regardless of what the user asks. This makes it hard to compare specific scenarios.

### Implementation Strategy

**Keyword-based content selection:**

```typescript
// lib/test-content.ts
type ContentPreset = 'contact' | 'calendar' | 'both' | 'text-only' | 'multi';

const PRESET_KEYWORDS: Record<string, ContentPreset> = {
  'contact': 'contact',
  'email': 'contact',
  'phone': 'contact',
  'meeting': 'calendar',
  'schedule': 'calendar',
  'event': 'calendar',
  'calendar': 'calendar',
  'both': 'both',
  'everything': 'both',
  'text': 'text-only',
  'markdown': 'text-only',
  'multiple': 'multi',
  'several': 'multi',
};

function detectPreset(message: string): ContentPreset {
  const lower = message.toLowerCase();
  for (const [keyword, preset] of Object.entries(PRESET_KEYWORDS)) {
    if (lower.includes(keyword)) {
      return preset;
    }
  }
  return 'both'; // Default fallback
}
```

### Content Presets to Create

| Preset | Description | Components |
|--------|-------------|------------|
| `contact` | Contact information only | 1x ContactCard |
| `calendar` | Event scheduling only | 1x CalendarEvent |
| `both` | Full demo content (current default) | 1x ContactCard + 1x CalendarEvent |
| `text-only` | Pure markdown, no custom components | None |
| `multi` | Multiple of each component | 2x ContactCard + 2x CalendarEvent |

### Format-Specific Templates

**For FlowToken/Streamdown (XML):**
```
<contactcard name="..." email="..." phone="..."></contactcard>
```

**For llm-ui (Delimiters + JSON):**
```
【CONTACT:{"name":"...","email":"...","phone":"..."}】
```

### Existing Code to Modify (DO NOT RECREATE)

| File | Purpose | Modification |
|------|---------|-------------|
| `lib/test-content.ts` | Content presets | Add keyword detection + new presets |
| `app/api/chat/route.ts` | Chat endpoint | Already passes messages to getTestContent |

### Anti-Patterns to Avoid

- **DO NOT** break existing behavior - default should still work
- **DO NOT** use `any` type for message parsing
- **DO NOT** create duplicate content - maintain format-specific templates
- **DO NOT** hardcode preset selection - use keyword detection
- **DO NOT** forget to update tests for new functionality

### Import Order Standard (MUST FOLLOW)

```typescript
// 1. Type imports first
import type { MessageFormat } from '@/types';

// 2. Constants and content
const FLOWTOKEN_CONTENT = ...

// 3. Helper functions
function detectPreset(message: string): ContentPreset { ... }

// 4. Exported functions
export function getTestContent(...) { ... }
```

### Previous Story Learnings (Story 2.2)

**From Streamdown Implementation (2.2):**
- Custom XML parser needed because Streamdown doesn't parse custom elements
- Validation functions (`toContactCardProps`, `toCalendarEventProps`) added for type safety
- Test mocks should be simple - don't duplicate parsing logic
- Documentation of limitations is valuable

**From llm-ui Implementation (2.1):**
- Delimiter parsing works differently than XML
- JSON parsing must handle malformed input gracefully
- Frame-rate throttling for smooth streaming UX

**From FlowToken Implementation (1.5):**
- XML tag format: lowercase `<contactcard>` not PascalCase
- Explicit closing tags required (not self-closing)
- Error boundary fallback to raw text

### Git Intelligence

Recent commits show implementation pattern:
- `5a49813` - Streamdown with custom parser
- `f815339` - llm-ui with delimiter parsing
- `bb93133` - FlowToken renderer integration

Pattern: Each implementation has format-specific content handling. This story standardizes the content selection mechanism.

### Testing Strategy

**Unit Tests (test-content.ts):**
- Test `detectPreset()` returns correct preset for keywords
- Test `getTestContent()` returns format-specific content
- Test fallback behavior for unknown messages
- Test each preset contains expected components

**Integration Tests:**
- Verify API route uses message content for selection
- Verify each format renders components correctly

### File Structure

```
lib/
├── test-content.ts      # MODIFY: Add keyword detection + presets
└── test-content.test.ts # MODIFY: Add tests for new functionality

app/
└── api/
    └── chat/
        └── route.ts     # VERIFY: Already passes messages
```

### Project Structure Notes

- **Alignment:** Follows `lib/` pattern for utilities
- **Test co-location:** Tests go in same directory as source
- **Naming:** kebab-case for utility files

### Performance Considerations

1. **Keyword detection:** Simple string matching, O(n) where n = keywords
2. **Content presets:** Static strings, no runtime overhead
3. **Format switching:** O(1) lookup in record

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.3: Test Content Presets]
- [Source: _bmad-output/planning-artifacts/architecture.md#Test Content Presets]
- [Source: lib/test-content.ts - existing implementation]
- [Source: lib/test-content.test.ts - existing tests]
- [Source: app/api/chat/route.ts - API integration point]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- 2026-01-20: Story created with comprehensive developer context (create-story workflow)
