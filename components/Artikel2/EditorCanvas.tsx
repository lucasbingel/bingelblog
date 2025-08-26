"use client";

import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import BlockItem from "./BlockItem";
import type { EditorBlock, EditorBlockType } from "./types";
import { useState } from "react";

interface Props {
  blocks: EditorBlock[];
  convertType: (id: string, newType: EditorBlockType) => void;
  updateBlock: (id: string, updates: Partial<EditorBlock>) => void; // <-- angepasst
  deleteBlock: (id: string) => void;
  duplicateBlock: (block: EditorBlock, insertAfterId: string) => void;
  moveBlockUp: (id: string) => void;
  moveBlockDown: (id: string) => void;
  contentClassName?: string;
  onQuickAddText?: (text: string) => void;
}

function QuickAddComposer({ onCommit }: { onCommit: (text: string) => void }) {
  const [val, setVal] = useState("");

  const commit = () => {
    const text = val.trim();
    if (text.length) {
      onCommit(text);
      setVal("");
    }
  };

  return (
    <div className="mt-4">
      <textarea
        className="w-full min-h-[52px] rounded border border-dashed p-2 bg-white focus:border-gray-300 outline-none"
        placeholder="Tippe hier, um schnell Text hinzuzufügen … (Enter oder außerhalb klicken zum Anlegen)"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            commit();
          }
        }}
      />
    </div>
  );
}

export default function EditorCanvas({
  blocks,
  updateBlock,
  deleteBlock,
  duplicateBlock,
  moveBlockUp,
  moveBlockDown,
  convertType,
  contentClassName = "",
  onQuickAddText,
}: Props) {
  return (
    <div className="mx-auto max-w-7xl w-full">
      <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        <div className={`grid gap-3 ${contentClassName}`}>
          {blocks.map((b) => (
            <BlockItem
              key={b.id}
              block={b}
              updateBlock={updateBlock} // <-- angepasst
              deleteBlock={deleteBlock}
              duplicateBlock={duplicateBlock}
              moveBlockUp={moveBlockUp}
              moveBlockDown={moveBlockDown}
              convertType={convertType}
            />
          ))}
        </div>
      </SortableContext>

      {onQuickAddText && <QuickAddComposer onCommit={onQuickAddText} />}
    </div>
  );
}
