const normalizeText = (text = '') =>
  text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (text = '') => {
  const normalized = normalizeText(text);
  if (!normalized) {
    return new Set();
  }
  return new Set(normalized.split(' '));
};

const calculateJaccardSimilarity = (textA, textB) => {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);
  if (!tokensA.size && !tokensB.size) {
    return 1;
  }
  if (!tokensA.size || !tokensB.size) {
    return 0;
  }
  let intersectionCount = 0;
  tokensA.forEach((token) => {
    if (tokensB.has(token)) {
      intersectionCount += 1;
    }
  });
  const unionCount = tokensA.size + tokensB.size - intersectionCount;
  return unionCount ? intersectionCount / unionCount : 0;
};

const findMaxSimilarityScore = (text, drafts = []) => {
  let maxScore = 0;
  drafts.forEach((draft) => {
    if (!draft?.content) {
      return;
    }
    const score = calculateJaccardSimilarity(text, draft.content);
    if (score > maxScore) {
      maxScore = score;
    }
  });
  return maxScore;
};

module.exports = {
  normalizeText,
  calculateJaccardSimilarity,
  findMaxSimilarityScore
};
