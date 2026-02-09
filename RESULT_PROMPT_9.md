# PROMPT-9 Implementation Summary

## 1) What was implemented
- Extended `TrendSource` with health tracking fields (`lastFetchedAt`, `lastError`, `lastErrorAt`) and enabled `updatedAt` timestamps.
- Added workspace-scoped TrendSource management endpoints (list, create, update, delete) with Zod validation.
- Added workspace-scoped Trend status update endpoint to mark a trend as `new`, `used`, or `ignored`.
- Ensured draft generation auto-marks a trend as `used` after saving the draft.
- Enhanced trend fetching to track per-source health outcomes and return `sourcesSucceeded`/`sourcesFailed` in the summary.

## 2) Files created/modified
**Created**
- `src/schemas/trendSources.js`
- `src/schemas/trends.js`
- `src/controllers/trendSourcesController.js`
- `src/routes/trendSourcesRoutes.js`

**Modified**
- `src/models/TrendSource.js`
- `src/services/trendService.js`
- `src/routes/trendsRoutes.js`
- `src/controllers/trendsController.js`
- `src/controllers/draftsController.js`
- `src/app.js`

## 3) New endpoints + sample payloads

### TrendSource management (workspace-scoped, JWT + requireWorkspaceAccess)
**GET /trend-sources**
- Returns all trend sources for the workspace, sorted by `createdAt` desc.

**POST /trend-sources**
Payload:
```json
{
  "name": "Example Source",
  "url": "https://example.com/feed.xml",
  "freshnessHours": 24,
  "enabled": true
}
```

**PATCH /trend-sources/:id**
Payload:
```json
{
  "name": "Updated Source",
  "enabled": false,
  "freshnessHours": 72
}
```

**DELETE /trend-sources/:id**
- Removes the trend source if it belongs to the workspace (403 otherwise).

### Trend status update (workspace-scoped, JWT + requireWorkspaceAccess)
**PATCH /trends/:id/status**
Payload:
```json
{
  "status": "used"
}
```

## 4) Trend auto-mark-used behavior
When `POST /drafts/generate` successfully creates a draft from a trend, the trend is automatically updated to `status = "used"` immediately after the draft is saved.

## 5) Source health tracking behavior
Within `fetchTrendsForWorkspace(workspaceId)`:
- On **successful fetch + parse** per source:
  - `lastFetchedAt` is set to now.
  - `lastError` and `lastErrorAt` are cleared.
  - `sourcesSucceeded` is incremented.
- On **failure (network/parse)**:
  - `lastError` is set to the error message (truncated to 300 chars).
  - `lastErrorAt` is set to now.
  - `sourcesFailed` is incremented.
- Processing continues for other sources even if one fails.

The response summary now includes `sourcesSucceeded` and `sourcesFailed`.

## 6) What PROMPT-10 should cover
- UX/API support for viewing TrendSource health in the UI.
- Filters or sorting for trends by status and source health.
- Optional alerting/notification rules for repeated TrendSource failures.
