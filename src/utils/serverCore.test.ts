import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  buildRobotsTxt,
  buildSitemapXml,
  getVerifiedCanonicalOrigin,
  isAllowedWebhookUrl,
  processEnquirySubmission,
} from './serverCore.ts';
import enquiriesHandler from '../../api/enquiries.ts';
import healthHandler from '../../api/health.ts';
import robotsHandler from '../../api/robots.ts';
import sitemapHandler from '../../api/sitemap.ts';

function createMockRes() {
  const headers = new Map<string, string>();
  let body = '';
  const res = {
    statusCode: 200,
    setHeader(name: string, value: string | number | readonly string[]) {
      headers.set(name.toLowerCase(), Array.isArray(value) ? value.join(', ') : String(value));
      return this;
    },
    end(chunk?: unknown) {
      if (chunk !== undefined) {
        body += typeof chunk === 'string' ? chunk : String(chunk);
      }
      return this;
    },
  };
  return {
    res: res as unknown as ServerResponse,
    getStatus: () => res.statusCode,
    getHeader: (name: string) => headers.get(name.toLowerCase()),
    getBody: () => body,
  };
}

function createMockReq(method: string, body?: unknown) {
  const emitter = new EventEmitter() as IncomingMessage & { body?: unknown };
  emitter.method = method;
  if (body !== undefined) {
    emitter.body = body;
  }
  return emitter;
}

test('getVerifiedCanonicalOrigin blocks preview and localhost origins', () => {
  assert.equal(getVerifiedCanonicalOrigin({ CANONICAL_ORIGIN: '' }), null);
  assert.equal(
    getVerifiedCanonicalOrigin({ CANONICAL_ORIGIN: 'https://ais-dev-abc.run.app' }),
    null,
  );
  assert.equal(
    getVerifiedCanonicalOrigin({ CANONICAL_ORIGIN: 'https://ais-pre-abc.run.app' }),
    null,
  );
  assert.equal(
    getVerifiedCanonicalOrigin({ CANONICAL_ORIGIN: 'http://localhost:3000' }),
    null,
  );
  assert.equal(
    getVerifiedCanonicalOrigin({ CANONICAL_ORIGIN: 'https://www.braventa-vet.com/' }),
    'https://www.braventa-vet.com',
  );
});

test('isAllowedWebhookUrl blocks private/loopback/metadata hosts and permits public HTTPS', () => {
  assert.equal(isAllowedWebhookUrl('http://127.0.0.1:8080/hook'), false);
  assert.equal(isAllowedWebhookUrl('http://localhost:3000/hook'), false);
  assert.equal(isAllowedWebhookUrl('http://169.254.169.254/latest/meta-data'), false);
  assert.equal(isAllowedWebhookUrl('https://10.0.0.5/hook'), false);
  assert.equal(isAllowedWebhookUrl('https://192.168.1.10/hook'), false);
  assert.equal(isAllowedWebhookUrl('ftp://hooks.example.com/in'), false);
  assert.equal(isAllowedWebhookUrl('https://hooks.example.com/braventa'), true);
});

test('buildRobotsTxt and buildSitemapXml respect verified canonical origin', () => {
  const robotsNoOrigin = buildRobotsTxt(null);
  assert.doesNotMatch(robotsNoOrigin, /Sitemap:/);
  assert.match(robotsNoOrigin, /Disallow: \/api\//);

  const robotsWithOrigin = buildRobotsTxt('https://www.braventa-vet.com');
  assert.match(robotsWithOrigin, /Sitemap: https:\/\/www\.braventa-vet\.com\/sitemap\.xml/);

  const sitemap = buildSitemapXml(
    'https://www.braventa-vet.com',
    new Date('2026-11-25T00:00:00.000Z'),
  );
  assert.match(sitemap, /<loc>https:\/\/www\.braventa-vet\.com\/<\/loc>/);
  assert.match(sitemap, /<lastmod>2026-11-25<\/lastmod>/);
});

test('processEnquirySubmission validates input and handles webhook vs local recording', async () => {
  const invalid = await processEnquirySubmission({ fullName: 'A' });
  assert.equal(invalid.status, 400);
  assert.equal(invalid.payload.ok, false);

  const validPayload = {
    fullName: 'Dr. Somchai Wattana',
    company: 'Siam Vet Distribution',
    businessEmail: 'somchai@siamvet.example',
    country: 'Thailand',
    enquiryType: 'Distribution Enquiry',
    message: 'Interested in wholesale distribution terms for Braventa Fluralaner Tablets.',
  };

  const localResult = await processEnquirySubmission(validPayload, {
    env: {},
    now: new Date('2026-11-25T10:00:00.000Z'),
  });
  assert.equal(localResult.status, 201);
  assert.equal(localResult.payload.ok, true);
  if (localResult.payload.ok) {
    assert.equal(localResult.payload.deliveryMode, 'recorded_locally_no_email_gateway');
    assert.equal(localResult.payload.emailDispatchConfigured, false);
  }

  let calledUrl = '';
  const webhookResult = await processEnquirySubmission(validPayload, {
    env: { ENQUIRY_WEBHOOK_URL: 'https://hooks.example.com/braventa' },
    fetchImpl: (async (url: string | URL | Request) => {
      calledUrl = String(url);
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }) as typeof fetch,
  });
  assert.equal(calledUrl, 'https://hooks.example.com/braventa');
  assert.equal(webhookResult.status, 201);
  if (webhookResult.payload.ok) {
    assert.equal(webhookResult.payload.deliveryMode, 'webhook_dispatched');
    assert.equal(webhookResult.payload.emailDispatchConfigured, true);
  }
});

test('Vercel serverless handlers respond cleanly for HTTP methods and routes', async () => {
  const getEnquiriesRes = createMockRes();
  await enquiriesHandler(createMockReq('GET'), getEnquiriesRes.res);
  assert.equal(getEnquiriesRes.getStatus(), 405);
  assert.equal(getEnquiriesRes.getHeader('allow'), 'POST');

  const postEnquiriesRes = createMockRes();
  await enquiriesHandler(
    createMockReq('POST', {
      fullName: 'Elena Rostova',
      company: 'EuroVet Distribution GmbH',
      businessEmail: 'elena@eurovet.example',
      country: 'Germany',
      enquiryType: 'Import / Wholesale Enquiry',
      message: 'Requesting product documentation and wholesale onboarding information.',
    }),
    postEnquiriesRes.res,
  );
  assert.equal(postEnquiriesRes.getStatus(), 201);
  const parsedEnquiry = JSON.parse(postEnquiriesRes.getBody());
  assert.equal(parsedEnquiry.ok, true);
  assert.match(parsedEnquiry.referenceId, /^BRV-\d{8}-\d{4}$/);

  const healthRes = createMockRes();
  healthHandler(createMockReq('GET'), healthRes.res);
  assert.equal(healthRes.getStatus(), 200);
  assert.equal(JSON.parse(healthRes.getBody()).ok, true);

  const robotsRes = createMockRes();
  robotsHandler(createMockReq('GET'), robotsRes.res);
  assert.equal(robotsRes.getStatus(), 200);
  assert.match(robotsRes.getBody(), /User-agent: \*/);

  const sitemapRes = createMockRes();
  sitemapHandler(createMockReq('GET'), sitemapRes.res);
  assert.equal(sitemapRes.getStatus(), 200);
  assert.match(sitemapRes.getBody(), /<urlset/);
});
