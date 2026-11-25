import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express, { type Request, type Response } from 'express';
import {
  buildRobotsTxt,
  buildSitemapXml,
  getVerifiedCanonicalOrigin,
  isAllowedWebhookUrl,
  processEnquirySubmission,
} from './src/utils/serverCore.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.get('/robots.txt', (_req: Request, res: Response) => {
    const canonicalOrigin = getVerifiedCanonicalOrigin();
    res.type('text/plain').send(buildRobotsTxt(canonicalOrigin));
  });

  app.get('/sitemap.xml', (_req: Request, res: Response) => {
    const canonicalOrigin = getVerifiedCanonicalOrigin();
    res.type('application/xml').send(buildSitemapXml(canonicalOrigin));
  });

  app.get('/api/health', (_req: Request, res: Response) => {
    const webhookUrl = process.env.ENQUIRY_WEBHOOK_URL?.trim();
    const webhookConfigured = Boolean(webhookUrl && isAllowedWebhookUrl(webhookUrl));
    res.json({
      ok: true,
      emailDispatchConfigured: webhookConfigured,
      canonicalConfigured: Boolean(getVerifiedCanonicalOrigin()),
    });
  });

  app.post('/api/enquiries', async (req: Request, res: Response) => {
    const result = await processEnquirySubmission(req.body ?? {});
    res.status(result.status).json(result.payload);
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
