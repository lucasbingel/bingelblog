"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Artikel/Sidebar";
import { Article, ArticleBlock, getArticleById } from "@/lib/articles";
import CodeBlock from "@/components/Artikel/Items/CodeBlock";

export default function ArticlePage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [article, setArticle] = useState<Article | null>(null);
  const [blocks, setBlocks] = useState<ArticleBlock[]>([]);

  // Sidebar Toggle
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (!id || Array.isArray(id)) return;
    const found = getArticleById(id);
    if (found) {
      setArticle(found);
      try {
        const parsed = JSON.parse(found.content);
        if (Array.isArray(parsed)) setBlocks(parsed);
        else setBlocks([{ id: "1", type: "text", content: found.content }]);
      } catch {
        setBlocks([{ id: "1", type: "text", content: found.content }]);
      }
    }
  }, [id]);

  if (!article) return <div className="p-6 text-red-500">Article not found</div>;

  return (
    <div className="flex bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`sticky top-0 h-screen flex-shrink-0 border-r bg-gray-100 transition-all duration-300 ${
          isOpen ? "w-72" : "w-16"
        }`}
      >
        <Sidebar isOpen={isOpen} toggle={() => setIsOpen(prev => !prev)} />
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 overflow-auto h-screen p-6 transition-all duration-300 ${
          isOpen ? "ml-0" : "ml-0"
        }`}
      >
        {/* Header */}
        <div className="grid grid-cols-2 grid-rows-2 gap-2 mb-2">
          <div className="text-gray-500 text-sm">
            Article &gt; Wiki &gt; {article.name}
          </div>

          <div className="flex justify-end gap-2">
            <button
              className="px-3 py-1.5 border rounded-lg text-sm shadow hover:bg-gray-100 transition"
              onClick={() => router.push(`/wiki/${article.id}/edit`)}
            >
              ✏️ Edit
            </button>
            <button
              className="px-3 py-1.5 border rounded-lg text-sm shadow hover:bg-gray-100 transition"
              onClick={() => router.push(`/wiki/${article.id}/edit2`)}
            >
              ✏️ Edit 2
            </button>
            <button className="px-3 py-1.5 border rounded-lg text-sm shadow hover:bg-gray-100 transition">
              Fav
            </button>
            <button className="px-3 py-1.5 border rounded-lg text-sm shadow hover:bg-gray-100 transition">
              Share
            </button>
          </div>

          <div className="text-gray-600 text-xs">
            Last edited by{" "}
            <span className="font-bold">{article.creator} a minute ago</span>
          </div>

          <div className="text-xs text-gray-400 flex justify-end">
            {article.views} views
          </div>
        </div>

        <hr className="mb-4 border-gray-300" />

        {/* Content */}
        <article className="prose max-w-full">
          {blocks.map(block => {
            switch (block.type) {
              case "heading":
                return <h2 key={block.id} className="text-2xl font-bold">{block.content}</h2>;
              case "text":
                return <p key={block.id}>{block.content}</p>;
              case "code":
                return <CodeBlock key={block.id} value={block.content} language="js" />;
              case "list":
                return (
                  <ul key={block.id} className="list-disc ml-6">
                    {block.content.split("\n").map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                );
              case "image":
                return <img key={block.id} src={block.content} alt="" className="rounded" />;
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
      </main>
    </div>
  );
}
