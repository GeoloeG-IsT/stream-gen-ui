# Sprint Change Proposal

**Date:** 2026-01-20
**Requested By:** GeoloeG
**Change Type:** New Requirement - Add Deployment Capability

---

## Section 1: Issue Summary

### Problem Statement

The stream-gen-ui PoC was designed for local-only evaluation. The architecture document explicitly stated "Deployment: Local only" and "PoC for evaluation, not production." A new requirement has emerged to share the PoC publicly, enabling stakeholders to evaluate the streaming UI implementations without local setup.

### Context

- **Discovery:** User request during sprint execution
- **Trigger:** Need to share PoC with external stakeholders
- **Current State:** App runs only on localhost:3000

### Technical Analysis

**GitHub Pages Assessment:**
| Aspect | GitHub Pages | This Project |
|--------|--------------|--------------|
| Static files | ✅ Yes | ✅ Yes |
| API Routes | ❌ No | ✅ Required (`/api/chat`) |
| Server-side code | ❌ No | ✅ Required (SSE streaming) |
| **Verdict** | **NOT SUITABLE** | — |

**Recommended Solution: Vercel Free Tier**
| Feature | Vercel Free |
|---------|-------------|
| Cost | $0 (hobby tier) |
| Next.js support | Native (created by Vercel) |
| API Routes | ✅ Full support |
| SSE Streaming | ✅ Full support |
| Setup | Zero-config for Next.js |

---

## Section 2: Impact Analysis

### Epic Impact

| Epic | Impact | Details |
|------|--------|---------|
| Epic 1: Working Streaming Chat Demo | None | No changes required |
| Epic 2: Three-Way Implementation Comparison | None | No changes required |
| Epic 3: Evaluation Tools & Production Polish | **Modified** | Add Story 3.6 |

### Story Impact

**New Story Required:**
- **Story 3.6:** Deploy PoC to Vercel
- **Status:** ready-for-dev
- **Placement:** Epic 3 (aligns with "Production Polish" goal)

### Artifact Conflicts

| Artifact | Conflict | Resolution |
|----------|----------|------------|
| Architecture.md | Deployment section says "Local only" | Update to reflect Vercel deployment |
| README.md | No deployment instructions | Add live demo URL and deployment section |
| epics.md | Missing deployment story | Add Story 3.6 |
| sprint-status.yaml | Missing story tracking | Add 3-6-deploy-poc-to-vercel |

### Technical Impact

- **Code changes:** None required
- **Infrastructure:** Vercel platform (free tier)
- **Dependencies:** None new
- **Build process:** Uses existing `npm run build`

---

## Section 3: Recommended Approach

### Selected Path: Direct Adjustment

Add new story to existing Epic 3 structure without disrupting completed work.

### Rationale

1. **Low effort:** Vercel deployment is zero-config for Next.js projects
2. **No disruption:** Adds value without affecting existing stories
3. **Aligned:** Fits naturally in Epic 3's "Production Polish" goal
4. **Zero cost:** Vercel free tier is sufficient
5. **Low risk:** Vercel is the industry standard for Next.js deployment

### Effort & Risk Assessment

| Factor | Rating | Notes |
|--------|--------|-------|
| Implementation Effort | **Low** | ~30 minutes for deployment + docs |
| Technical Risk | **Low** | Well-established platform |
| Timeline Impact | **Minimal** | Does not block other work |
| Complexity | **Low** | Zero-config deployment |

---

## Section 4: Detailed Change Proposals

### 4.1 Add Story 3.6 to epics.md

**Location:** After Story 3.5 in Epic 3

```markdown
### Story 3.6: Deploy PoC to Vercel

**As an** evaluator,
**I want** the PoC deployed to a public URL,
**So that** I can share it with stakeholders without requiring local setup.

**Acceptance Criteria:**

**Given** the project is deployed to Vercel
**When** I visit the deployed URL
**Then** all three implementation routes are accessible (/flowtoken, /llm-ui, /streamdown)
**And** the mock streaming API works correctly
**And** the View Raw toggle functions as expected

**Given** the README is updated
**When** I read the documentation
**Then** I see the live demo URL prominently displayed
**And** I see instructions for deploying my own instance

**Implementation Notes:**
- Deploy using Vercel free tier (zero-config for Next.js)
- Either `npx vercel` CLI or GitHub repo integration
- Update README with live demo link and deployment section
```

### 4.2 Update sprint-status.yaml

**Change:** Add story tracking entry

```yaml
3-6-deploy-poc-to-vercel: ready-for-dev
```

### 4.3 Update architecture.md

**Section:** Infrastructure & Deployment

**New content:**
```markdown
### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Deployment** | Vercel (free tier) | Zero-config Next.js hosting for public sharing |
| **CI/CD** | Vercel GitHub Integration | Automatic deploys on push to main |
| **Monitoring** | Vercel Analytics (optional) | Built-in performance monitoring |

**Deployment Details:**

- **Platform:** Vercel Free Tier (hobby)
- **URL:** Automatically generated (e.g., `stream-gen-ui.vercel.app`)
- **Deploy Method:** GitHub repo integration or `npx vercel` CLI
- **Environment:** No environment variables required (mock provider)
- **Build Command:** `npm run build` (auto-detected)
- **Output:** Static + Serverless Functions for API routes
```

### 4.4 Update README.md

**Change 1:** Add live demo link after "What is This?" heading

```markdown
> **🚀 Live Demo:** [stream-gen-ui.vercel.app](https://stream-gen-ui.vercel.app)
```

**Change 2:** Add new Deployment section before Contributing

```markdown
## Deployment

This project is deployed on [Vercel](https://vercel.com) (free tier).

### Deploy Your Own

**Option 1: One-Click Deploy**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/stream-gen-ui)

**Option 2: CLI Deployment**

\```bash
npm i -g vercel
vercel
vercel --prod
\```

**Option 3: GitHub Integration**

1. Push your code to GitHub
2. Import at vercel.com/new
3. Click Deploy

### Environment Variables

No environment variables required - uses mock stream provider.
```

---

## Section 5: Implementation Handoff

### Change Scope Classification

**Scope: MINOR** - Can be implemented directly by development team

### Handoff Plan

| Role | Responsibility |
|------|----------------|
| **Developer** | Execute deployment, update documentation |
| **SM/PO** | Update sprint tracking (sprint-status.yaml) |

### Implementation Steps

1. Update sprint-status.yaml with new story
2. Update epics.md with Story 3.6
3. Update architecture.md deployment section
4. Deploy to Vercel (`npx vercel --prod`)
5. Update README.md with live URL and deployment docs
6. Mark story as done

### Success Criteria

- [ ] App accessible at Vercel URL
- [ ] All three routes functional (/flowtoken, /llm-ui, /streamdown)
- [ ] Mock streaming works correctly
- [ ] README shows live demo link
- [ ] Deployment instructions documented

---

## Approval

**Status:** PENDING USER APPROVAL

**Approved Changes:**
- [x] Change Proposal #1: Add Story 3.6 to epics.md
- [x] Change Proposal #2: Update sprint-status.yaml
- [x] Change Proposal #3: Update architecture.md
- [x] Change Proposal #4: Update README.md deployment docs

---

*Generated by Correct Course Workflow - 2026-01-20*
