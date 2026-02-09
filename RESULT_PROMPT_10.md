# RESULT PROMPT 10

## 1) What exactly was implemented in PROMPT-10
- Added a Uniqueness Engine that selects a per-trend daily angle from a fixed pool, checks similarity against recent drafts, and regenerates up to three times before force-accepting.
- Added lightweight Jaccard similarity on normalized word sets and stored similarity metadata.
- Integrated uniqueness flow into both manual draft generation and worker auto-generation, without changing aiService internals.

## 2) Which files were created/modified
- Created: `src/utils/similarity.js`
- Created: `src/services/uniquenessService.js`
- Modified: `src/models/DraftPost.js`
- Modified: `src/controllers/draftsController.js`
- Modified: `src/services/workerService.js`

## 3) How angle locking works (example)
For each (workspaceId, trendId, date), the engine looks at DraftPost meta for that date. If the angle pool is:
- Founder impact
- Actionable checklist
- Common mistakes
- Contrarian take
- Simple explanation
- Technical breakdown

If “Founder impact” was used earlier today for the same trend, it cannot be selected again. The engine picks an unused angle from the pool. If all six angles were already used today for that trend, it allows reuse and sets `angleReused=true` in both DraftPost meta and top-level fields.

## 4) How similarity is calculated (plain English)
Draft content is normalized to lowercase, punctuation is removed, and whitespace is collapsed. The text is split into unique words and compared to the last 20 drafts in the same workspace. Similarity is the Jaccard overlap of word sets (intersection size divided by union size). The highest score found is stored as `similarityScore` in the draft.

## 5) Regeneration behavior (happy path + failure case)
- Happy path: Generate draft → similarity ≤ 0.7 → accept immediately, record `generationAttempts=1`.
- Failure case: Generate draft → similarity > 0.7 → regenerate with a new angle (up to 3 attempts). If all attempts still exceed 0.7, the last draft is accepted and `forceAccepted=true` is stored.

## 6) What PROMPT-11 should cover
- Define how to expose uniqueness metadata in responses or UI.
- Decide whether to show “angle reused” and “force accepted” flags in dashboards.
- Add tests for the uniqueness engine behavior and edge cases.
