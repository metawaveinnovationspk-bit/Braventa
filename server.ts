import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import {
  formatEnquirySummary,
  generateEnquiryReference,
  validateEnquiryInput,
  type ValidatedEnquiry,
} from './src/utils/enquiryValidation.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

interface RecordedEnquiryRecord {
  referenceId: string;
  recordedAt: string;
  deliveryMode: 'webhook_dispatched' | 'recorded_locally_no_email_gateway';
  enquiry: ValidatedEnquiry;
}

const recordedEnquiries: RecordedEnquiryRecord[] = [];

function getVerifiedCanonicalOrigin(): string | null {
  const raw = process.env.CANONICAL_ORIGIN?.trim().replace(/\/+$/, '');
  if (!raw) return null;
  if (raw.includes('ais-dev-') || raw.includes('ais-pre-') || raw.includes('localhost')) {
    return null;
  }
  return raw;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.get('/robots.txt', (_req: Request, res: Response) => {
    const canonicalOrigin = getVerifiedCanonicalOrigin();
    const lines = [
      'User-agent: *',
      'Allow: /',
      'Disallow: /api/',
    ];
    if (canonicalOrigin) {
      lines.push(`Sitemap: ${canonicalOrigin}/sitemap.xml`);
    }
    res.type('text/plain').send(lines.join('\n') + '\n');
  });

  app.get('/sitemap.xml', (_req: Request, res: Response) => {
    const canonicalOrigin = getVerifiedCanonicalOrigin();
    const loc = canonicalOrigin ? `${canonicalOrigin}/` : '/';
    const lastmod = new Date().toISOString().split('T')[0];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
    res.type('application/xml').send(xml);
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    const webhookConfigured = Boolean(process.env.ENQUIRY_WEBHOOK_URL?.trim());
    res.json({
      ok: true,
      emailDispatchConfigured: webhookConfigured,
      canonicalConfigured: Boolean(getVerifiedCanonicalOrigin()),
      recordedCount: recordedEnquiries.length,
    });
  });

  app.post('/api/enquiries', async (req: Request, res: Response) => {
    const validation = validateEnquiryInput(req.body ?? {});

    if (!validation.isValid || !validation.sanitized) {
      res.status(400).json({
        ok: false,
        message: 'Please review the highlighted fields before submitting your enquiry.',
        errors: validation.errors,
      });
      return;
    }

    const now = new Date();
    const recordedAt = now.toISOString();
    const referenceId = generateEnquiryReference(now);
    const webhookUrl = process.env.ENQUIRY_WEBHOOK_URL?.trim();

    let deliveryMode: RecordedEnquiryRecord['deliveryMode'] = 'recorded_locally_no_email_gateway';

    if (webhookUrl) {
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      } catch (err) {
        console.error('Enquiry webhook dispatch failed:', err);
      }
    }

    const record: RecordedEnquiryRecord = {
      referenceId,
      recordedAt,
      deliveryMode,
      enquiry: validation.sanitized,
    };

    recordedEnquiries.push(record);
    if (recordedEnquiries.length > 200) {
      recordedEnquiries.shift();
    }

    const formattedSummary = formatEnquirySummary(validation.sanitized, referenceId, recordedAt);

    res.status(201).json({
      ok: true,
      referenceId,
      recordedAt,
      deliveryMode,
      emailDispatchConfigured: deliveryMode === 'webhook_dispatched',
      enquiry: validation.sanitized,
      formattedSummary,
    });
  });

  app.all('/api/*', (_req: Request, res: Response) => {
    res.status(404).json({ ok: false, message: 'API endpoint not found.' });
  });

  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distDir)) {
      app.use(express.static(distDir));
      app.get('*', (req: Request, res: Response) => {
        const isRoot = req.path === '/' || req.path === '/index.html';
        res.status(isRoot ? 200 : 404).sendFile(path.join(distDir, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Braventa corporate server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Braventa server:', err);
  process.exit(1);
});
