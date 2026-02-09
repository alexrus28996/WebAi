const { randomUUID } = require('crypto');
const mongoose = require('mongoose');
const request = require('supertest');
const axios = require('axios');

jest.mock('normalize-url', () => (value) => value);
jest.setTimeout(20000);

const buildTestMongoUri = () => {
  const suffix = randomUUID().replace(/-/g, '').slice(0, 12);
  const baseUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;

  if (!baseUri) {
    return `mongodb://127.0.0.1:27017/webai_test_${suffix}`;
  }

  if (process.env.MONGO_URI_TEST) {
    return process.env.MONGO_URI_TEST;
  }

  try {
    const url = new URL(baseUri);
    const dbName = url.pathname && url.pathname !== '/' ? url.pathname.slice(1) : 'webai_test';
    url.pathname = `/${dbName}_${suffix}`;
    return url.toString();
  } catch (error) {
    return `${baseUri}_${suffix}`;
  }
};

const testMongoUri = buildTestMongoUri();
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.MONGO_URI = testMongoUri;
process.env.AI_PROVIDER = 'mock';

const app = require('../src/app');
const DraftPost = require('../src/models/DraftPost');

jest.mock('axios');

const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Test Feed</title>
    <item>
      <title>Sample Trend</title>
      <link>https://example.com/trend</link>
      <pubDate>${new Date().toUTCString()}</pubDate>
    </item>
  </channel>
</rss>`;

const createUserPayload = (overrides = {}) => ({
  name: 'Test User',
  email: `user-${randomUUID()}@example.com`,
  password: 'Password123!',
  workspaceName: 'Test Workspace',
  ...overrides
});

const signupUser = async () => {
  const payload = createUserPayload();
  const response = await request(app).post('/auth/signup').send(payload);
  return {
    response,
    token: response.body?.data?.token,
    workspaceId: response.body?.data?.workspace?.id
  };
};

describe('Integration flows', () => {
  beforeAll(async () => {
    axios.get.mockResolvedValue({ data: rssXml });
    await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000
    });
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
  });

  test('signup returns success true and login returns token', async () => {
    const userPayload = createUserPayload();
    const signupResponse = await request(app).post('/auth/signup').send(userPayload);

    expect(signupResponse.status).toBe(201);
    expect(signupResponse.body.success).toBe(true);

    const loginResponse = await request(app)
      .post('/auth/login')
      .send({ email: userPayload.email, password: userPayload.password });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body?.data?.token).toBeTruthy();
  });

  test('workspace authz enforces auth and workspace header validation', async () => {
    const { token } = await signupUser();

    const noTokenResponse = await request(app).get('/trends');
    expect(noTokenResponse.status).toBe(401);

    const invalidWorkspaceResponse = await request(app)
      .get('/trends')
      .set('Authorization', `Bearer ${token}`)
      .set('x-workspace-id', 'invalid-workspace');

    expect(invalidWorkspaceResponse.status).toBe(403);
  });

  test('end-to-end publishing flow posts a draft', async () => {
    const { token, workspaceId } = await signupUser();

    const fetchResponse = await request(app)
      .post('/trends/fetch')
      .set('Authorization', `Bearer ${token}`)
      .set('x-workspace-id', workspaceId)
      .send({});

    expect(fetchResponse.status).toBe(200);

    const listTrendsResponse = await request(app)
      .get('/trends')
      .set('Authorization', `Bearer ${token}`)
      .set('x-workspace-id', workspaceId);

    expect(listTrendsResponse.status).toBe(200);
    expect(Array.isArray(listTrendsResponse.body.data)).toBe(true);

    const trend = listTrendsResponse.body.data[0];
    expect(trend).toBeDefined();

    const generateDraftResponse = await request(app)
      .post('/drafts/generate')
      .set('Authorization', `Bearer ${token}`)
      .set('x-workspace-id', workspaceId)
      .send({ trendId: trend._id });

    expect(generateDraftResponse.status).toBe(201);

    const draftId = generateDraftResponse.body?.data?._id;
    expect(draftId).toBeTruthy();

    const scheduledTime = new Date(Date.now() - 1000).toISOString();

    const scheduleResponse = await request(app)
      .post('/schedule')
      .set('Authorization', `Bearer ${token}`)
      .set('x-workspace-id', workspaceId)
      .send({ draftId, scheduledTime });

    expect(scheduleResponse.status).toBe(200);

    const publisherResponse = await request(app)
      .post('/publisher/run')
      .set('Authorization', `Bearer ${token}`)
      .set('x-workspace-id', workspaceId)
      .send({});

    expect(publisherResponse.status).toBe(200);

    const draft = await DraftPost.findById(draftId);
    expect(draft.status).toBe('posted');
  });
});
