// Pfad: components/Artikel2/Renderer.tsx
"use client";

import CodeBlock from "@/components/Artikel/Items/CodeBlock";
import type { EditorBlock } from "./types";

export default function Renderer({ blocks }: { blocks: EditorBlock[] }) {
  return (
    <article className="prose max-w-none">
      {blocks.map((block) => {
        switch (block.type) {
          case "heading":
            return <h2 key={block.id} className="text-2xl font-bold">{block.content}</h2>;

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
                {(block.content as string).split("\n").map((it: string, idx: number) => (
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

          // Neue Blöcke
          case "table":
  return (
    <table className="border-collapse border border-gray-300 w-full text-sm">
      <tbody>
        {Array.isArray(block.content) && block.content.map((row: string[], rowIndex: number) => (
          <tr key={rowIndex}>
            {row.map((cell: string, colIndex: number) => (
              <td key={colIndex} className="border border-gray-300 px-2 py-1">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );


          case "section":
            return (
              <section key={block.id} className="border p-2 my-2 bg-gray-50 rounded">
                <h3 className="font-semibold">{block.content as string}</h3>
                {block.children && <Renderer blocks={block.children} />}
              </section>
            );

          case "collapsible":
            return (
              <details key={block.id} className="border p-2 my-2 rounded bg-gray-100">
                <summary className="cursor-pointer font-semibold">{(block.content as any).title}</summary>
                <div className="mt-1">{(block.content as any).body}</div>
              </details>
            );

          case "alert":
            return (
              <div
                key={block.id}
                className={`p-2 my-2 rounded ${
                  (block.content as any).level === "info" ? "bg-blue-100" : "bg-red-100"
                } border`}
              >
                {(block.content as any).text}
              </div>
            );

          default:
            return null;
        }
      })}
    </article>
  );
}
