"use client";

import { useDraggable } from "@dnd-kit/core";
import { Grip } from "lucide-react";
import type { EditorBlockType } from "./types";

const palette: { type: EditorBlockType; label: string }[] = [
  { type: "heading", label: "Heading" },
  { type: "text", label: "Text" },
  { type: "code", label: "Code" },
  { type: "list", label: "List" },
  { type: "image", label: "Image" },
  { type: "quote", label: "Quote" },
  { type: "video", label: "Video" },
  { type: "divider", label: "Divider" },
  { type: "table", label: "table" },
  { type: "section", label: "section" },
  { type: "collapsible", label: "collapsible" },
  { type: "alert", label: "alert" },
];

function PaletteItem({ type, label, onClick }: { type: EditorBlockType; label: string; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: { fromPalette: true, type },
  });

  return (
    <button
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded border bg-white hover:bg-gray-50 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <span>{label}</span>
      <Grip className="w-4 h-4 text-gray-500" />
    </button>
  );
}

export default function BlockPalette({ onAdd }: { onAdd: (type: EditorBlockType) => void }) {
  return (
    <aside className="w-64 flex-shrink-0 border-r bg-gray-50 h-[calc(100vh-64px)] sticky top-[64px] overflow-y-auto p-3">
      <div className="text-xs font-semibold text-gray-500 mb-2">Components</div>
      <div className="grid gap-2">
        {palette.map((p) => (
          <PaletteItem key={p.type} type={p.type} label={p.label} onClick={() => onAdd(p.type)} />
        ))}
      </div>
    </aside>
  );
}
