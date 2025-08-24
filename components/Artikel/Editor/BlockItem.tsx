"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { ArticleBlock } from "@/lib/articles";

interface Props {
  block: ArticleBlock;
  updateBlock: (id: string, content: string) => void;
  deleteBlock: (id: string) => void;
  duplicateBlock: (block: ArticleBlock, insertAfterId: string) => void;
  moveBlockUp?: (id: string) => void;
  moveBlockDown?: (id: string) => void;
}

export default function BlockItem({
  block,
  updateBlock,
  deleteBlock,
  duplicateBlock,
  moveBlockUp,
  moveBlockDown,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: "1px solid #ddd",
    borderRadius: "6px",
    marginBottom: "8px",
    backgroundColor: "#fefefe",
    paddingTop: "24px",
    position: "relative" as "relative",
  };

  const blockLabel: Record<string, string> = {
    heading: "Heading",
    text: "Text",
    code: "Code",
    list: "List",
    image: "Image",
    quote: "Quote",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative">
      {/* Header: Typ + Buttons */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center bg-gray-100 border-b px-2 py-1 rounded-t">
        <span className="text-sm font-semibold">{blockLabel[block.type]}</span>
        <div className="flex gap-2">
          <button {...listeners} className="cursor-grab text-gray-600">☰</button>
          <button onClick={() => moveBlockUp?.(block.id)} className="text-gray-600">⬆️</button>
          <button onClick={() => moveBlockDown?.(block.id)} className="text-gray-600">⬇️</button>
          <button onClick={() => duplicateBlock(block, block.id)} className="text-gray-600">📄</button>
          <button onClick={() => {
            if (confirm("Are you sure you want to delete this block?")) deleteBlock(block.id);
          }} className="text-red-600">🗑️</button>
        </div>
      </div>

      {/* Block Content */}
      <div className="p-2 mt-1">
        {block.type === "heading" && (
          <input
            type="text"
            value={block.content}
            placeholder="Heading"
            onChange={e => updateBlock(block.id, e.target.value)}
            className="w-full font-bold border-b focus:outline-none mt-1"
          />
        )}
        {block.type === "text" && (
          <textarea
            value={block.content}
            placeholder="Text"
            onChange={e => updateBlock(block.id, e.target.value)}
            className="w-full border rounded p-1 mt-1"
          />
        )}
        {block.type === "list" && (
          <textarea
            value={block.content}
            placeholder="List (one item per line)"
            onChange={e => updateBlock(block.id, e.target.value)}
            className="w-full border rounded p-1 font-mono mt-1"
          />
        )}
        {block.type === "code" && (
          <textarea
            value={block.content}
            placeholder="Code"
            onChange={e => updateBlock(block.id, e.target.value)}
            className="w-full border rounded p-1 font-mono bg-gray-100 mt-1"
          />
        )}
        {block.type === "image" && (
          <input
            type="text"
            value={block.content}
            placeholder="Image URL"
            onChange={e => updateBlock(block.id, e.target.value)}
            className="w-full border rounded p-1 mt-1"
          />
        )}
        {block.type === "quote" && (
          <textarea
            value={block.content}
            placeholder="Quote"
            onChange={e => updateBlock(block.id, e.target.value)}
            className="w-full border-l-4 border-blue-500 italic p-2 mt-1 bg-gray-50"
          />
        )}
      </div>
    </div>
  );
}
