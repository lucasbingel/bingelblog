"use client";

import React from "react";
import { ArticleBlock } from "@/lib/articles";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import CodeBlock from "@/components/Artikel/Editor/MarkdownRenderer"; // kann dein vorhandener MarkdownRenderer sein

interface Props {
  blocks: ArticleBlock[];
}

export default function BlockRenderer({ blocks }: Props) {
  return (
    <>
      {blocks.map((block) => {
        switch (block.type) {
          case "heading":
            return <h2 key={block.id} className="text-xl font-bold my-2">{block.content}</h2>;
          case "text":
            return <p key={block.id} className="my-2">{block.content}</p>;
          case "code":
  return (
    <CodeBlock
      key={block.id}
      content={block.content}  // statt value
    />
  );

          case "list":
            return (
              <ul key={block.id} className="list-disc ml-6 my-2">
                {block.content.split("\n").map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            );
          case "image":
            return <img key={block.id} src={block.content} alt="" className="my-2 rounded" />;
          default:
            return null;
        }
      })}
    </>
  );
}
