const normalizeUrl = require('normalize-url');

const normalizeTrendTitle = (title) => {
  if (!title || typeof title !== 'string') {
    return null;
  }
  return title.toLowerCase().replace(/\s+/g, ' ').trim();
};

const normalizeTrendUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }
  try {
    return normalizeUrl(url, {
      stripHash: true,
      removeTrailingSlash: true,
      removeQueryParameters: [
        /^utm_/i,
        /^fbclid$/i,
        /^gclid$/i,
        /^yclid$/i,
        /^mc_cid$/i,
        /^mc_eid$/i
      ]
    });
  } catch (error) {
    return null;
  }
};

module.exports = {
  normalizeTrendTitle,
  normalizeTrendUrl
};
