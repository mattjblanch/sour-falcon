import { fetchJson, withAuth, withQuery } from './util';

const candidates = [
  '/.well-known/openapi.json',
  '/openapi.json',
  '/swagger.json',
  '/v1/openapi.json'
];

export async function tryOpenApi(baseUrl: string, apiKey?: string, headerName?: string, authScheme?: string, authMethod?: string, queryName?: string) {
  for (const path of candidates) {
    let url = new URL(path.replace(/^\/+/, '/'), baseUrl).toString();
    try {
      if (authMethod === 'query') {
        url = withQuery(url, apiKey, queryName);
        const doc = await fetchJson(url);
        if (doc && (doc.openapi || doc.swagger) && doc.paths) {
          return {
            ok: true as const,
            data: {
              kind: 'openapi',
              sourceUrl: url,
              info: doc.info,
              paths: doc.paths,
              components: doc.components,
              openapi: doc.openapi,
              swagger: doc.swagger
            }
          };
        }
      } else {
        const doc = await fetchJson(url, { headers: withAuth({}, apiKey, headerName, authScheme) });
        if (doc && (doc.openapi || doc.swagger) && doc.paths) {
          return {
            ok: true as const,
            data: {
              kind: 'openapi',
              sourceUrl: url,
              info: doc.info,
              paths: doc.paths,
              components: doc.components,
              openapi: doc.openapi,
              swagger: doc.swagger
            }
          };
        }
      }
    } catch { /* continue */ }
  }
  return { ok: false as const };
}
