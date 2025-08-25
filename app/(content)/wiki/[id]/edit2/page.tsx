"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SidebarPalette from "@/components/Artikel2/SidebarPalette";
import EditorLayout from "@/components/Artikel2/EditorLayout";
import { getArticleById, updateArticle, type Article } from "@/lib/articles";
import type { EditorBlock } from "@/components/Artikel2/types";

// --- Helper: JSON -> EditorBlocks
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

  // --- Load article
  useEffect(() => {
    if (!id) return;
    const a = getArticleById(id);
    if (!a) return;
    setArticle(a);
    setBlocks(toEditorBlocks(a.content));
  }, [id]);

  // --- Save article
  const handleSave = () => {
    if (!article) return;
    updateArticle(article.id, JSON.stringify(blocks));
    router.push(`/wiki/${article.id}`);
  };

  if (!article) return <div className="p-6">Article not found.</div>;

  return (
    <div className="flex flex-col h-screen bg-gray-50">

      {/* Body: Sidebar + Editor */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar fixiert, eigene Scrollbar */}
        <SidebarPalette
          isOpen={true}
          toggle={() => {}}
          onAddBlock={(type) => {
            setBlocks(prev => [...prev, { id: `${Date.now()}`, type, content: "" }]);
          }}
        />

        {/* Editor / Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="w-full mx-auto">
            <EditorLayout
              articleId={article.id}
              initialBlocks={blocks}
              onSave={handleSave}
              showPreview={false}
              showPalette={false}   // Palette extern
              showToolbar={false}   // Toolbar extern
              contentClassName="prose max-w-full w-full" // Blockitems breiter
              onBlocksChange={setBlocks} // synchronisiert Page-State
            />
          </div>

          {/* Save / Abbrechen */}
          <div className="fixed bottom-6 right-6 flex gap-2">
            <button
              className="px-4 py-2 rounded-xl shadow bg-gray-200 hover:bg-gray-300"
              onClick={() => router.push(`/wiki/${article.id}`)}
            >
              Abbrechen
            </button>
            <button
              className="px-4 py-2 rounded-xl shadow bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleSave}
            >
              Speichern
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
