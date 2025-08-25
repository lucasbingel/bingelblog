"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SidebarPalette from "@/components/Artikel2/SidebarPalette";
import EditorLayout from "@/components/Artikel2/EditorLayout";
import { getArticleById, updateArticle, type Article } from "@/lib/articles";
import type { EditorBlock } from "@/components/Artikel2/types";

function toEditorBlocks(json: string): EditorBlock[] {
  try {
    const arr = JSON.parse(json) as EditorBlock[];
    if (Array.isArray(arr)) return arr;
  } catch {}
  return [{ id: `${Date.now()}`, type: "text", content: json } as EditorBlock];
}

export default function EditArticle2Page() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const [article, setArticle] = useState<Article | null>(null);
  const [blocks, setBlocks] = useState<EditorBlock[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!id) return;
    const a = getArticleById(id);
    if (!a) return;
    setArticle(a);
    setBlocks(toEditorBlocks(a.content));
  }, [id]);

  const handleSave = (blocksToSave: EditorBlock[]) => {
    if (!article) return;
    // Speichern in DB
    updateArticle(article.id, JSON.stringify(blocksToSave));
    // Optional: nach Speichern wieder zum Wiki
    router.push(`/wiki/${article.id}`);
  };

  if (!article) return <div className="p-6">Article not found.</div>;

  return (
    <div className="flex bg-gray-50 h-screen">
      {/* SidebarPalette */}
      <SidebarPalette
        isOpen={isOpen}
        toggle={() => setIsOpen(prev => !prev)}
        onAddBlock={(type) => {
          setBlocks(prev => [...prev, { id: `${Date.now()}`, type, content: "" }]);
        }}
      />

      {/* Main Editor */}
      <main className="flex-1 overflow-auto p-6 transition-all duration-300">
        {/* Kopfzeile mit nur Save/Cancel Buttons */}
        <div className="flex justify-between items-center mb-4">
          <button
            className="px-3 py-1.5 border rounded-lg text-sm shadow hover:bg-gray-100 transition"
            onClick={() => router.push(`/wiki/${article.id}`)}
          >
            Abbrechen
          </button>
          <button
            className="px-3 py-1.5 border rounded-lg text-sm shadow hover:bg-gray-100 transition"
            onClick={() => handleSave(blocks)}
          >
            Speichern
          </button>
        </div>

        <EditorLayout
          articleId={article.id}
          initialBlocks={blocks}
          onSave={handleSave}
          showPreview={false}
          showPalette={false} // Palette extern
          showToolbar={false} // Toolbar deaktiviert
          contentClassName="prose max-w-full"
          onBlocksChange={(newBlocks) => setBlocks(newBlocks)} // damit Änderungen gespeichert werden
        />
      </main>
    </div>
  );
}
