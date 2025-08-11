import test from 'node:test';
import assert from 'assert';
import { isOpenApi, collectOperations, buildCapabilityMatrix, resolveSchemaRef, pickPrimaryResponse } from './normalize';

const doc = {
  openapi: '3.0.0',
  paths: {
    '/users': {
      get: {
        operationId: 'listUsers',
        tags: ['users'],
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          }
        }
      },
      post: {
        operationId: 'createUser',
        tags: ['users'],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' }
            }
          }
        },
        responses: {
          '201': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          }
        }
      }
    },
    '/users/{id}': {
      get: {
        operationId: 'getUser',
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          }
        }
      },
      delete: {
        operationId: 'deleteUser',
        responses: {
          '204': { content: {} }
        }
      }
    }
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' }
        }
      }
    }
  }
};

test('normalize helpers', () => {
  assert.ok(isOpenApi(doc));
  const ops = collectOperations(doc);
  assert.equal(ops.length, 4);
  const matrix = buildCapabilityMatrix(ops);
  assert.deepEqual(matrix.users, { GET: 2, POST: 1, DELETE: 1 });
  const resolved = resolveSchemaRef(doc, { $ref: '#/components/schemas/User' });
  assert.equal(resolved.properties.id.type, 'string');
  const resp = pickPrimaryResponse(ops[0]);
  assert.ok(resp && resp.status === '200');
});
