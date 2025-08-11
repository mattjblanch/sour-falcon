import { test } from 'node:test';
import assert from 'node:assert/strict';
import { withAuth, withQuery } from './util.ts';

test('adds Bearer scheme by default', () => {
  const h = new Headers(withAuth({}, 'secret'));
  assert.equal(h.get('Authorization'), 'Bearer secret');
});

test('supports Basic scheme', () => {
  const creds = 'user:pass';
  const expected = 'Basic ' + Buffer.from(creds).toString('base64');
  const h = new Headers(withAuth({}, creds, undefined, 'Basic'));
  assert.equal(h.get('Authorization'), expected);
});

test('supports custom scheme and header', () => {
  const h = new Headers(withAuth({}, 't', 'X-API-Key', 'Token'));
  assert.equal(h.get('X-API-Key'), 'Token t');
});

test('appends API key to query', () => {
  const url = withQuery('https://example.com/data', 'abc', 'api_key');
  assert.equal(url, 'https://example.com/data?api_key=abc');
});
