"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useState } from "react";
import { Copy } from "lucide-react";

export default function CodeBlock({
  language,
  value,
}: {
  language: string;
  value: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof window === "undefined") return;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = value;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  return (
    <div className="relative my-4 group">
      <div className="absolute top-2 right-2 flex items-center gap-2">
        <span className="text-[10px] text-gray-400 bg-gray-900/80 px-2 py-0.5 rounded">
          {language}
        </span>

        <button
          onClick={handleCopy}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-all 
            ${copied ? "bg-green-200 text-black" : "bg-gray-800 text-white opacity-80 hover:opacity-100"}`}
        >
          {copied ? (
            <>
              <span className="font-bold text-sm">✅</span> Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" /> Copy
            </>
          )}
        </button>
      </div>

      <SyntaxHighlighter
        language={language}
        style={oneDark as any}
        showLineNumbers
        customStyle={{
          borderRadius: "0.5rem",
          padding: "1rem",
          fontSize: "0.9rem",
        } as any}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
}
