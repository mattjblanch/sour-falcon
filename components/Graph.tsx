'use client';

import React from 'react';
import ReactFlow, { Background, Controls, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

export interface GraphOp {
  id: string;
  label: string;
  cluster: string;
}

export default function Graph({ ops, onSelect }: { ops: GraphOp[]; onSelect: (id: string) => void }) {
  const clusters = Array.from(new Set(ops.map((o) => o.cluster)));

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  clusters.forEach((cluster, i) => {
    const clusterId = `cluster-${cluster}`;
    const x = i * 250;
    nodes.push({ id: clusterId, data: { label: cluster }, position: { x, y: 0 }, type: 'input' });

    const clusterOps = ops.filter((o) => o.cluster === cluster);
    clusterOps.forEach((op, j) => {
      const y = (j + 1) * 80;
      nodes.push({ id: op.id, data: { label: op.label }, position: { x, y } });
      edges.push({ id: `${clusterId}-${op.id}`, source: clusterId, target: op.id });
    });
  });

  return (
    <div style={{ height: 400 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        onNodeClick={(evt, node) => {
          if (!node.id.startsWith('cluster-')) {
            onSelect(node.id);
          }
        }}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

