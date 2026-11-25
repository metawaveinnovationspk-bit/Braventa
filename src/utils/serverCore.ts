import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  formatEnquirySummary,
  generateEnquiryReference,
  validateEnquiryInput,
  type EnquiryValidationErrors,
  type ValidatedEnquiry,
} from './enquiryValidation.ts';

export type EnquiryDeliveryMode = 'webhook_dispatched' | 'recorded_locally_no_email_gateway';

export interface EnquirySubmissionSuccessPayload {
  ok: true;
  referenceId: string;
  recordedAt: string;
  deliveryMode: EnquiryDeliveryMode;
  emailDispatchConfigured: boolean;
  enquiry: ValidatedEnquiry;
  formattedSummary: string;
}

export interface EnquirySubmissionErrorPayload {
  ok: false;
  message: string;
  errors?: EnquiryValidationErrors;
}

export type FetchLike = typeof fetch;

const BLOCKED_PRIVATE_HOSTS = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '[::1]',
  '169.254.169.254',
  'metadata.google.internal',
]);

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split('.');
  if (parts.length !== 4 || parts.some((p) => !/^\d+$/.test(p))) {
    return false;
  }
  const nums = parts.map(Number);
  if (nums.some((n) => n < 0 || n > 255)) {
    return false;
  }
  const [a, b] = nums;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

export function isAllowedWebhookUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    if (!host || BLOCKED_PRIVATE_HOSTS.has(host) || host.endsWith('.local')) {
      return false;
    }
    if (isPrivateIpv4(host)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function getVerifiedCanonicalOrigin(env: NodeJS.ProcessEnv = process.env): string | null {
  const raw = env.CANONICAL_ORIGIN?.trim().replace(/\/+$/, '');
  if (!raw) return null;
  if (raw.includes('ais-dev-') || raw.includes('ais-pre-') || raw.includes('localhost')) {
    return null;
  }
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return null;
    }
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return null;
  }
}

export function buildRobotsTxt(canonicalOrigin: string | null): string {
  const lines = ['User-agent: *', 'Allow: /', 'Disallow: /api/'];
  if (canonicalOrigin) {
    lines.push(`Sitemap: ${canonicalOrigin}/sitemap.xml`);
  }
  return `${lines.join('\n')}\n`;
}

export function buildSitemapXml(canonicalOrigin: string | null, now: Date = new Date()): string {
  const loc = canonicalOrigin ? `${canonicalOrigin}/` : '/';
  const lastmod = now.toISOString().split('T')[0];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
}

export async function processEnquirySubmission(
  rawBody: unknown,
  options?: {
    env?: NodeJS.ProcessEnv;
    fetchImpl?: FetchLike;
    now?: Date;
  },
): Promise<{
  status: number;
  payload: EnquirySubmissionSuccessPayload | EnquirySubmissionErrorPayload;
}> {
  const bodyObj =
    rawBody && typeof rawBody === 'object' && !Array.isArray(rawBody)
      ? (rawBody as Record<string, unknown>)
      : {};

  const validation = validateEnquiryInput(bodyObj);

  if (!validation.isValid || !validation.sanitized) {
    return {
      status: 400,
      payload: {
        ok: false,
        message: 'Please review the highlighted fields before submitting your enquiry.',
        errors: validation.errors,
      },
    };
  }

  const env = options?.env ?? process.env;
  const fetchImpl = options?.fetchImpl ?? fetch;
  const now = options?.now ?? new Date();
  const recordedAt = now.toISOString();
  const referenceId = generateEnquiryReference(now);
  const webhookUrl = env.ENQUIRY_WEBHOOK_URL?.trim();

  let deliveryMode: EnquiryDeliveryMode = 'recorded_locally_no_email_gateway';

  if (webhookUrl && isAllowedWebhookUrl(webhookUrl)) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const webhookResponse = await fetchImpl(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            referenceId,
            recordedAt,
            product: 'BRAVENTA Fluralaner Tablets',
            manufacturer: 'VELTRION Animal Health',
            origin: 'Thailand',
            enquiry: validation.sanitized,
          }),
        });

        if (webhookResponse.ok) {
          deliveryMode = 'webhook_dispatched';
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (err) {
      console.error('Enquiry webhook dispatch failed:', err);
    }
  }

  const formattedSummary = formatEnquirySummary(validation.sanitized, referenceId, recordedAt);

  return {
    status: 201,
    payload: {
      ok: true,
      referenceId,
      recordedAt,
      deliveryMode,
      emailDispatchConfigured: deliveryMode === 'webhook_dispatched',
      enquiry: validation.sanitized,
      formattedSummary,
    },
  };
}

export async function readRequestJsonBody(
  req: IncomingMessage & { body?: unknown },
  maxBytes = 65536,
): Promise<{ ok: true; data: unknown } | { ok: false; status: number; message: string }> {
  if (req.body !== undefined) {
    if (typeof req.body === 'string') {
      if (Buffer.byteLength(req.body, 'utf8') > maxBytes) {
        return { ok: false, status: 413, message: 'Request payload is too large.' };
      }
      if (!req.body.trim()) {
        return { ok: true, data: {} };
      }
      try {
        return { ok: true, data: JSON.parse(req.body) };
      } catch {
        return { ok: false, status: 400, message: 'Invalid JSON request body.' };
      }
    }
    return { ok: true, data: req.body };
  }

  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    let settled = false;

    req.on('data', (chunk: Buffer | string) => {
      if (settled) return;
      const buf = typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : chunk;
      totalBytes += buf.length;
      if (totalBytes > maxBytes) {
        settled = true;
        resolve({ ok: false, status: 413, message: 'Request payload is too large.' });
        return;
      }
      chunks.push(buf);
    });

    req.on('end', () => {
      if (settled) return;
      settled = true;
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) {
        resolve({ ok: true, data: {} });
        return;
      }
      try {
        resolve({ ok: true, data: JSON.parse(raw) });
      } catch {
        resolve({ ok: false, status: 400, message: 'Invalid JSON request body.' });
      }
    });

    req.on('error', () => {
      if (settled) return;
      settled = true;
      resolve({ ok: false, status: 400, message: 'Unable to read request body.' });
    });
  });
}

export function sendNodeJson(res: ServerResponse, statusCode: number, payload: unknown): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

export function sendNodeText(
  res: ServerResponse,
  statusCode: number,
  contentType: string,
  body: string,
): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', contentType);
  res.end(body);
}
