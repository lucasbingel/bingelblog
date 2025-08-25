// components/Artikel2/EditorToolbar.tsx
"use client";

import { Plus, Save } from "lucide-react";
import type { EditorBlockType } from "./types";

interface Props {
  onAdd: (type: EditorBlockType) => void;
  onSave: () => void;
}

const items: { type: EditorBlockType; label: string }[] = [
  { type: "heading", label: "Heading" },
  { type: "text", label: "Text" },
  { type: "code", label: "Code" },
  { type: "list", label: "List" },
  { type: "image", label: "Image" },
  { type: "quote", label: "Quote" },
  { type: "video", label: "Video" },
  { type: "divider", label: "Divider" },
];

export default function EditorToolbar({ onAdd, onSave }: Props) {
  return (
    <div className="sticky top-[64px] z-40 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap gap-2 items-center">
        <button
          onClick={onSave}
          className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
        >
          <Save className="w-4 h-4" /> Save
        </button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        {items.map((it) => (
          <button
            key={it.type}
            onClick={() => onAdd(it.type)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded border bg-white hover:bg-gray-50"
            title={`Add ${it.label}`}
          >
            <Plus className="w-4 h-4" />
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}
