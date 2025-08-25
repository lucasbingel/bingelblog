"use client";

import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, Trash2, Copy, ChevronUp, ChevronDown } from "lucide-react";
import type { EditorBlock, EditorBlockType } from "./types";

interface Props {
  block: EditorBlock;
  updateBlock: (id: string, content: string) => void;
  convertType: (id: string, newType: EditorBlockType) => void;
  deleteBlock: (id: string) => void;
  duplicateBlock: (block: EditorBlock, insertAfterId: string) => void;
  moveBlockUp: (id: string) => void;
  moveBlockDown: (id: string) => void;
}

export default function BlockItem({
  block,
  updateBlock,
  convertType,
  deleteBlock,
  duplicateBlock,
  moveBlockUp,
  moveBlockDown,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement | null>(null);
  const contentRef = useRef(block.content);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setActive(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!active) return;
    const handler = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) {
        commit();
        setActive(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [active]);

  useEffect(() => {
    if (active && inputRef.current) {
      const el = inputRef.current;
      el.focus({ preventScroll: true });
      if ("selectionStart" in el) el.selectionStart = el.selectionEnd = el.value.length;
    }
  }, [active]);

  // Nur vertikal + keine Sprünge
  const style = {
    transform: transform ? `translate3d(0px, ${transform.y}px, 0px)` : undefined,
    transition: isDragging ? "none" : "transform 150ms ease",
    zIndex: isDragging ? 999 : undefined,
  };

  const commit = () => {
    if (contentRef.current !== block.content) updateBlock(block.id, contentRef.current);
  };

  const RenderView = () => {
    switch (block.type) {
      case "heading": return <h2 className="text-2xl font-bold">{block.content || "Überschrift"}</h2>;
      case "text": return <p>{block.content}</p>;
      case "code": return <pre className="rounded bg-gray-900 text-gray-100 p-3 text-sm overflow-auto">{block.content}</pre>;
      case "list": return <ul className="list-disc ml-6">{(block.content || "").split("\n").map((item, idx) => <li key={idx}>{item}</li>)}</ul>;
      case "image": return block.content ? <img src={block.content} alt="" className="rounded" /> : <div className="rounded border p-3 text-sm text-gray-500 bg-white">Bild-URL fehlt</div>;
      case "quote": return <blockquote className="border-l-4 border-blue-500 italic pl-4 my-2 bg-gray-50">{block.content}</blockquote>;
      case "video": return block.content ? <iframe src={block.content} className="w-full aspect-video rounded" allowFullScreen /> : <div className="rounded border p-3 text-sm text-gray-500 bg-white">Embed-URL fehlt</div>;
      case "divider": return <hr className="my-4 border-gray-300" />;
      default: return null;
    }
  };

  const EditBody = () => {
    if (["heading","text","code","list","quote"].includes(block.type)) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          className="w-full border rounded p-2"
          defaultValue={block.content}
          onChange={(e) => contentRef.current = e.target.value}
        />
      );
    }
    if (["image","video"].includes(block.type)) {
      return (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          className="w-full border rounded p-2"
          defaultValue={block.content}
          onChange={(e) => contentRef.current = e.target.value}
          placeholder={block.type === "image" ? "Bild-URL …" : "Video-URL …"}
        />
      );
    }
    return <div className="h-px bg-gray-200" />;
  };

  return (
    <div
      ref={(el) => { setNodeRef(el); rootRef.current = el; }}
      style={style}
      className={`relative group rounded-lg transition ring-offset-1 ${active ? "ring-2 ring-blue-300 bg-white" : "ring-0"} ${!active ? "hover:ring-1 hover:ring-gray-300" : ""}`}
      onClick={(e) => { if (!(e.target as HTMLElement).closest("[data-ctl]")) setActive(true); }}
    >
      {/* Toolbar */}
      <div className={`absolute top-2 right-2 z-10 flex items-center gap-1 bg-white/90 backdrop-blur rounded-lg border shadow-sm px-1.5 py-1 ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition`}>
        <button {...listeners} {...attributes} data-ctl className="p-1 rounded hover:bg-gray-200 cursor-grab" title="Drag"><GripVertical className="w-4 h-4" /></button>
        <button data-ctl onClick={() => moveBlockUp(block.id)} title="Move up"><ChevronUp className="w-4 h-4" /></button>
        <button data-ctl onClick={() => moveBlockDown(block.id)} title="Move down"><ChevronDown className="w-4 h-4" /></button>
        <button data-ctl onClick={() => duplicateBlock(block, block.id)} title="Duplicate"><Copy className="w-4 h-4" /></button>
        <select data-ctl value={block.type} onChange={(e) => convertType(block.id, e.target.value as EditorBlockType)} title="Convert type" className="text-xs border rounded px-1 py-0.5">
          {["heading","text","code","list","image","quote","video","divider"].map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <button data-ctl className="p-1 rounded hover:bg-red-50 text-red-600" onClick={() => { if(confirm("Block wirklich löschen?")) deleteBlock(block.id); }} title="Delete"><Trash2 className="w-4 h-4" /></button>
      </div>

      <div className={`p-2 ${active ? "bg-white" : ""}`}>
        {active ? <EditBody /> : <RenderView />}
      </div>
    </div>
  );
}
