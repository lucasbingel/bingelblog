"use client";

import React from "react";
import { ArticleBlock } from "@/lib/articles";
import CodeBlock from "../Items/CodeBlock";

interface Props {
  content: string;
}

export default function MarkdownRenderer({ content }: Props) {
  let blocks: ArticleBlock[] = [];

  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) blocks = parsed;
    else blocks = [{ id: "1", type: "text", content }];
  } catch {
    blocks = [{ id: "1", type: "text", content }];
  }

  return (
    <div className="space-y-4">
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
            return <CodeBlock key={block.id} language="js" value={block.content} />;
          case "list":
            return (
              <ul key={block.id} className="list-disc pl-5">
                {block.content.split("\n").map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            );
          case "image":
            return <img key={block.id} src={block.content} alt="" className="max-w-full" />;
          default:
            return <p key={block.id}>{block.content}</p>;
        }
      })}
    </div>
  );
}
