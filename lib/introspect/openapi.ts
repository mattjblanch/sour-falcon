import { fetchJson, withAuth } from './util';

const candidates = [
  '/.well-known/openapi.json',
  '/openapi.json',
  '/swagger.json',
  '/v1/openapi.json'
];

export async function tryOpenApi(baseUrl: string, apiKey?: string, headerName?: string) {
  for (const path of candidates) {
    const url = new URL(path.replace(/^\/+/, '/'), baseUrl).toString();
    try {
      const doc = await fetchJson(url, { headers: withAuth({}, apiKey, headerName) });
      if (doc && (doc.openapi || doc.swagger) && doc.paths) {
        return {
          ok: true as const,
          data: { kind: 'openapi', sourceUrl: url, info: doc.info, paths: doc.paths, components: doc.components }
        };
      }
    } catch { /* continue */ }
  }
  return { ok: false as const };
}
