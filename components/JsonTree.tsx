import React from 'react';

interface JsonTreeProps {
  data: any;
  name?: string;
}

function isObject(value: any) {
  return typeof value === 'object' && value !== null;
}

export default function JsonTree({ data, name }: JsonTreeProps) {
  if (!isObject(data)) {
    return (
      <span>
        {name ? <><b>{name}</b>: </> : null}
        <code>{JSON.stringify(data)}</code>
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

