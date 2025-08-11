import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { tryRest } from './rest.ts';

test('detects REST JSON array', async () => {
  const server = http.createServer((req, res) => {
    if (req.url === '/people.json') {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify([
        { id: 1, name: 'Alice', nested: { foo: 'bar' } }
      ]));
    } else {
      res.statusCode = 404; res.end();
    }
  });
  await new Promise<void>(resolve => server.listen(0, resolve));
  const port = (server.address() as AddressInfo).port;
  const base = `http://127.0.0.1:${port}`;
  const url = `${base}/people.json`;
  const result = await tryRest(url);
  assert.equal(result.ok, true);
  const data: any = result.data;
  assert.equal(data.kind, 'rest');
  assert.equal(data.resource, 'people');
  assert.equal(data.idKey, 'id');
  assert.equal(data.itemUrlTemplate, `${base}/people/{id}.json`);
  assert.ok(Array.isArray(data.sample));
  assert.ok(data.fields.find((f:any)=>f.name==='id'));
  assert.ok(data.fields.find((f:any)=>f.name==='name'));
  assert.ok(data.fields.find((f:any)=>f.name==='nested.foo'));
  server.close();
});
