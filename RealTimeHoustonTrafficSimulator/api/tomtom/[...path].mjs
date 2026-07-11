import { proxyRequest, sendVercel } from '../_proxy.mjs';

export default async function handler(req, res) {
  const key = process.env.TOMTOM_API_KEY || '';
  const result = await proxyRequest(req, {
    upstreamOrigin: 'https://api.tomtom.com',
    stripPrefixes: ['/api/tomtom'],
    injectQuery: key ? { key } : {},
  });
  sendVercel(res, result);
}
