import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { tryJsonApi } from './jsonapi.ts';

test('detects JSON:API', async () => {
  const server = http.createServer((_, res) => {
    const addr = server.address() as AddressInfo;
    const base = `http://127.0.0.1:${addr.port}`;
    res.setHeader('content-type', 'application/vnd.api+json');
    res.end(JSON.stringify({
      data: { type: 'articles', id: '1' },
      links: { self: `${base}/articles/1` }
    }));
  });
  await new Promise<void>(resolve => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  const url = `http://127.0.0.1:${port}`;
  const result = await tryJsonApi(url);
  assert.equal(result.ok, true);
  assert.deepEqual(result.data, {
    kind: 'jsonapi',
    resources: ['articles'],
    links: [{ rel: 'self', href: `${url}/articles/1` }]
  });
  server.close();
});
