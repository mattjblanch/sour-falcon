// components/SchemaTree.tsx
import React from 'react';

function Field({ name, schema }: { name?: string; schema: any }) {
  const type = schema.type || (schema.enum ? 'enum' : schema.allOf ? 'allOf' : schema.oneOf ? 'oneOf' : schema.anyOf ? 'anyOf' : schema.$ref ? '$ref' : 'object');
  return (
    <li>
      {name && <code>{name}</code>} {type && <span className="small">({type})</span>}
      {schema.description && <span className="small"> — {schema.description}</span>}
      {Array.isArray(schema.enum) && (
        <div className="small">enum: {schema.enum.map((e:any)=>JSON.stringify(e)).join(', ')}</div>
      )}
      {schema.properties && (
        <ul>
          {Object.entries(schema.properties).map(([k, v]) => <Field key={k} name={k} schema={v} />)}
        </ul>
      )}
      {schema.items && (
        <ul><Field name={'items'} schema={schema.items} /></ul>
      )}
      {schema.allOf && (
        <ul>{schema.allOf.map((s:any,i:number)=><Field key={i} name={`allOf[${i}]`} schema={s} />)}</ul>
      )}
      {schema.oneOf && (
        <ul>{schema.oneOf.map((s:any,i:number)=><Field key={i} name={`oneOf[${i}]`} schema={s} />)}</ul>
      )}
      {schema.anyOf && (
        <ul>{schema.anyOf.map((s:any,i:number)=><Field key={i} name={`anyOf[${i}]`} schema={s} />)}</ul>
      )}
    </li>
  );
}

export default function SchemaTree({ schema }: { schema: any }) {
  if (!schema) return <p className="small">No schema provided.</p>;
  return (
    <div>
      <ul><Field schema={schema} /></ul>
    </div>
  );
}
