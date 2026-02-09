const axios = require('axios');
const Parser = require('rss-parser');
const Trend = require('../models/Trend');
const TrendSource = require('../models/TrendSource');
const { normalizeTrendTitle, normalizeTrendUrl } = require('../utils/trendNormalization');
const logger = require('../utils/logger');

const parser = new Parser();

const DEFAULT_TREND_SOURCES = [
  {
    name: 'Google Search Central Blog',
    url: 'https://developers.google.com/search/blog/rss.xml',
    freshnessHours: 48
  },
  {
    name: 'Search Engine Journal',
    url: 'https://www.searchenginejournal.com/feed/',
    freshnessHours: 48
  },
  {
    name: 'Search Engine Land',
    url: 'https://searchengineland.com/feed',
    freshnessHours: 48
  }
];

const ensureDefaultSources = async (workspaceId) => {
  const existingCount = await TrendSource.countDocuments({ workspaceId });
  if (existingCount > 0) {
    return;
  }

  const sources = DEFAULT_TREND_SOURCES.map((source) => ({
    workspaceId,
    name: source.name,
    url: source.url,
    enabled: true,
    freshnessHours: source.freshnessHours
  }));

  await TrendSource.insertMany(sources);
};

const parsePublishedAt = (item) => {
  const dateValue = item.isoDate || item.pubDate || item.published;
  if (!dateValue) {
    return null;
  }
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

const fetchTrendsForWorkspace = async (workspaceId, { requestId } = {}) => {
  await ensureDefaultSources(workspaceId);
  const sources = await TrendSource.find({ workspaceId, enabled: true });
  const summary = {
    insertedCount: 0,
    skippedOldCount: 0,
    skippedDuplicateCount: 0,
    sourcesChecked: sources.length,
    sourcesSucceeded: 0,
    sourcesFailed: 0
  };

  const now = new Date();

  for (const source of sources) {
    let feed;
    try {
      const response = await axios.get(source.url, { timeout: 15000, responseType: 'text' });
      feed = await parser.parseString(response.data);
      await TrendSource.updateOne(
        { _id: source._id },
        { $set: { lastFetchedAt: now, lastError: null, lastErrorAt: null } }
      );
      summary.sourcesSucceeded += 1;
    } catch (error) {
      const message = (error && error.message ? error.message : 'Unknown error').slice(0, 300);
      await TrendSource.updateOne(
        { _id: source._id },
        { $set: { lastError: message, lastErrorAt: now } }
      );
      logger.warn({
        requestId,
        action: 'TRENDS_FETCH_SOURCE_FAILED',
        workspaceId,
        source: source.name,
        message
      });
      summary.sourcesFailed += 1;
      continue;
    }

    const freshnessHours = source.freshnessHours || 48;
    const freshnessCutoff = new Date(now.getTime() - freshnessHours * 60 * 60 * 1000);

    for (const item of feed.items || []) {
      const title = item.title ? item.title.trim() : null;
      const url = item.link || item.guid || null;
      const publishedAt = parsePublishedAt(item);

      if (!title || !url || !publishedAt) {
        continue;
      }

      if (publishedAt < freshnessCutoff) {
        summary.skippedOldCount += 1;
        continue;
      }

      const titleNormalized = normalizeTrendTitle(title);
      const urlNormalized = normalizeTrendUrl(url);

      if (!titleNormalized || !urlNormalized) {
        continue;
      }

      const trendDoc = {
        workspaceId,
        url,
        urlNormalized,
        title,
        titleNormalized,
        source: source.name,
        publishedAt,
        fetchedAt: now,
        status: 'new'
      };

      const result = await Trend.updateOne(
        { workspaceId, urlNormalized },
        { $setOnInsert: trendDoc },
        { upsert: true }
      );

      if (result.upsertedCount === 1) {
        summary.insertedCount += 1;
      } else {
        summary.skippedDuplicateCount += 1;
      }
    }
  }

  return summary;
};

module.exports = {
  fetchTrendsForWorkspace
};
