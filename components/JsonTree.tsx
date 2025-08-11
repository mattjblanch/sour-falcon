import React from 'react';

interface JsonTreeProps {
  data: any;
  name?: string;
}

function isObject(value: any) {
  return typeof value === 'object' && value !== null;
}

export default function JsonTree({ data, name }: JsonTreeProps) {
  if (isObject(data) && typeof (data as any).$ref === 'string') {
    const ref = (data as any).$ref as string;
    const m = ref.match(/^#\/components\/schemas\/([^/]+)$/);
    if (m) {
      const refName = m[1];
      return (
        <span>
          {name ? (
            <>
              <b>{name}</b>: <a href={`#schema-${refName}`}>{refName}</a>
            </>
          ) : (
            <a href={`#schema-${refName}`}>{refName}</a>
          )}
        </span>
      );
    }
  }

  if (!isObject(data)) {
    return (
      <span>
        {name ? (
          <>
            <b>{name}</b>: <code>{JSON.stringify(data)}</code>
          </>
        ) : (
          <code>{JSON.stringify(data)}</code>
        )}
      </span>
    );
  }

  const entries = Object.entries(data as Record<string, any>);

  return (
    <details>
      <summary>{name ?? (Array.isArray(data) ? 'array' : 'object')}</summary>
      <ul>
        {entries.map(([key, value]) => (
          <li key={key}>
            <JsonTree data={value} name={key} />
          </li>
        ))}
      </ul>
    </details>
  );
}

