import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  buildRobotsTxt,
  getVerifiedCanonicalOrigin,
  sendNodeText,
} from '../src/utils/serverCore.ts';

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  const canonicalOrigin = getVerifiedCanonicalOrigin();
  sendNodeText(res, 200, 'text/plain; charset=utf-8', buildRobotsTxt(canonicalOrigin));
}
