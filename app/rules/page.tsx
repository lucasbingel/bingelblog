"use client";
import React, { useState } from "react";

interface Rule { id:number; description:string; condition:string; color:string; }

export default function RulesPage() {
  const [rules,setRules]=useState<Rule[]>([]);
  const [desc,setDesc]=useState(""); const [cond,setCond]=useState(""); const [color,setColor]=useState("#00ff00");

  const addRule=()=>{ if(!desc||!cond)return; setRules([...rules,{id:Date.now(),description:desc,condition:cond,color}]); setDesc(""); setCond(""); }

  return (
    <div className="p-4 bg-white shadow rounded-md">
      <h2 className="text-2xl font-bold mb-4">Regeln für Aktienbewertung</h2>
      <div className="flex gap-2 mb-4">
        <input placeholder="Beschreibung" className="border p-2 rounded" value={desc} onChange={e=>setDesc(e.target.value)} />
        <input placeholder="Bedingung" className="border p-2 rounded" value={cond} onChange={e=>setCond(e.target.value)} />
        <input type="color" className="w-12 h-12" value={color} onChange={e=>setColor(e.target.value)} />
        <button className="bg-blue-600 text-white p-2 rounded" onClick={addRule}>Hinzufügen</button>
      </div>
      <ul>
        {rules.map(r=>(
          <li key={r.id} style={{backgroundColor:r.color}} className="p-2 my-1 rounded">{r.description} ({r.condition})</li>
        ))}
      </ul>
    </div>
  );
}
