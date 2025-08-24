"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Article, getArticleById, updateArticle, ArticleBlock } from "@/lib/articles";
import BlockEditor from "@/components/Artikel/Editor/BlockEditor";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();

  const [article, setArticle] = useState<Article | null>(null);
  const [blocks, setBlocks] = useState<ArticleBlock[]>([]);

  useEffect(() => {
    if (!params || !("id" in params)) return;
    const id = params.id as string;
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
  }, [params]);

  if (!article) return <div className="p-6 text-red-500">Article not found</div>;

  const handleSave = (updatedBlocks: ArticleBlock[]) => {
    const jsonString = JSON.stringify(updatedBlocks);
    updateArticle(article.id, jsonString);
    router.push(`/wiki/${article.id}`);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 p-6 gap-6">
      {/* Editor links */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-xl font-bold mb-4">{article.name} (Editor)</h2>
        <BlockEditor blocks={blocks} setBlocks={setBlocks} onSave={handleSave} />
      </div>

      {/* Live Preview rechts */}
      <div className="flex-1 p-4 border rounded bg-white overflow-auto">
        <h2 className="text-xl font-bold mb-4">Live Preview</h2>
        {blocks.map((block) => {
          switch (block.type) {
            case "heading":
              return (
                <h2 key={block.id} className="text-2xl font-bold my-2">
                  {block.content}
                </h2>
              );
            case "text":
              return (
                <p key={block.id} className="my-2">
                  {block.content}
                </p>
              );
            case "code":
              return (
                <SyntaxHighlighter
                  key={block.id}
                  language="javascript"
                  style={oneDark}
                  className="rounded my-2"
                >
                  {block.content}
                </SyntaxHighlighter>
              );
            case "list":
              return (
                <ul key={block.id} className="list-disc pl-5 my-2">
                  {block.content.split("\n").map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              );
            case "image":
              return (
                <img
                  key={block.id}
                  src={block.content}
                  alt=""
                  className="max-w-full my-2 rounded"
                />
              );
            default:
              return <p key={block.id}>{block.content}</p>;
          }
        })}
      </div>
    </div>
  );
}
