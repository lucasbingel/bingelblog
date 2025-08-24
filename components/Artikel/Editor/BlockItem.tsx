"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { ArticleBlock } from "@/lib/articles";
import { useState } from "react";

interface Props {
  block: ArticleBlock;
  updateBlock: (id: string, content: string) => void;
  deleteBlock: (id: string) => void;
  duplicateBlock: (block: ArticleBlock, insertAfterId: string) => void;
  moveBlockUp: (id: string) => void;
  moveBlockDown: (id: string) => void;
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
  const [confirmDelete, setConfirmDelete] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: "1px solid #ddd",
    borderRadius: "6px",
    marginBottom: "8px",
    backgroundColor: "#fefefe",
    paddingTop: "32px",
    position: "relative" as "relative",
  };

  const blockLabel = {
    heading: "Heading",
    text: "Text",
    code: "Code",
    list: "List",
    image: "Image",
  }[block.type];

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center bg-gray-100 border-b px-2 py-1 rounded-t">
        <span className="text-sm font-semibold">{blockLabel}</span>
        <div className="flex gap-1 items-center">
          {/* Drag handle */}
          <span {...listeners} className="cursor-grab text-gray-600" title="Drag">
            ☰
          </span>

          {/* Move up */}
          <button
            onClick={() => moveBlockUp(block.id)}
            title="Move Up"
            className="text-gray-600 hover:text-gray-900"
          >
            ▲
          </button>

          {/* Move down */}
          <button
            onClick={() => moveBlockDown(block.id)}
            title="Move Down"
            className="text-gray-600 hover:text-gray-900"
          >
            ▼
          </button>

          {/* Duplicate */}
          <button
            onClick={() => duplicateBlock(block, block.id)}
            title="Duplicate"
            className="text-gray-600 hover:text-gray-900"
          >
            ⎘
          </button>

          {/* Delete */}
          <button
            onClick={() => setConfirmDelete(true)}
            title="Delete"
            className="text-red-600 hover:text-red-800"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col justify-center items-center z-10 p-4 border rounded">
          <p className="mb-2">Are you sure you want to delete this block?</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                deleteBlock(block.id);
                setConfirmDelete(false);
              }}
              className="px-3 py-1 bg-red-600 text-white rounded"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1 bg-gray-300 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Block input */}
      <div className="p-2 mt-1">
        {block.type === "heading" && (
          <input
            type="text"
            value={block.content}
            placeholder="Heading"
            onChange={(e) => updateBlock(block.id, e.target.value)}
            className="w-full font-bold border-b focus:outline-none mt-1"
          />
        )}
        {block.type === "text" && (
          <textarea
            value={block.content}
            placeholder="Text"
            onChange={(e) => updateBlock(block.id, e.target.value)}
            className="w-full border rounded p-1 mt-1"
          />
        )}
        {block.type === "list" && (
          <textarea
            value={block.content}
            placeholder="List (one item per line)"
            onChange={(e) => updateBlock(block.id, e.target.value)}
            className="w-full border rounded p-1 font-mono mt-1"
          />
        )}
        {block.type === "code" && (
          <textarea
            value={block.content}
            placeholder="Code"
            onChange={(e) => updateBlock(block.id, e.target.value)}
            className="w-full border rounded p-1 font-mono bg-gray-100 mt-1"
          />
        )}
        {block.type === "image" && (
          <input
            type="text"
            value={block.content}
            placeholder="Image URL"
            onChange={(e) => updateBlock(block.id, e.target.value)}
            className="w-full border rounded p-1 mt-1"
          />
        )}
      </div>
    </div>
  );
}
