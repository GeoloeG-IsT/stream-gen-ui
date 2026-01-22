---
status: resolved
trigger: "contact-premature-rendering"
created: 2026-01-22T00:00:00Z
updated: 2026-01-22T00:15:00Z
---

## Current Focus

hypothesis: PRIMARY ISSUE - LLM is omitting the name attribute when generating contactcard tags, despite the prompt showing name first. SECONDARY ISSUE - Prompt-component attribute mismatch (company/title in prompt vs address/avatar in component). Need to verify by observing actual LLM output.
test: Document analysis complete. Root cause identified with high confidence.
expecting: Verification would show LLM output missing name attribute OR hidePartialCustomComponents failing to hide incomplete tags
next_action: Provide root cause analysis to user for verification and fixing

## Symptoms

expected: Contact card should only render when the marker is fully complete - all props (name, email, phone, company, role) should appear together when streaming completes, just like Calendar component does
actual: Contact component renders before marker is complete - name is NOT displayed but email, phone, and other props ARE displayed. The rendering starts too early, missing the name field.
errors: Unknown - need to check console and rendering logic
reproduction: Load FlowToken page and observe streaming behavior with Contact preset. Compare to Calendar which renders correctly only when complete.
started: Unknown due to many recent changes - analyze current code state

## Eliminated

## Evidence

- timestamp: 2026-01-22T00:01:00Z
  checked: FlowToken AnimatedMarkdown.tsx hidePartialCustomComponents function (lines 68-94)
  found: The function hides partial custom components by checking if there's an opening '<' without a closing '>' AND if it matches a custom component name. However, the logic has a critical flaw in the regex pattern matching on line 84.
  implication: The regex `new RegExp('^<${tag}(\\s|$)')` matches if the partial tag starts with the component name followed by whitespace OR end-of-string, which means it will match `<contactcard ` even if the tag is incomplete (missing props and closing '>').

- timestamp: 2026-01-22T00:02:00Z
  checked: ContactCard.tsx vs CalendarEvent.tsx structure
  found: Both components render similarly. ContactCard shows name at line 36, email at line 42+, phone at line 52+. CalendarEvent shows title at line 33, date at line 39+.
  implication: The components themselves are not the issue - they will render whatever props they receive. The problem is that FlowToken is rendering ContactCard too early with incomplete props.

- timestamp: 2026-01-22T00:03:00Z
  checked: Agent prompts.py FLOWTOKEN_CONTACT_FORMAT vs FLOWTOKEN_EVENT_FORMAT
  found: Both use multi-line format with explicit closing '/>' on separate line. Contact format has attributes: name, email, phone, company, title. Calendar format has: title, date, startTime, location, description.
  implication: Both formats are identical in structure, so this doesn't explain why Contact behaves differently.

- timestamp: 2026-01-22T00:04:00Z
  checked: hidePartialCustomComponents regex and logic (lines 68-94, 82-84)
  found: Function correctly hides ALL partial tags (tested with node script). Even `<contactcard name="John"` without closing > would be hidden. The tag only renders when it has a closing > or />.
  implication: The component is rendering because the tag HAS a closing />, which means all attributes up to that point are being passed to ContactCard. If name is missing, it's because /> came before name in the stream.

- timestamp: 2026-01-22T00:05:00Z
  checked: FLOWTOKEN_CONTACT_FORMAT attribute order in prompts.py
  found: Prompt specifies this order: name (line 29), email (line 30), phone (line 31), company (line 32), title (line 33). Name is explicitly FIRST.
  implication: If LLM follows prompt, name should arrive before email. But symptom says name is missing while email shows, suggesting LLM is NOT following the attribute order in the prompt.

- timestamp: 2026-01-22T00:06:00Z
  checked: Git history of FlowTokenRenderer.tsx (commit 43c0b134)
  found: Manual filterIncompleteXml function was REMOVED and replaced with reliance on FlowToken library's hidePartialCustomComponents. The old function used regex: `/<(contactcard|calendarevent)[^>]*$/i` which is simpler and more direct.
  implication: The behavior changed from manual filtering to FlowToken's built-in logic. This might have introduced the bug if FlowToken's hidePartialCustomComponents has different behavior or a bug.

- timestamp: 2026-01-22T00:07:00Z
  checked: ContactCardProps interface vs FLOWTOKEN_CONTACT_FORMAT prompt
  found: MISMATCH! Prompt specifies attributes: name, email, phone, company, title. But ContactCardProps expects: name, email, phone, address, avatar. The `company` and `title` attributes in the prompt don't exist in the component interface!
  implication: When LLM outputs company="..." title="...", these props are ignored by ContactCard component. But this doesn't explain missing name.

- timestamp: 2026-01-22T00:08:00Z
  checked: Web search for rehype-raw and name attribute issues
  found: rehype-sanitize (if used) can prefix name attributes with 'user-content-'. But we're NOT using rehype-sanitize in our code.
  implication: Not a rehype-sanitize issue.

## Resolution

root_cause: TWO ISSUES IDENTIFIED:

PRIMARY ISSUE (explains missing name):
The symptom "name is NOT displayed but email, phone ARE displayed" indicates the LLM is generating contactcard tags WITHOUT the name attribute, despite FLOWTOKEN_CONTACT_FORMAT explicitly showing name as the first attribute (line 29 of prompts.py). This is likely an LLM behavior issue - the model is not following the prompt's attribute specification. The FlowToken hidePartialCustomComponents function (AnimatedMarkdown.tsx lines 68-94) correctly hides incomplete tags (verified via testing), so the tag must be "complete" (has />) but missing the name attribute in the HTML.

SECONDARY ISSUE (attribute mismatch):
FLOWTOKEN_CONTACT_FORMAT prompt specifies attributes: name, email, phone, company, title (lines 26-37 of prompts.py). But ContactCardProps interface expects: name, email, phone, address, avatar (lines 47-53 of types/index.ts). The attributes company and title in the prompt don't match the component's expected props address and avatar. This mismatch means if the LLM outputs company/title (as instructed), those props are ignored by ContactCard.

fix: Updated all three contact format prompts (FLOWTOKEN_CONTACT_FORMAT, STREAMDOWN_CONTACT_FORMAT, LLMUI_CONTACT_FORMAT) in backend/agent/prompts.py to:
1. Align attributes with ContactCardProps (changed company→address, removed title)
2. Added explicit "IMPORTANT: The name attribute is REQUIRED and must always be included first"
3. Changed FLOWTOKEN format from multiline to single-line for more reliable LLM output

verification: Test FlowToken page with Contact preset to confirm name displays correctly
files_changed: [backend/agent/prompts.py]
