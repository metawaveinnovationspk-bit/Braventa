import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  processEnquirySubmission,
  readRequestJsonBody,
  sendNodeJson,
} from '../src/utils/serverCore.ts';

export default async function handler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse,
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendNodeJson(res, 405, { ok: false, message: 'Method not allowed.' });
    return;
  }

  const parsed = await readRequestJsonBody(req);
  if (!parsed.ok) {
    sendNodeJson(res, parsed.status, { ok: false, message: parsed.message });
    return;
  }

  const result = await processEnquirySubmission(parsed.data);
  sendNodeJson(res, result.status, result.payload);
}
