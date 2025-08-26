"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, memo, useMemo, useRef } from "react";
import Sidebar from "@/components/Artikel2/Sidebar";
import ArticleSkeleton from "@/components/Artikel2/ArtikelSkeleton";
import { Article, ArticleBlock, getArticleById } from "@/lib/articles";
import CodeBlock from "@/components/Artikel/Items/CodeBlock";
import { Virtuoso } from "react-virtuoso";
import html2pdf from "html2pdf.js";

const CodeBlockMemo = memo(CodeBlock);

// Memo für Text/Heading/Quote/Divider/List/Image/Video
const BlockMemo = memo(({ block }: { block: ArticleBlock }) => {
  switch (block.type) {
    case "heading":
      return <h2 className="text-2xl font-bold my-2">{block.content}</h2>;
    case "text":
      return <p className="my-2 leading-relaxed">{block.content}</p>;
    case "list":
      return (
        <ul className="list-disc ml-6 my-2">
          {block.content.split("\n").map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
    case "image":
      return <img src={block.content} alt="" className="rounded my-2 w-full" loading="lazy" />;
    case "video":
      return (
        <iframe
          src={block.content}
          title="Video"
          frameBorder="0"
          allowFullScreen
          className="w-full h-64 my-2 rounded"
        />
      );
    case "quote":
      return <blockquote className="border-l-4 border-blue-500 italic pl-4 bg-gray-50 my-2">{block.content}</blockquote>;
    case "divider":
      return <hr className="my-4 border-gray-300" />;
    case "code":
      return <CodeBlockMemo value={block.content} language="js" />;
    default:
      return <p>{block.content}</p>;
  }
});

const CHUNK_SIZE = 20;
const CHUNK_THRESHOLD = 1000;

// Hilfsfunktion: problematische Farben / Lab entfernen
function sanitizeStyles(element: HTMLElement) {
  const allElements = element.querySelectorAll("*");
  allElements.forEach(el => {
    const style = getComputedStyle(el);
    if (style.color.startsWith("lab")) (el as HTMLElement).style.color = "black";
    if (style.backgroundColor.startsWith("lab")) (el as HTMLElement).style.backgroundColor = "white";
  });
}

export default function ArticlePage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const pdfRef = useRef<HTMLDivElement>(null);

  const [article, setArticle] = useState<Article | null>(null);
  const [allBlocks, setAllBlocks] = useState<ArticleBlock[]>([]);
  const [visibleBlocks, setVisibleBlocks] = useState<ArticleBlock[]>([]);
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
      const blocks = Array.isArray(parsed) ? parsed : [];
      setAllBlocks(blocks);

      if (blocks.length > CHUNK_THRESHOLD) {
        setVisibleBlocks([]);
      } else {
        setVisibleBlocks(blocks);
      }
    } catch {
      setAllBlocks([]);
      setVisibleBlocks([]);
    }

    setLoading(false);
  }, [id]);

  // --- Chunked Loading optimiert mit requestIdleCallback
  useEffect(() => {
    if (!allBlocks.length || allBlocks.length <= CHUNK_THRESHOLD) {
      setVisibleBlocks(allBlocks);
      return;
    }

    let currentIndex = 0;
    const loadChunk = () => {
      const nextChunk = allBlocks.slice(currentIndex, currentIndex + CHUNK_SIZE);
      if (!nextChunk.length) return;

      setVisibleBlocks(prev => [...prev, ...nextChunk]);
      currentIndex += CHUNK_SIZE;

      if (currentIndex < allBlocks.length) requestIdleCallback(loadChunk);
    };

    requestIdleCallback(loadChunk);
  }, [allBlocks]);

  const renderedBlocks = useMemo(() => visibleBlocks, [visibleBlocks]);

  // --- Download als Markdown
  const downloadMarkdown = () => {
    if (!renderedBlocks.length) return;

    const md = renderedBlocks.map(b => {
      switch (b.type) {
        case "heading": return `## ${b.content}\n`;
        case "text": return `${b.content}\n`;
        case "list": return b.content.split("\n").map(l => `- ${l}`).join("\n") + "\n";
        case "code": return `\`\`\`js\n${b.content}\n\`\`\`\n`;
        case "quote": return `> ${b.content}\n`;
        case "divider": return `---\n`;
        case "image": return `![image](${b.content})\n`;
        case "video": return `[Video](${b.content})\n`;
        default: return `${b.content}\n`;
      }
    }).join("\n");

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${article?.name || "article"}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Download als PDF
  const downloadPDF = () => {
    if (!pdfRef.current) return;
    sanitizeStyles(pdfRef.current);

    html2pdf()
      .set({
        margin: 10,
        filename: `${article?.name || "article"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(pdfRef.current)
      .save();
  };

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
            <button
              className="px-3 py-1.5 border rounded-lg text-sm shadow hover:bg-gray-100"
              onClick={downloadMarkdown}
            >
              ⬇️ Download MD
            </button>
            <button
              className="px-3 py-1.5 border rounded-lg text-sm shadow hover:bg-gray-100"
              onClick={downloadPDF}
            >
              ⬇️ Download PDF
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

        {/* Skeleton / Placeholder */}
        {loading ? (
          <ArticleSkeleton blocksCount={10} />
        ) : renderedBlocks.length === 0 ? (
          <div className="p-6 mt-30 text-gray-500 text-center">
            Kein Inhalt vorhanden. <br /> Bitte hinterlege neues Wissen und starte mit dem Editor.<br />
            <button
              className="mt-4 px-4 py-2 border rounded-lg shadow hover:bg-gray-100"
              onClick={() => router.push(`/wiki/${article?.id}/edit2`)}
            >
              ✏️ Loslegen
            </button>
          </div>
        ) : (
          <div ref={pdfRef}>
            <Virtuoso
              style={{ height: "80vh", width: "100%" }}
              data={renderedBlocks}
              increaseViewportBy={{ top: 600, bottom: 600 }}
              components={{
                Item: ({ children, ...props }) => <div {...props} style={{ padding: "2px 0" }}>{children}</div>,
              }}
              itemContent={(index, block) => <BlockMemo key={block.id} block={block} />}
            />
          </div>
        )}
      </main>
    </div>
  );
}
