const DEFAULT_MAX_DEPTH = 0;

const normalizeUrl = (input) => {
  try {
    const parsed = new URL(input);
    return parsed.toString();
  } catch (error) {
    return null;
  }
};

const getOrigin = (input) => {
  const normalized = normalizeUrl(input);
  if (!normalized) {
    return null;
  }
  return new URL(normalized).origin;
};

export const createUrlQueue = ({ seedUrl, maxDepth = DEFAULT_MAX_DEPTH } = {}) => {
  const seedOrigin = getOrigin(seedUrl);
  if (!seedOrigin) {
    throw new Error('seedUrl must be a valid absolute URL');
  }
  if (!Number.isInteger(maxDepth) || maxDepth < 0) {
    throw new Error('maxDepth must be a non-negative integer');
  }

  const entries = new Map();
  const fifo = [];

  const canEnqueue = (url, depth) => {
    if (!Number.isInteger(depth) || depth < 0 || depth > maxDepth) {
      return false;
    }
    const origin = getOrigin(url);
    if (!origin || origin !== seedOrigin) {
      return false;
    }
    return true;
  };

  const enqueue = (url, depth) => {
    if (!canEnqueue(url, depth)) {
      return false;
    }
    const normalized = normalizeUrl(url);
    if (!normalized || entries.has(normalized)) {
      return false;
    }
    const entry = { url: normalized, depth, visited: false };
    entries.set(normalized, entry);
    fifo.push(normalized);
    return true;
  };

  const dequeue = () => {
    while (fifo.length > 0) {
      const nextUrl = fifo.shift();
      const entry = entries.get(nextUrl);
      if (entry && !entry.visited) {
        entry.visited = true;
        return { ...entry };
      }
    }
    return null;
  };

  const markVisited = (url) => {
    const normalized = normalizeUrl(url);
    const entry = normalized ? entries.get(normalized) : null;
    if (!entry) {
      return false;
    }
    entry.visited = true;
    return true;
  };

  const hasPending = () => fifo.some((url) => entries.get(url)?.visited === false);

  const getState = () => Array.from(entries.values()).map((entry) => ({ ...entry }));

  return {
    enqueue,
    dequeue,
    markVisited,
    hasPending,
    getState,
    seedOrigin,
    maxDepth,
  };
};
