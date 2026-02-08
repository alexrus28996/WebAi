# Result Prompt 3

## 1. `crawler.js` responsibilities
- Fetch HTML content for a specific URL with a deterministic timeout.
- Parse the returned HTML to extract same-domain links using a stable, order-preserving scan.
- Return a structured result containing the normalized URL, raw HTML (or `null` on failure), and a de-duplicated list of discovered links.

## 2. Error handling strategy
- Invalid URLs return `{ url, rawHtml: null, discoveredLinks: [] }` without throwing.
- Fetch failures (network errors, non-OK responses, or timeouts) return a safe empty result and do not propagate errors.
- The timeout is enforced via `AbortController` and always cleared in a `finally` block.

## 3. How determinism is preserved
- No randomness, concurrency, or external state mutations are used.
- Link extraction relies on a deterministic regex scan of the HTML and preserves discovery order.
- URLs are normalized via the built-in `URL` parser, ensuring consistent string output for identical inputs.
- Duplicate links are removed with a `Set` while maintaining the first-seen order.

## 4. Assumptions made
- The environment provides `fetch` and `AbortController` (or a compatible `fetchImpl` is injected).
- `allowedOrigin` is the same-origin boundary for link discovery; if omitted, the URL’s own origin is used.
- Responses with `content-type` including `text/html` are treated as HTML; other content types return an empty link list.

## 5. Edge cases handled
- Invalid or non-absolute URLs.
- HREFs that are empty, fragment-only (`#`), or non-navigational schemes (`javascript:`, `mailto:`, `tel:`).
- Relative and absolute links resolved against the base URL.
- Duplicate links in the same document.
- Non-OK HTTP responses and timeouts.

## 6. Intentionally excluded (and why)
- **Content cleaning or parsing meaning**: explicitly forbidden; handled by future parsing/normalization modules.
- **Scheduling or queue mutation**: crawler returns data only and does not interact with `urlQueue.js`.
- **Persistence**: no storage writes to keep the module deterministic and side-effect free.
- **Robots.txt or rate limiting**: belongs to policy enforcement within HTTP infrastructure, not this minimal crawler.
