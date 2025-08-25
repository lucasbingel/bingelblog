"use client";

import { useEffect, useState } from "react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import EditorToolbar from "./EditorToolbar";
import EditorCanvas from "./EditorCanvas";
import Renderer from "./Renderer";
import { makeBlock, defaultContentFor } from "./blockFactory";
import { useEditLock } from "./useEditLock";
import type { EditorBlock, EditorBlockType } from "./types";

interface Props {
  articleId: string;
  initialBlocks: EditorBlock[];
  onSave: (blocks: EditorBlock[]) => void;
  showPreview?: boolean;
  showPalette?: boolean;
  showToolbar?: boolean;
  contentClassName?: string;
  onBlocksChange?: (blocks: EditorBlock[]) => void;
}

export default function EditorLayout({
  articleId,
  initialBlocks,
  onSave,
  showPreview = false,
  showPalette = true,
  showToolbar = true,
  contentClassName = "",
  onBlocksChange,
}: Props) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(initialBlocks);
  const { lockedByOther } = useEditLock(articleId);

  useEffect(() => setBlocks(initialBlocks), [initialBlocks]);

  const addBlock = (type: EditorBlockType, content?: string) =>
    setBlocks(prev => {
      const newBlocks = [...prev, { ...makeBlock(type), ...(content ? { content } : {}) }];
      onBlocksChange?.(newBlocks);
      return newBlocks;
    });

  const addBlockAfterIndex = (type: EditorBlockType, index: number) =>
    setBlocks(prev => {
      const copy = [...prev];
      copy.splice(index + 1, 0, makeBlock(type));
      onBlocksChange?.(copy);
      return copy;
    });

  const updateBlock = (id: string, content: string) =>
    setBlocks(prev => {
      const updated = prev.map(b => (b.id === id ? { ...b, content } : b));
      onBlocksChange?.(updated);
      return updated;
    });

  const deleteBlock = (id: string) =>
    setBlocks(prev => {
      const updated = prev.filter(b => b.id !== id);
      onBlocksChange?.(updated);
      return updated;
    });

  const duplicateBlock = (block: EditorBlock, insertAfterId: string) => {
    const index = blocks.findIndex(b => b.id === insertAfterId);
    setBlocks(prev => {
      const copy = [...prev];
      const dupe: EditorBlock = { ...block, id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };
      copy.splice(index + 1, 0, dupe);
      onBlocksChange?.(copy);
      return copy;
    });
  };

  const moveBlockUp = (id: string) => {
    const i = blocks.findIndex(b => b.id === id);
    if (i > 0) setBlocks(prev => {
      const newBlocks = arrayMove(prev, i, i - 1);
      onBlocksChange?.(newBlocks);
      return newBlocks;
    });
  };

  const moveBlockDown = (id: string) => {
    const i = blocks.findIndex(b => b.id === id);
    if (i !== -1 && i < blocks.length - 1) setBlocks(prev => {
      const newBlocks = arrayMove(prev, i, i + 1);
      onBlocksChange?.(newBlocks);
      return newBlocks;
    });
  };

  const convertType = (id: string, newType: EditorBlockType) =>
    setBlocks(prev => {
      const updated = prev.map(b => b.id === id ? { ...b, type: newType, content: b.content ?? defaultContentFor(newType) } : b);
      onBlocksChange?.(updated);
      return updated;
    });

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;

    const activeData = (active.data?.current as any);

    if (activeData?.fromPalette) {
      const type = activeData.type as EditorBlockType;
      const overId = over.id?.toString();
      const overIndex = blocks.findIndex(b => b.id === overId);
      if (overIndex >= 0) addBlockAfterIndex(type, overIndex);
      else addBlock(type);
      return;
    }

    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex(b => b.id === active.id);
      const newIndex = blocks.findIndex(b => b.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newBlocks = arrayMove(blocks, oldIndex, newIndex);
        setBlocks(newBlocks);
        onBlocksChange?.(newBlocks);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {showToolbar && <EditorToolbar onAdd={addBlock} onSave={() => onSave(blocks)} />}
      {lockedByOther && <div className="bg-amber-100 text-amber-900 text-sm px-4 py-2 border-y border-amber-200">
        Dieser Artikel wird gerade von jemand anderem bearbeitet. Änderungen sind evtl. nicht erlaubt.
      </div>}

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <div className="flex">
          {/* Canvas */}
          <div className={`flex-1 ${showPreview ? "grid grid-cols-2 gap-6" : ""} p-6`}>
            <EditorCanvas
              blocks={blocks}
              updateBlock={updateBlock}
              deleteBlock={deleteBlock}
              duplicateBlock={duplicateBlock}
              moveBlockUp={moveBlockUp}
              moveBlockDown={moveBlockDown}
              convertType={convertType}
              contentClassName={contentClassName}
              onQuickAddText={(text) => addBlock("text", text)}
            />
            {showPreview && <div className="hidden lg:block">
              <div className="rounded-xl border bg-white p-4">
                <div className="font-semibold mb-3">Live Preview</div>
                <Renderer blocks={blocks} />
              </div>
            </div>}
          </div>
        </div>
      </DndContext>
    </div>
  );
}
