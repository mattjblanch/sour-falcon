// components/GraphView.tsx
"use client";

import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { collectOperations, deriveTagFromPath } from '../lib/openapi/normalize';

export default function GraphView({ doc }: { doc: any }) {
  const { nodes, edges } = useMemo(() => {
    const ops = collectOperations(doc);
    const resSet = new Set<string>();
    ops.forEach(op => (op.tags.length ? op.tags : [deriveTagFromPath(op.path)]).forEach(t => resSet.add(t)));
    const resources = Array.from(resSet);

    const nodes = [
      ...resources.map((r, i) => ({ id: `res:${r}`, data: { label: r }, position: { x: 0, y: i * 90 } })),
      ...ops.map((op, i) => ({
        id: `op:${i}`,
        data: { label: `${op.method.toUpperCase()} ${op.path}` },
        position: { x: 420, y: i * 90 * 0.6 }
      }))
    ];
    const edges = ops.flatMap((op, i) => {
      const tags = op.tags.length ? op.tags : [deriveTagFromPath(op.path)];
      return tags.map(t => ({ id: `e:${t}:${i}`, source: `res:${t}`, target: `op:${i}` }));
    });
    return { nodes, edges };
  }, [doc]);

  return (
    <div style={{ height: 500, border: '1px solid rgba(0,0,0,.1)', borderRadius: 12 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}
