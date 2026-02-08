const DEFAULT_TIMEOUT_MS = 10000;

const normalizeUrl = (input) => {
  try {
    return new URL(input).toString();
  } catch (error) {
    return null;
  }
};

const isAllowedOrigin = (url, allowedOrigin) => {
  if (!allowedOrigin) {
    return true;
  }
  try {
    return new URL(url).origin === allowedOrigin;
  } catch (error) {
    return false;
  }
};

const shouldSkipLink = (value) => {
  if (!value) {
    return true;
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith('#')) {
    return true;
  }
  return /^(javascript|mailto|tel):/i.test(trimmed);
};

const extractSameDomainLinks = ({ html, baseUrl, allowedOrigin }) => {
  if (!html) {
    return [];
  }

  const discoveredLinks = [];
  const seen = new Set();
  const hrefPattern = /href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;

  for (const match of html.matchAll(hrefPattern)) {
    const rawValue = match[1] ?? match[2] ?? match[3];
    if (shouldSkipLink(rawValue)) {
      continue;
    }

    const candidate = rawValue.trim();
    let resolved;
    try {
      resolved = new URL(candidate, baseUrl).toString();
    } catch (error) {
      continue;
    }

    if (!isAllowedOrigin(resolved, allowedOrigin)) {
      continue;
    }

    if (!seen.has(resolved)) {
      seen.add(resolved);
      discoveredLinks.push(resolved);
    }
  }

  return discoveredLinks;
};

export const crawlPage = async ({ url, allowedOrigin, timeoutMs = DEFAULT_TIMEOUT_MS, fetchImpl = fetch }) => {
  const normalizedUrl = normalizeUrl(url);
  if (!normalizedUrl) {
    return { url, rawHtml: null, discoveredLinks: [] };
  }

  const origin = allowedOrigin ?? new URL(normalizedUrl).origin;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(normalizedUrl, {
      signal: controller.signal,
      redirect: 'follow',
    });

    if (!response.ok) {
      return { url: normalizedUrl, rawHtml: null, discoveredLinks: [] };
    }

    const contentType = response.headers.get('content-type') ?? '';
    const rawHtml = await response.text();
    const discoveredLinks = contentType.includes('text/html')
      ? extractSameDomainLinks({ html: rawHtml, baseUrl: normalizedUrl, allowedOrigin: origin })
      : [];

    return { url: normalizedUrl, rawHtml, discoveredLinks };
  } catch (error) {
    return { url: normalizedUrl, rawHtml: null, discoveredLinks: [] };
  } finally {
    clearTimeout(timeoutId);
  }
};
