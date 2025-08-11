import React from 'react';

interface SchemaTreeProps {
  name: string;
  schema: any;
  components: Record<string, any>;
}

function SchemaNode({ schema, components, seen }: { schema: any; components: Record<string, any>; seen: Set<string>; }) {
  if (!schema || typeof schema !== 'object') {
    return <code>{JSON.stringify(schema)}</code>;
  }

  if (schema.$ref && typeof schema.$ref === 'string') {
    const m = schema.$ref.match(/^#\/components\/schemas\/([^/]+)$/);
    if (m) {
      const refName = m[1];
      return (
        <>
          <a href={`#schema-${refName}`}>{refName}</a>
          {!seen.has(refName) && (
            <SchemaNode schema={components[refName]} components={components} seen={new Set([...seen, refName])} />
          )}
        </>
      );
    }
  }

  if (schema.type === 'array' && schema.items) {
    return (
      <>
        array of <SchemaNode schema={schema.items} components={components} seen={seen} />
      </>
    );
  }

  const props = schema.properties || {};
  if (schema.type === 'object' || Object.keys(props).length > 0) {
    return (
      <ul>
        {Object.entries(props).map(([prop, sub]) => (
          <li key={prop}>
            <b>{prop}</b>: <SchemaNode schema={sub} components={components} seen={seen} />
          </li>
        ))}
      </ul>
    );
  }

  if (schema.enum) {
    return <code>{schema.enum.join(' | ')}</code>;
  }

  if (schema.type) {
    return <code>{schema.type}</code>;
  }

  return <code>any</code>;
}

export default function SchemaTree({ name, schema, components }: SchemaTreeProps) {
  return (
    <details id={`schema-${name}`}>
      <summary>
        <code>{name}</code>
      </summary>
      <SchemaNode schema={schema} components={components} seen={new Set([name])} />
    </details>
  );
}
