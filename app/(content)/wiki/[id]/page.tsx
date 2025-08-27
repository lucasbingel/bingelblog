"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, memo, useMemo, useRef } from "react";
import SidebarWiki from "@/components/Artikel2/SidebarWiki";
import ArticleSkeleton from "@/components/Artikel2/ArtikelSkeleton";
import { Article, ArticleBlock, getArticleById } from "@/lib/articles";
import CodeBlock from "@/components/Artikel/Items/CodeBlock";
import { Virtuoso } from "react-virtuoso";
import Assistant from "@/components/Artikel2/Assistant"; // korrekt
import { usePathname } from "next/navigation";
//Tabs
import DocumentSection from "@/components/Artikel2/Dokuments/DocumentsSection";

import { generateUUID } from "@/app/utils/uuid";
import CommentsTab from "@/components/Artikel2/Tabs/CommentsTab";
import HistoryTab from "@/components/Artikel2/Tabs/HistoryTab";
import LinksTab from "@/components/Artikel2/Tabs/LinksTab";
import StatsTab from "@/components/Artikel2/Tabs/StatsTab";
import TasksTab from "@/components/Artikel2/Tabs/TasksTab";

import { useTabs, CommentItem, TaskItem, LinkItem } from "@/hooks/useTabs";



// html2pdf nur client-side importieren
const html2pdf = typeof window !== "undefined" ? require("html2pdf.js") : null;

// --- EditorBlock Typ zentral
export interface EditorBlock {
  id: string;
  type: ArticleBlock["type"];
  content: any; // string | string[][] | { title: string; body: string } | ...
  language: string; // immer string, nie undefined
  children?: EditorBlock[];
  level?: "info" | "error"; // für alert
}

// --- WikiPage lokal, basiert auf EditorBlock[]
export interface WikiPage {
  id: string;
  name: string;
  content: EditorBlock[];
  parentId?: string;
  children?: WikiPage[];
}

// --- CodeBlock Memo
const CodeBlockMemo = memo(CodeBlock);

// --- BlockMemo inklusive neuer Blöcke
// --- BlockMemo inklusive neuer Blöcke mit Table-Switch
const BlockMemo = memo(({ block }: { block: EditorBlock }) => {
  // --- Table state
  const [tableContent, setTableContent] = useState<string[][]>(() => {
    if (block.type === "table" && Array.isArray(block.content)) {
      return block.content;
    }
    if (typeof block.content === "string") {
      // Text in 1-Spalte-Tabelle umwandeln
      const lines = block.content.split("\n");
      return lines.map(line => [line]);
    }
    return [[]];
  });

  // --- Update Table inline edit
  const updateCell = (r: number, c: number, value: string) => {
    const newTable = [...tableContent];
    newTable[r][c] = value;
    setTableContent(newTable);
    block.content = newTable; // direkt im Block speichern
  };

  // --- Switch block to table (z.B. beim Editor-Change)
  const switchToTable = () => {
    if (block.type !== "table") {
      block.type = "table";
      let newTable: string[][] = [];

      if (typeof block.content === "string") {
        const lines = block.content.split("\n");
        newTable = lines.map(line => [line]);
      } else if (Array.isArray(block.content)) {
        newTable = block.content;
      }

      block.content = newTable;
      setTableContent(newTable);
    }
  };

  // --- Render Block nach type
  switch (block.type) {
    case "heading":
      return <h2 className="text-2xl font-bold my-2">{block.content}</h2>;

    case "text":
      return <p className="my-2 leading-relaxed">{block.content}</p>;

    case "list":
      return (
        <ul className="list-disc ml-6 my-2">
          {(block.content as string).split("\n").map((item, idx) => <li key={idx}>{item}</li>)}
        </ul>
      );

    case "image":
      return <img src={block.content} alt="" className="rounded my-2 w-full" loading="lazy" />;

    case "video":
      return <iframe src={block.content} title="Video" frameBorder="0" allowFullScreen className="w-full h-64 my-2 rounded" />;

    case "quote":
      return <blockquote className="border-l-4 border-blue-500 italic pl-4 bg-gray-50 my-2">{block.content}</blockquote>;

    case "divider":
      return <hr className="my-4 border-gray-300" />;

    case "code":
      return <CodeBlockMemo value={block.content} language={block.language || "markdown"} />;

    // --- Neue Blöcke
    case "table":
      return (
        <table className="table-auto border-collapse border border-gray-300 my-4 w-full">
          <tbody>
            {tableContent.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="border px-2 py-1">
                    <input
                      value={cell}
                      onChange={(e) => updateCell(rIdx, cIdx, e.target.value)}
                      className="w-full border-none outline-none bg-transparent"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );

    case "section":
      return (
        <section className="border p-2 my-2 bg-gray-50 rounded">
          <h3 className="font-semibold">{block.content}</h3>
          {block.children?.map(child => <BlockMemo key={child.id} block={child} />)}
        </section>
      );

    case "collapsible":
      return (
        <details className="border p-2 my-2 rounded bg-gray-100">
          <summary className="cursor-pointer font-semibold">{block.content.title}</summary>
          <div className="mt-1">{block.content.body}</div>
        </details>
      );

    case "alert":
      return (
        <div className={`p-2 my-2 rounded ${block.content.level === "info" ? "bg-blue-100" : "bg-red-100"} border`}>
          {block.content.text}
        </div>
      );

    default:
      return <p>{block.content}</p>;
  }
});


const CHUNK_SIZE = 20;
const CHUNK_THRESHOLD = 1000;

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
  const pathname = usePathname();
const [activeTab, setActiveTab] = useState<
    "wiki" | "documents" | "comments" | "history" | "tasks" | "links" | "stats"
  >("wiki");
  const [article, setArticle] = useState<Article | null>(null);
  const [allBlocks, setAllBlocks] = useState<EditorBlock[]>([]);
  const [visibleBlocks, setVisibleBlocks] = useState<EditorBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);

  const { comments, setComments, tasks, setTasks, links, setLinks, stats } = useTabs({
    views: article?.views || 0,
    edits: 0,
    comments: 0,
    attachments: 0
  });

  // ganz oben in der Komponente
const [documents, setDocuments] = useState<{ id: string; name: string; url: string }[]>([
  { id: "1", name: "Projektplan.pdf", url: "/docs/projektplan.pdf" },
  { id: "2", name: "Notizen.docx", url: "/docs/notizen.docx" },
]);

function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
  if (e.target.files && e.target.files.length > 0) {
    const file = e.target.files[0];
    const newDoc = {
      id: crypto.randomUUID(),
      name: file.name,
      url: URL.createObjectURL(file), // ⚠️ Demo: erzeugt nur lokalen Link
    };
    setDocuments((prev) => [...prev, newDoc]);
  }
}

  // --- Laden von Article / WikiPage
  useEffect(() => {
    if (!id || Array.isArray(id)) return;

    const found = getArticleById(id);
    if (!found) {
      setArticle(null);
      setSelectedPage(null);
      setAllBlocks([]);
      setVisibleBlocks([]);
      setLoading(false);
      return;
    }

    setArticle(found);

    let blocks: EditorBlock[] = [];
    try {
      blocks = (JSON.parse(found.content) as ArticleBlock[]).map(b => ({
        ...b,
        language: b.language || "markdown",
      }));
    } catch {
      blocks = [];
    }

    setAllBlocks(blocks);
    setVisibleBlocks(blocks.length <= CHUNK_THRESHOLD ? blocks : []);
    setSelectedPage({
      id: found.id,
      name: found.name,
      content: blocks,
    });

    setLoading(false);
  }, [id]);

  // --- Chunked Loading bei sehr großen Artikeln
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

  const downloadMarkdown = () => {
    if (!renderedBlocks.length) return;
    const md = renderedBlocks.map(b => {
      switch (b.type) {
        case "heading": return `## ${b.content}\n`;
        case "text": return `${b.content}\n`;
        // case "list": return b.content.split("\n").map(l => `- ${l}`).join("\n") + "\n";
        case "code": return `\`\`\`${b.language || "markdown"}\n${b.content}\n\`\`\`\n`;
        case "quote": return `> ${b.content}\n`;
        case "divider": return `---\n`;
        case "image": return `![image](${b.content})\n`;
        case "video": return `[Video](${b.content})\n`;
        case "table": return JSON.stringify(b.content, null, 2) + "\n";
        case "section": return `### ${b.content}\n`;
        case "collapsible": return `${b.content.title}\n${b.content.body}\n`;
        case "alert": return `[${b.content.level}] ${b.content.text}\n`;
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

  const downloadPDF = () => {
    if (!pdfRef.current || !html2pdf) return;
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
      <SidebarWiki
        onSelectPage={(page: Article | WikiPage) => {
          if ("content" in page) {
            let blocks: EditorBlock[] = [];
            if (typeof page.content === "string") {
              try {
                const parsed = JSON.parse(page.content) as Partial<EditorBlock>[];
                blocks = parsed.map((b: Partial<EditorBlock>) => ({
                  id: b.id || generateUUID(),
                  type: b.type || "text",
                  content: b.content || "",
                  language: b.language || "markdown",
                }));
              } catch {
                blocks = [];
              }
            } else {
              blocks = page.content.map((b) => ({
                id: b.id,
                type: b.type,
                content: b.content,
                language: b.language || "markdown",
                children: b.children,
                level: b.level,
              }));
            }

            setSelectedPage({
              id: page.id,
              name: page.name,
              content: blocks,
            });
          }
        }}
      />
    </aside>

    <main className="flex-1 overflow-auto p-6">
      <div className="mb-4">
        {/* Reihe 1: Breadcrumb + Selected Page und Buttons */}
        <div className="flex justify-between items-start">
          <div>
            {/* Breadcrumb */}
            <div className="text-gray-500 text-sm">
              {article?.name ? `Article > Wiki > ${article.name}` : "Article > Wiki"}
            </div>
            {/* Selected Page */}
            {selectedPage && (
              <h1 className="text-2xl font-bold">{selectedPage.name}</h1>
            )}
          </div>

          {/* Buttons rechts */}
          <div className="flex gap-2">
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
        </div>

        {/* Reihe 2: Last edited + Views */}
        <div className="flex justify-between mt-2 items-center text-xs text-gray-600">
          <div>
            Last edited by{" "}
            <span className="font-bold">{article?.creator || ""} a minute ago</span>
          </div>
          <div className="text-gray-400">{article?.views || 0} views</div>
        </div>
      </div>

      {/* Reihe 3: Tabs */}
      {/* Tabs */}
        <div className="border-b border-gray-300 mt-4">
          <nav className="flex space-x-4 flex-wrap">
            {[
              { key: "wiki", label: "WikiPage" },
              { key: "documents", label: "Documents" },
              { key: "comments", label: "Comments" },
              { key: "history", label: "History" },
              { key: "tasks", label: "Tasks" },
              { key: "links", label: "Links" },
              { key: "stats", label: "Stats" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`pb-2 text-sm font-medium cursor-pointer ${
                  activeTab === tab.key ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600 hover:text-gray-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

      <hr className="mb-4 border-gray-300" />

      {/* Tab Content */}
      {loading ? (
        <ArticleSkeleton blocksCount={10} />
      ) : !selectedPage ? (
        <div className="p-6 mt-30 text-gray-500 text-center">
          Wähle eine Seite aus der Sidebar aus, um Inhalte anzuzeigen.
        </div>
      ) : (
        <div ref={pdfRef}>
          {activeTab === "wiki" && selectedPage.content.length > 0 && (
            <Virtuoso
              style={{ height: "80vh", width: "100%" }}
              data={selectedPage.content}
              increaseViewportBy={{ top: 600, bottom: 600 }}
              components={{
                Item: ({ children, ...props }) => (
                  <div {...props} style={{ padding: "2px 0" }}>
                    {children}
                  </div>
                ),
              }}
              itemContent={(index, block) => <BlockMemo key={block.id} block={block} />}
            />
          )}

          {activeTab === "wiki" && selectedPage.content.length === 0 && (
            <div>
              <p className="text-gray-500">
                Kein Inhalt für diese Seite.
                <br />
                Nutze unseren Editor und lege neues Wissen an oder lösche diese
                Seite.
              </p>
              <button
                className="px-3 mt-4 py-1.5 border rounded-lg text-sm shadow hover:bg-gray-100"
                onClick={() => router.push(`/wiki/${article?.id}/edit2`)}
              >
                ✏️ Loslegen
              </button>
              <button
                className="px-3 mt-4 ml-4 py-1.5 border rounded-lg text-sm shadow hover:bg-gray-100"
                onClick={() => router.push(`/wiki/${article?.id}/edit2`)}
              >
                Seite Löschen
              </button>
            </div>
          )}

          {activeTab === "documents" && <DocumentSection />}
          {activeTab === "wiki" && <Virtuoso style={{ height: "80vh", width: "100%" }} data={selectedPage.content} itemContent={(i, block) => <BlockMemo key={block.id} block={block} />} />}
           
            {activeTab === "history" && <HistoryTab history={[]} />}
            {activeTab === "tasks" && <TasksTab tasks={tasks} setTasks={setTasks} />}
            {activeTab === "links" && <LinksTab links={links} setLinks={setLinks} />}
            {activeTab === "stats" && <StatsTab stats={stats} />}
        </div>
      )}
    </main>

    <Assistant wikiPages={selectedPage ? [selectedPage] : []} />
  </div>
);



}
