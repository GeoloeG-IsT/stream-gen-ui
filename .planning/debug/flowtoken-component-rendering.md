---
status: verifying
trigger: "Investigate issue: flowtoken-component-rendering"
created: 2026-01-21T00:00:00Z
updated: 2026-01-21T00:08:00Z
---

## Current Focus

hypothesis: CONFIRMED - AnimatedMarkdown customComponents has multiple tag limitation
test: restore manual XML parsing from commit d6ccb70a
expecting: multiple components render correctly with manual parsing
next_action: apply manual parsing implementation to FlowTokenRenderer.tsx

## Symptoms

expected: Both Contact and Calendar custom components should render fully as complete UI components when the streaming completes
actual: Only the first custom component renders (whether Contact or Event). XML props stream in for Contact but not for Calendar.
errors: Unknown - need to check console
reproduction: Load FlowToken page and observe streaming behavior with presets that include multiple custom components
started: Recent regression - worked before

## Eliminated

## Evidence

- timestamp: 2026-01-21T00:01:00Z
  checked: FlowTokenRenderer.tsx, EntityRenderer, entity-parser.ts
  found: FlowToken page uses EntityRenderer for entity parsing when hasEntityMarkers is true, but FlowTokenRenderer itself uses AnimatedMarkdown with customComponents for XML tag rendering
  implication: Two separate rendering systems - entity-parser for :::contact/:::event markdown markers vs AnimatedMarkdown for <contactcard>/<calendarevent> XML tags

- timestamp: 2026-01-21T00:02:00Z
  checked: backend/agent/prompts.py
  found: FLOWTOKEN_CONTACT_FORMAT and FLOWTOKEN_EVENT_FORMAT specify XML tags with self-closing format like <contactcard .../> and <calendarevent .../>
  implication: Backend emits XML tags for FlowToken marker, NOT markdown :::contact markers

- timestamp: 2026-01-21T00:03:00Z
  checked: FlowToken page.tsx lines 144-163
  found: When hasEntities is true, uses EntityRenderer which parses :::contact/:::event markers. Otherwise uses FlowTokenRenderer directly
  implication: EntityRenderer is being used but expects :::contact markers while backend sends XML tags for flowtoken marker

- timestamp: 2026-01-21T00:04:00Z
  checked: Git history for FlowTokenRenderer
  found: Commit 1ae870a4 reverted manual XML parsing back to AnimatedMarkdown customComponents. Previous commit d6ccb70a had manual parsing for multiple components
  implication: The revert may have reintroduced the issue that manual parsing was trying to fix

- timestamp: 2026-01-21T00:05:00Z
  checked: hasEntityMarkers function in entity-parser.ts line 157-159
  found: Returns true if content includes ':::contact' or ':::event' - does NOT check for XML tags
  implication: For FlowToken (which uses XML tags), hasEntityMarkers should return false, so FlowTokenRenderer should be used directly, not EntityRenderer

- timestamp: 2026-01-21T00:06:00Z
  checked: Git commit d6ccb70a commit message
  found: "AnimatedMarkdown's customComponents had issues with multiple tags" - manual parsing was added to work around this, but was reverted in commit 1ae870a4
  implication: The revert reintroduced the known bug with AnimatedMarkdown not handling multiple custom components

## Resolution

root_cause: AnimatedMarkdown from flowtoken library has a known limitation where customComponents only renders the first custom component tag encountered. The manual XML parsing workaround (commit d6ccb70a) was reverted in commit 1ae870a4, reintroducing the bug.

fix: Restored manual XML parsing implementation from commit d6ccb70a. The parseContent function extracts custom component tags (<contactcard> and <calendarevent>) using regex, parses their attributes, and creates segments of markdown and component data. AnimatedMarkdown is used only for markdown segments, while components are rendered directly.

verification: Testing with FlowToken page using "Both" preset which should show both Contact and Calendar components
files_changed: [frontend/components/flowtoken/FlowTokenRenderer.tsx]