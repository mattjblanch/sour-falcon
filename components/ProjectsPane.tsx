'use client';
import React from 'react';

export interface Project {
  name: string;
  result: any;
  baseUrl?: string;
  payload?: {
    baseUrl: string;
    apiKey?: string;
    headerName?: string;
    authScheme?: string;
    authMethod?: string;
    queryName?: string;
    authType?: string;
    customScheme?: string;
    useAuth?: boolean;
  };
}

export default function ProjectsPane({ projects, onSelect, onClose }:{ projects: Project[]; onSelect:(p:Project)=>void; onClose:()=>void; }) {
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2 style={{margin:0}}>Projects</h2>
        <button onClick={onClose} style={{width:'auto'}}>×</button>
      </div>
      {projects.length === 0 && <p className="small">No projects saved.</p>}
      <ul style={{listStyle:'none',padding:0,margin:0}}>
        {projects.map(p => (
          <li key={p.name} style={{marginTop:'.5rem'}}>
            <button
              onClick={()=>onSelect(p)}
              title={p.name}
              style={{width:'100%',textAlign:'left',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}
            >
              {p.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
