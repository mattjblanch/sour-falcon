// lib/openapi/normalize.ts
export type HttpMethod = 'get'|'post'|'put'|'patch'|'delete'|'head'|'options'|'trace';
export type Operation = {
  id: string;
  method: HttpMethod;
  path: string;
  tags: string[];
  summary?: string;
  security?: any[];
  requestBody?: any;
  responses?: Record<string, any>;
};

type OpenAPIDoc = {
  openapi?: string;
  swagger?: string;
  paths?: Record<string, Record<string, any>>;
  components?: { schemas?: Record<string, any> };
};

export function isOpenApi(doc: any): doc is OpenAPIDoc {
  return !!doc && (typeof doc === 'object') && (doc.openapi || doc.swagger) && doc.paths;
}

const METHODS: HttpMethod[] = ['get','post','put','patch','delete','head','options','trace'];

export function collectOperations(doc: OpenAPIDoc): Operation[] {
  const out: Operation[] = [];
  for (const [path, byMethod] of Object.entries(doc.paths || {})) {
    for (const m of METHODS) {
      const op = (byMethod as any)[m];
      if (!op) continue;
      out.push({
        id: op.operationId || `${m.toUpperCase()} ${path}`,
        method: m,
        path,
        tags: Array.isArray(op.tags) && op.tags.length ? op.tags : [deriveTagFromPath(path)],
        summary: op.summary || op.description,
        security: op.security,
        requestBody: op.requestBody,
        responses: op.responses
      });
    }
  }
  return out;
}

export function deriveTagFromPath(path: string): string {
  // e.g., "/users/{id}/posts" -> "users"
  const seg = path.split('/').filter(Boolean)[0] || 'root';
  return seg.replace(/\{.*?\}/g, '').trim() || 'root';
}

export type ResourceMatrix = Record<string, Partial<Record<Uppercase<HttpMethod>, number>>>;

export function buildCapabilityMatrix(ops: Operation[]): ResourceMatrix {
  const matrix: ResourceMatrix = {};
  for (const op of ops) {
    for (const tag of (op.tags.length ? op.tags : ['untagged'])) {
      const key = tag;
      matrix[key] = matrix[key] || {};
      const col = op.method.toUpperCase() as Uppercase<HttpMethod>;
      matrix[key][col] = (matrix[key][col] || 0) + 1;
    }
  }
  return matrix;
}

// -------- $ref resolution (minimal) ----------
export function resolveSchemaRef(doc: OpenAPIDoc, schema: any, seen = new Set()): any {
  if (!schema) return schema;
  if (schema.$ref) {
    const ref = schema.$ref as string;
    if (!ref.startsWith('#/components/schemas/')) return schema;
    const key = ref.substring('#/components/schemas/'.length);
    if (seen.has(key)) return { $ref: ref, circular: true };
    seen.add(key);
    const target = doc.components?.schemas?.[key];
    return resolveSchemaRef(doc, target, seen);
  }
  // handle allOf/oneOf/anyOf shallowly
  for (const comb of ['allOf','oneOf','anyOf'] as const) {
    if (Array.isArray(schema[comb])) {
      return {
        ...schema,
        [comb]: schema[comb].map((s: any) => resolveSchemaRef(doc, s, new Set(seen)))
      };
    }
  }
  if (schema.properties) {
    const next: any = { ...schema, properties: {} };
    for (const [k, v] of Object.entries(schema.properties)) {
      (next.properties as any)[k] = resolveSchemaRef(doc, v, new Set(seen));
    }
    return next;
  }
  if (schema.items) {
    return { ...schema, items: resolveSchemaRef(doc, schema.items, new Set(seen)) };
  }
  return schema;
}

export function pickPrimaryResponse(op: Operation): { status: string; content?: any } | null {
  const responses = op.responses || {};
  const preferred = ['200','201','202','default', ...Object.keys(responses)];
  for (const code of preferred) {
    if (!responses[code]) continue;
    return { status: code, content: responses[code].content };
  }
  return null;
}
