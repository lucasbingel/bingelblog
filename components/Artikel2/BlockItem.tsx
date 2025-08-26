// Pfad: components/Artikel2/BlockItem.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { GripVertical, Trash2, Copy, ChevronUp, ChevronDown } from "lucide-react";
import type { EditorBlock, EditorBlockType } from "./types";

interface Props {
  block: EditorBlock;
  updateBlock: (id: string, updates: Partial<EditorBlock>) => void;
  convertType: (id: string, newType: EditorBlockType) => void;
  deleteBlock: (id: string) => void;
  duplicateBlock: (block: EditorBlock, insertAfterId: string) => void;
  moveBlockUp: (id: string) => void;
  moveBlockDown: (id: string) => void;
}

function BlockItem({
  block,
  updateBlock,
  convertType,
  deleteBlock,
  duplicateBlock,
  moveBlockUp,
  moveBlockDown,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({ id: block.id });
  const rootRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [active, setActive] = useState(false);

  // Sync mit Parent nur, wenn Editor nicht aktiv ist

// Nur initial beim Mount syncen
const localContentRef = useRef(block.content ?? (block.type === "table" ? [[""]] : ""));
const [localContent, setLocalContent] = useState(localContentRef.current);

// Nur beim Mount oder wenn ein neuer Block kommt
useEffect(() => {
  localContentRef.current = block.content ?? (block.type === "table" ? [[""]] : "");
  setLocalContent(localContentRef.current);
}, [block.id]); // <-- nur bei neuem Block, nicht bei jedem content-Update

// localContentRef immer aktuell halten
useEffect(() => { localContentRef.current = localContent; }, [localContent]);

const commit = () => {
  updateBlock(block.id, { content: localContentRef.current });
};




  // Escape schließt Editor
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setActive(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Outside click → speichern
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

  // Fokus auf Input/Textarea
  // useEffect(() => {
  //   if (active) {
  //     const el = textareaRef.current ?? inputRef.current;
  //     if (el) {
  //       el.focus({ preventScroll: true });
  //       if ("selectionStart" in el) el.selectionStart = el.selectionEnd = el.value.length;
  //     }
  //   }
  // }, [active]);

  // const commit = () => {
  //   updateBlock(block.id, { content: localContentRef.current });
  // };

  const style = {
    transform: transform ? `translate3d(0px, ${transform.y}px, 0px)` : undefined,
    transition: isDragging ? "none" : "transform 150ms ease",
    zIndex: isDragging ? 999 : undefined,
  };

  // Tabellenfunktionen
  const addRow = () => {
    const newContent = [...localContent, new Array(localContent[0]?.length || 1).fill("")];
    setLocalContent(newContent);
    updateBlock(block.id, { content: newContent });
  };
  const addColumn = () => {
    const newContent = localContent.map((row: string[]) => [...row, ""]);
    setLocalContent(newContent);
    updateBlock(block.id, { content: newContent });
  };
  const removeRow = (rowIndex: number) => {
    if (localContent.length <= 1) return;
    const newContent = localContent.filter((_: any, idx: number) => idx !== rowIndex);
    setLocalContent(newContent);
    updateBlock(block.id, { content: newContent });
  };
  const removeColumn = (colIndex: number) => {
    if (localContent[0].length <= 1) return;
    const newContent = localContent.map((row: string[]) => row.filter((_: any, idx: number) => idx !== colIndex));
    setLocalContent(newContent);
    updateBlock(block.id, { content: newContent });
  };

  const RenderView = () => {
    switch (block.type) {
      case "heading": return <h2 className="text-2xl font-bold">{block.content || "Überschrift"}</h2>;
      case "text": return <p>{block.content}</p>;
      case "code": return <pre className="rounded bg-gray-900 text-gray-100 p-3 text-sm overflow-auto">{block.language && <div className="text-xs text-gray-400 mb-1">// {block.language}</div>}{block.content}</pre>;
      case "list": return <ul className="list-disc ml-6">{(block.content as string).split("\n").map((item: string, idx: number) => <li key={idx}>{item}</li>)}</ul>;
      case "image": return block.content ? <img src={block.content} alt="" className="rounded" /> : <div className="p-3 text-gray-500 bg-gray-100 border rounded">Bild-URL fehlt</div>;
      case "quote": return <blockquote className="border-l-4 border-blue-500 italic pl-4 my-2 bg-gray-50">{block.content}</blockquote>;
      case "video": return block.content ? <iframe src={block.content} className="w-full aspect-video rounded" allowFullScreen /> : <div className="p-3 text-gray-500 bg-gray-100 border rounded">Video-URL fehlt</div>;
      case "divider": return <hr className="my-4 border-gray-300" />;
      case "table":
        return (
          <table className="border-collapse border border-gray-300 w-full text-sm">
            <tbody>
              {Array.isArray(block.content) && block.content.map((row: string[], rowIndex: number) => (
                <tr key={rowIndex}>
                  {row.map((cell: string, colIndex: number) => (
                    <td key={colIndex} className="border border-gray-300 px-2 py-1">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      default: return null;
    }
  };

  const EditBody = () => {
    if (block.type === "table") {
      return (
        <div className="overflow-x-auto">
          <table className="border-collapse border border-gray-300 w-full text-sm">
            <tbody>
              {localContent.map((row: string[], rowIndex: number) => (
                <tr key={rowIndex}>
                  {row.map((cell: string, colIndex: number) => (
                    <td key={colIndex} className="border border-gray-300 p-1 relative">
                      <input
                        className="w-full p-1 border-none outline-none"
                        value={cell}
                        onChange={(e) => {
                          const newContent = [...localContent];
                          newContent[rowIndex][colIndex] = e.target.value;
                          setLocalContent(newContent);
                        }}
                        onBlur={commit} // <-- Parent-Update nur beim Verlassen
                      />

                      <button type="button" className="absolute -top-2 right-0 text-xs text-red-500" onClick={() => removeColumn(colIndex)}>✖</button>
                    </td>
                  ))}
                  <td>
                    <button type="button" className="text-xs text-red-500" onClick={() => removeRow(rowIndex)}>Zeile ✖</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 flex gap-2">
            <button type="button" className="px-2 py-1 border rounded text-sm" onClick={addRow}>+ Zeile</button>
            <button type="button" className="px-2 py-1 border rounded text-sm" onClick={addColumn}>+ Spalte</button>
          </div>
        </div>
      );
    }

    if (["heading", "text", "code", "list", "quote"].includes(block.type)) {
      return (
        <textarea
          ref={textareaRef}
          className="w-full border rounded p-2 min-h-[80px]"
          value={localContent}
          onChange={(e) => setLocalContent(e.target.value)}
          onBlur={commit} // <-- Parent-Update nur hier
        />

      );
    }

    if (["image", "video"].includes(block.type)) {
      return (
        <input
          ref={inputRef}
          className="w-full border rounded p-2"
          value={localContent}
          onChange={e => setLocalContent(e.target.value)}
          onBlur={commit}
        />
      );
    }

    return <div className="h-px" />;
  };

  const languages = ["javascript","typescript","python","java","csharp","cpp","ps1","php","go","rust","sql","html","css","json","bash","yaml","markdown"];

  return (
    <div
      ref={el => { setNodeRef(el); rootRef.current = el; }}
      style={style}
      className={`relative group rounded-lg transition ring-offset-1 ${active ? "ring-2 ring-blue-300 bg-white" : "ring-0 hover:ring-1 hover:ring-gray-300"}`}
      onClick={e => { if (!(e.target as HTMLElement).closest("[data-ctl]")) setActive(true); }}
    >
      <div className={`absolute top-2 right-2 z-10 flex items-center gap-1 bg-white/90 backdrop-blur rounded-lg border shadow-sm px-1.5 py-1 ${active ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition`}>
        <button {...listeners} {...attributes} data-ctl className="p-1 rounded hover:bg-gray-200 cursor-grab" title="Drag"><GripVertical className="w-4 h-4" /></button>
        <button data-ctl onClick={() => moveBlockUp(block.id)} title="Move up"><ChevronUp className="w-4 h-4" /></button>
        <button data-ctl onClick={() => moveBlockDown(block.id)} title="Move down"><ChevronDown className="w-4 h-4" /></button>
        <button data-ctl onClick={() => duplicateBlock(block, block.id)} title="Duplicate"><Copy className="w-4 h-4" /></button>

        <select data-ctl
          value={block.type}
          onChange={e => {
            const newType = e.target.value as EditorBlockType;

            if (newType === "table") {
              let newContent: string[][] = [["", ""], ["", ""]];
              if (typeof block.content === "string") {
                const lines = block.content.split("\n");
                newContent[0][0] = lines[0] || "";
                newContent[0][1] = lines[1] || "";
                newContent[1][0] = lines[2] || "";
                newContent[1][1] = lines[3] || "";
              }
              setLocalContent(newContent);
              updateBlock(block.id, { content: newContent });
              setActive(true);
            }

            convertType(block.id, newType);
          }}
        >
          {["heading","text","code","list","image","quote","video","divider","table"].map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        {block.type === "code" &&
          <select
            data-ctl
            value={block.language || "javascript"}
            onChange={e => updateBlock(block.id, { language: e.target.value })}
            title="Sprache auswählen"
            className="text-xs border rounded px-1 py-0.5"
          >
            {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
          </select>
        }

        <button data-ctl className="p-1 rounded hover:bg-red-50 text-red-600" onClick={() => { if (confirm("Block wirklich löschen?")) deleteBlock(block.id); }} title="Delete"><Trash2 className="w-4 h-4" /></button>
      </div>

      <div className={`p-2 ${active ? "bg-white" : ""}`}>
        {active ? <EditBody /> : <RenderView />}
      </div>
    </div>
  );
}

export default React.memo(BlockItem);
