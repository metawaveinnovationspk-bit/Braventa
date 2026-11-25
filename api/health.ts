import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  getVerifiedCanonicalOrigin,
  isAllowedWebhookUrl,
  sendNodeJson,
} from '../src/utils/serverCore.ts';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    sendNodeJson(res, 405, { ok: false, message: 'Method not allowed.' });
    return;
  }

  const webhookUrl = process.env.ENQUIRY_WEBHOOK_URL?.trim();
  const webhookConfigured = Boolean(webhookUrl && isAllowedWebhookUrl(webhookUrl));

  sendNodeJson(res, 200, {
    ok: true,
    emailDispatchConfigured: webhookConfigured,
    canonicalConfigured: Boolean(getVerifiedCanonicalOrigin()),
  });
}
