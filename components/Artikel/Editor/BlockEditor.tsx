"use client";

import React from "react";
import { ArticleBlock } from "@/lib/articles";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import BlockItem from "./BlockItem";

interface Props {
  blocks: ArticleBlock[];
  setBlocks: React.Dispatch<React.SetStateAction<ArticleBlock[]>>;
  onSave: (blocks: ArticleBlock[]) => void;
}

export default function BlockEditor({ blocks, setBlocks, onSave }: Props) {

  const updateBlock = (id: string, content: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
  };

  const addBlock = (type: ArticleBlock["type"]) => {
    const newBlock: ArticleBlock = {
      id: Date.now().toString(),
      type,
      content: "",
    };
    setBlocks(prev => [...prev, newBlock]);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) setBlocks(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  const deleteBlock = (id: string) => setBlocks(prev => prev.filter(b => b.id !== id));

  const duplicateBlock = (block: ArticleBlock, insertAfterId: string) => {
    const copy: ArticleBlock = { ...block, id: Date.now().toString() };
    const index = blocks.findIndex(b => b.id === insertAfterId);
    setBlocks(prev => {
      const newBlocks = [...prev];
      newBlocks.splice(index + 1, 0, copy);
      return newBlocks;
    });
  };

  const moveBlockUp = (id: string) => {
    const index = blocks.findIndex(b => b.id === id);
    if (index > 0) setBlocks(arrayMove(blocks, index, index - 1));
  };

  const moveBlockDown = (id: string) => {
    const index = blocks.findIndex(b => b.id === id);
    if (index < blocks.length - 1) setBlocks(arrayMove(blocks, index, index + 1));
  };

  return (
    <div className="flex flex-col gap-2">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map(block => (
            <BlockItem
              key={block.id}
              block={block}
              updateBlock={updateBlock}
              deleteBlock={deleteBlock}
              duplicateBlock={duplicateBlock}
              moveBlockUp={moveBlockUp}
              moveBlockDown={moveBlockDown}
            />
          ))}
        </SortableContext>
      </DndContext>

      <div className="flex gap-2 mt-4 flex-wrap">
        <button onClick={() => addBlock("text")} className="px-2 py-1 border rounded">Text</button>
        <button onClick={() => addBlock("heading")} className="px-2 py-1 border rounded">Heading</button>
        <button onClick={() => addBlock("code")} className="px-2 py-1 border rounded">Code</button>
        <button onClick={() => addBlock("list")} className="px-2 py-1 border rounded">List</button>
        <button onClick={() => addBlock("image")} className="px-2 py-1 border rounded">Image</button>
        <button onClick={() => addBlock("quote")} className="px-2 py-1 border rounded">Quote</button>
        <button onClick={() => addBlock("video")} className="px-2 py-1 border rounded">Video</button>
        <button onClick={() => addBlock("divider")} className="px-2 py-1 border rounded">Divider</button>
      </div>

      <button
        onClick={() => onSave(blocks)}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Save
      </button>
    </div>
  );
}
