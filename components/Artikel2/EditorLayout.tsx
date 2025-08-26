"use client";

import { useEffect, useState } from "react";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import EditorToolbar from "./EditorToolbar";
import EditorCanvas from "./EditorCanvas";
import Renderer from "./Renderer";
import { makeBlock, defaultContentFor } from "./blockFactory";
import { useEditLock } from "./useEditLock";
import type { EditorBlock, EditorBlockType } from "./types";

interface Props {
  articleId: string;
  initialBlocks?: EditorBlock[];
  onSave: (blocks: EditorBlock[]) => void;
  showPreview?: boolean;
  showPalette?: boolean;
  showToolbar?: boolean;
  contentClassName?: string;
  onBlocksChange?: (blocks: EditorBlock[]) => void;
}

export default function EditorLayout({
  articleId,
  initialBlocks = [],
  onSave,
  showPreview = false,
  showPalette = true,
  showToolbar = true,
  contentClassName = "",
  onBlocksChange,
}: Props) {
  const [blocks, setBlocks] = useState<EditorBlock[]>(initialBlocks);
  const { lockedByOther } = useEditLock(articleId);

  useEffect(() => {
    setBlocks(initialBlocks);
  }, [initialBlocks]);

  const commitBlocks = (newBlocks: EditorBlock[]) => {
    setBlocks(newBlocks);
    onBlocksChange?.(newBlocks);
  };

  // --- Block Operationen ---
  const addBlock = (type: EditorBlockType, content?: string) =>
    commitBlocks([...blocks, { ...makeBlock(type), ...(content ? { content } : {}) }]);

  const addBlockAfterIndex = (type: EditorBlockType, index: number) => {
    const copy = [...blocks];
    copy.splice(index + 1, 0, makeBlock(type));
    commitBlocks(copy);
  };

  const updateBlock = (id: string, updates: Partial<EditorBlock>) =>
    commitBlocks(blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)));

  const deleteBlock = (id: string) =>
    commitBlocks(blocks.filter((b) => b.id !== id));

  const duplicateBlock = (block: EditorBlock, insertAfterId: string) => {
    const index = blocks.findIndex((b) => b.id === insertAfterId);
    if (index === -1) return;
    const dupe: EditorBlock = { ...block, id: `${Date.now()}-${Math.random().toString(36).slice(2,6)}` };
    const copy = [...blocks];
    copy.splice(index + 1, 0, dupe);
    commitBlocks(copy);
  };

  const moveBlockUp = (id: string) => {
    const i = blocks.findIndex((b) => b.id === id);
    if (i > 0) commitBlocks(arrayMove(blocks, i, i - 1));
  };

  const moveBlockDown = (id: string) => {
    const i = blocks.findIndex((b) => b.id === id);
    if (i !== -1 && i < blocks.length - 1) commitBlocks(arrayMove(blocks, i, i + 1));
  };

  const convertType = (id: string, newType: EditorBlockType) =>
    commitBlocks(
      blocks.map((b) =>
        b.id === id
          ? { ...b, type: newType, content: b.content ?? defaultContentFor(newType) }
          : b
      )
    );

  // --- Drag & Drop ---
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;

    const activeData = active.data?.current as any;

    if (activeData?.fromPalette) {
      const type = activeData.type as EditorBlockType;
      const overId = over.id?.toString();
      const overIndex = blocks.findIndex((b) => b.id === overId);
      if (overIndex >= 0) addBlockAfterIndex(type, overIndex);
      else addBlock(type);
      return;
    }

    if (active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        commitBlocks(arrayMove(blocks, oldIndex, newIndex));
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {showToolbar && <EditorToolbar onAdd={addBlock} onSave={() => onSave(blocks)} />}
      {lockedByOther && (
        <div className="bg-amber-100 text-amber-900 text-sm px-4 py-2 border-y border-amber-200">
          Dieser Artikel wird gerade von jemand anderem bearbeitet. Änderungen sind evtl. nicht erlaubt.
        </div>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className={`grid gap-3 ${contentClassName}`}>
            <EditorCanvas
              blocks={blocks}
              updateBlock={updateBlock} // <-- NEU Typ Partial<EditorBlock>
              deleteBlock={deleteBlock}
              duplicateBlock={duplicateBlock}
              moveBlockUp={moveBlockUp}
              moveBlockDown={moveBlockDown}
              convertType={convertType}
              contentClassName={contentClassName}
              onQuickAddText={(text) => addBlock("text", text)}
            />
          </div>
        </SortableContext>
      </DndContext>

      {showPreview && (
        <div className="hidden lg:block mt-6">
          <div className="rounded-xl border bg-white p-4">
            <div className="font-semibold mb-3">Live Preview</div>
            <Renderer blocks={blocks} />
          </div>
        </div>
      )}
    </div>
  );
}
