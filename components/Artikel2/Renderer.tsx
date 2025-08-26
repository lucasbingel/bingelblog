"use client";

import CodeBlock from "@/components/Artikel/Items/CodeBlock";
import type { EditorBlock } from "./types";

export default function Renderer({ blocks }: { blocks: EditorBlock[] }) {
  return (
    <article className="prose max-w-none">
      {blocks.map((block) => {
        switch (block.type) {
          case "heading":
            return (
              <h2 key={block.id} className="text-2xl font-bold">
                {block.content}
              </h2>
            );
          case "text":
            return <p key={block.id}>{block.content}</p>;
          case "code":
            return (
              <CodeBlock
                key={block.id}
                value={block.content}
                language={block.language || "javascript"}
              />
            );
          case "list":
            return (
              <ul key={block.id} className="list-disc ml-6">
                {(block.content || "").split("\n").map((it, idx) => (
                  <li key={idx}>{it}</li>
                ))}
              </ul>
            );
          case "image":
            return <img key={block.id} src={block.content} alt="" className="rounded" />;
          case "quote":
            return (
              <blockquote key={block.id} className="border-l-4 pl-4 italic text-gray-700">
                {block.content}
              </blockquote>
            );
          case "video":
            return (
              <div key={block.id} className="aspect-video w-full rounded overflow-hidden border">
                <iframe
                  src={block.content}
                  title="Video"
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            );
          case "divider":
            return <hr key={block.id} className="my-6" />;
          default:
            return null;
        }
      })}
    </article>
  );
}
