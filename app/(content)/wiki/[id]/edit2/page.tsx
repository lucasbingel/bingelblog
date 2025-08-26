"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SidebarPalette from "@/components/Artikel2/SidebarPalette";
import EditorLayout from "@/components/Artikel2/EditorLayout";
import type { EditorBlock } from "@/components/Artikel2/types";
import type { WikiPage, WikiPageRaw } from "@/lib/wikipages";
import { getWikiArticleById, createWikiArticle, saveWikiArticle, parseWikiPage } from "@/lib/wikipages";

export default function EditArticle2Page() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
  const [blocks, setBlocks] = useState<EditorBlock[]>([]);

  // --- Laden oder neu erstellen
  useEffect(() => {
    if (!id) return;

    let raw: WikiPageRaw | undefined = getWikiArticleById(id);
    if (!raw) raw = createWikiArticle(id);

    const page: WikiPage = parseWikiPage(raw);
    setSelectedPage(page);
    setBlocks(page.content || []);
  }, [id]);

  // --- Speichern ---
  const handleSave = () => {
    if (!selectedPage) return;

    // WikiPage → WikiPageRaw
    const serializeContent = (page: WikiPage): WikiPageRaw => ({
      id: page.id,
      name: page.name,
      parentId: page.parentId,
      content: JSON.stringify(page.content.map(b => ({ ...b, language: b.language || "plaintext" }))),
      children: page.children?.map(child => serializeContent(child)),
    });

    const rawToSave = serializeContent({
      ...selectedPage,
      content: blocks,
    });

    saveWikiArticle(rawToSave);

    setSelectedPage({
      ...selectedPage,
      content: blocks.map(b => ({ ...b, language: b.language || "plaintext" })),
    });

    router.push(`/wiki/${selectedPage.id}`);
  };

  if (!selectedPage) return <div className="p-6">Article not found.</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="sticky top-0 flex-shrink-0">
        <SidebarPalette
          onSelectPage={(page) => {
            let editorBlocks: EditorBlock[] = [];
            if ("content" in page) {
              if (typeof page.content === "string") {
                try {
                  editorBlocks = JSON.parse(page.content) as EditorBlock[];
                } catch {
                  editorBlocks = [];
                }
              } else {
                editorBlocks = page.content;
              }
            }

            setSelectedPage({
              ...page,
              content: editorBlocks,
            } as WikiPage);
            setBlocks(editorBlocks);
          }}
        />
      </aside>

      {/* Editor */}
      <main className="flex-1 overflow-auto p-0">
        

        <EditorLayout
          articleId={selectedPage.id}
          initialBlocks={blocks}
          onBlocksChange={setBlocks}
          onSave={handleSave}
          contentClassName="prose max-w-full w-full"
        />

        <div className="flex gap-2 mt-4">
          <button
            className="px-4 py-2 rounded-xl shadow bg-gray-200 hover:bg-gray-300"
            onClick={() => router.push(`/wiki/${selectedPage.id}`)}
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
  );
}
