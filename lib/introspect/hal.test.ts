import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { tryHal } from './hal.ts';

test('detects HAL', async () => {
  const server = http.createServer((_, res) => {
    const addr = server.address() as AddressInfo;
    const base = `http://127.0.0.1:${addr.port}`;
    res.setHeader('content-type', 'application/hal+json');
    res.end(JSON.stringify({
      _links: {
        self: { href: `${base}/orders` },
        next: { href: `${base}/orders?page=2` }
      },
      _embedded: {
        orders: [ { id: 1 }, { id: 2 } ]
      }
    }));
  });
  await new Promise<void>(resolve => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  const url = `http://127.0.0.1:${port}`;
  const result = await tryHal(url);
  assert.equal(result.ok, true);
  assert.deepEqual(result.data, {
    kind: 'hal',
    resources: ['orders'],
    links: [
      { rel: 'self', href: `${url}/orders` },
      { rel: 'next', href: `${url}/orders?page=2` }
    ]
  });
  server.close();
});
