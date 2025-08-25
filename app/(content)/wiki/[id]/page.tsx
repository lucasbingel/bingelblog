"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, memo } from "react";
import Sidebar from "@/components/Artikel2/Sidebar";
import ArticleSkeleton from "@/components/Artikel2/ArtikelSkeleton";
import { Article, ArticleBlock, getArticleById } from "@/lib/articles";
import CodeBlock from "@/components/Artikel/Items/CodeBlock";

const CodeBlockMemo = memo(CodeBlock);

const CHUNK_SIZE = 5;
const INTERVAL_MS = 50;

export default function ArticlePage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [article, setArticle] = useState<Article | null>(null);
  const [allBlocks, setAllBlocks] = useState<ArticleBlock[]>([]);
  const [visibleBlocks, setVisibleBlocks] = useState<ArticleBlock[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // --- Artikel laden
  useEffect(() => {
    if (!id || Array.isArray(id)) return;

    const found = getArticleById(id);

    if (!found) {
      setArticle(null);
      setAllBlocks([]);
      setVisibleBlocks([]);
      setLoading(false);
      return;
    }

    setArticle(found);

    try {
      const parsed = JSON.parse(found.content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setAllBlocks(parsed);
      } else {
        setAllBlocks([{ id: `${Date.now()}`, type: "text", content: found.content }]);
      }
    } catch {
      setAllBlocks([{ id: `${Date.now()}`, type: "text", content: found.content }]);
    }

    setVisibleBlocks([]);
    setProgress(0);
    setLoading(false);
  }, [id]);

  // --- Chunk-Ladung ab Index 0
useEffect(() => {
  if (!allBlocks.length) return;

  let currentIndex = 0 - CHUNK_SIZE;

  const interval = setInterval(() => {
    setVisibleBlocks(prev => {
      const nextChunk = allBlocks.slice(currentIndex, currentIndex + CHUNK_SIZE);
      const next = [...prev, ...nextChunk];

      setProgress(Math.min((next.length / allBlocks.length) * 100, 100));

      return next;
    });

    // Index **nach dem Hinzufügen** aktualisieren
    currentIndex += CHUNK_SIZE;

    if (currentIndex >= allBlocks.length) {
      clearInterval(interval);
      setProgress(100);
    }
  }, INTERVAL_MS);

  return () => clearInterval(interval);
}, [allBlocks]);


  if (!article && !loading) return <div className="p-6 text-red-500">Article not found</div>;

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <aside className="sticky top-0 h-screen flex-shrink-0">
        <Sidebar />
      </aside>

      <main className="flex-1 overflow-auto p-6">
        {/* Header */}
        <div className="grid grid-cols-2 grid-rows-2 gap-2 mb-2">
          <div className="text-gray-500 text-sm">
            Article &gt; Wiki &gt; {article?.name || ""}
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1.5 border rounded-lg text-sm shadow hover:bg-gray-100"
              onClick={() => router.push(`/wiki/${article?.id}/edit`)}
            >
              ✏️ Edit
            </button>
            <button
              className="px-3 py-1.5 border rounded-lg text-sm shadow hover:bg-gray-100"
              onClick={() => router.push(`/wiki/${article?.id}/edit2`)}
            >
              ✏️ Edit 2
            </button>
          </div>
          <div className="text-gray-600 text-xs">
            Last edited by <span className="font-bold">{article?.creator || ""} a minute ago</span>
          </div>
          <div className="text-xs text-gray-400 flex justify-end">
            {article?.views || 0} views
          </div>
        </div>

        <hr className="mb-4 border-gray-300" />

        {/* Progress */}
        {visibleBlocks.length < allBlocks.length && (
          <div className="mb-4 w-full bg-gray-200 h-2 rounded">
            <div
              className="bg-blue-500 h-2 rounded transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Skeleton nur anzeigen, wenn noch keine Blöcke geladen */}
        {visibleBlocks.length === 0 ? (
          <ArticleSkeleton blocksCount={Math.max(10, allBlocks.length)} />
        ) : (
          <article className="prose max-w-full">
            {visibleBlocks.map(block => {
              switch (block.type) {
                case "heading":
                  return <h2 key={block.id} className="text-2xl font-bold">{block.content}</h2>;
                case "text":
                  return <p key={block.id}>{block.content}</p>;
                case "code":
                  return <CodeBlockMemo key={block.id} value={block.content} language="js" />;
                case "list":
                  return (
                    <ul key={block.id} className="list-disc ml-6">
                      {block.content.split("\n").map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  );
                case "image":
                  return <img key={block.id} src={block.content} alt="" className="rounded" loading="lazy" />;
                case "quote":
                  return <blockquote key={block.id} className="border-l-4 border-blue-500 italic pl-4 my-2 bg-gray-50">{block.content}</blockquote>;
                case "video":
                  return (
                    <div key={block.id} className="my-4">
                      <iframe
                        width="560"
                        height="315"
                        src={block.content}
                        title="Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-64 rounded"
                      ></iframe>
                    </div>
                  );
                case "divider":
                  return <hr key={block.id} className="my-4 border-gray-300" />;
                default:
                  return null;
              }
            })}
          </article>
        )}
      </main>
    </div>
  );
}
