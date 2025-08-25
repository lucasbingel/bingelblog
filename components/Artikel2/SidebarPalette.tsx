"use client";

import { useState } from "react";
import { useDraggable, DragOverlay } from "@dnd-kit/core";
import type { EditorBlockType } from "./types";

interface Props {
  isOpen: boolean;
  toggle: () => void;
  onAddBlock?: (type: EditorBlockType) => void;
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

export default function SidebarPalette({ isOpen, toggle, onAddBlock }: Props) {
  const [draggingType, setDraggingType] = useState<EditorBlockType | null>(null);

  const DraggableItem = ({ type, label }: { type: EditorBlockType; label: string }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id: `palette:${type}`,
      data: { fromPalette: true, type },
    });

    if (isDragging && draggingType !== type) setDraggingType(type);
    if (!isDragging && draggingType === type) setDraggingType(null);

    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="p-2 rounded border hover:bg-gray-100 cursor-grab text-sm text-center select-none w-full"
      >
        {label}
      </div>
    );
  };

  return (
    <>
      <aside className="sticky top-0 flex-shrink-0 border-r bg-gray-100 overflow-auto w-40 p-2">
        <button onClick={toggle} className="mb-2 text-xs px-1 py-0.5 border rounded w-full">{isOpen ? "Close" : "Open"}</button>
        <div className="flex flex-col gap-2">
          {items.map(it => (
            <DraggableItem key={it.type} type={it.type} label={it.label} />
          ))}
        </div>
      </aside>

      <DragOverlay>
        {draggingType && (
          <div className="p-2 rounded border bg-white shadow text-sm select-none">
            {draggingType}
          </div>
        )}
      </DragOverlay>
    </>
  );
}
