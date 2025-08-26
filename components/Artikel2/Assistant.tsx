// components/Artikel2/Assistant.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Plus, Trash2, Send, Download } from "lucide-react";

/**
 * Optionaler Typ für Wiki-Seiten — passe bei Bedarf an dein Projekt an.
 */
export interface EditorBlock {
  id: string;
  type: string;
  content: any;
  language?: string;
  children?: EditorBlock[];
}
export interface WikiPage {
  id: string;
  name: string;
  content: EditorBlock[];
  parentId?: string;
}

/** Vorschlag (z. B. Treffer) */
export interface BotSuggestion {
  id?: string;
  label: string;
  href?: string;
  score?: number;
}

/** Einheitlicher Message-Typ (keine 'string' role) */
export interface ChatMessage {
  role: "user" | "bot";
  text: string;
  suggestions?: BotSuggestion[];
  createdAt?: number;
}

/** Tab / Chat */
export interface ChatTab {
  id: number;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}

/** Props */
interface AssistantProps {
  wikiPages?: WikiPage[]; // optional — für reale Suche / Links
  assistantName?: string; // default "Lumi"
  maxChats?: number; // default 3
  basePath?: string; // url-prefix für wiki links, default "/wiki"
}

/** Utility: simple scoring for search (title heavier) */
function scorePage(query: string, page: WikiPage) {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const tokens = q.split(/\s+/);
  let score = 0;
  const title = page.name.toLowerCase();
  for (const t of tokens) {
    if (title.includes(t)) score += 3;
  }
  const maxBlocks = Math.min(200, page.content?.length ?? 0);
  for (let i = 0; i < maxBlocks; i++) {
    const b = page.content[i];
    const text =
      typeof b?.content === "string" ? b.content : JSON.stringify(b?.content ?? "");
    const lc = text.toLowerCase();
    for (const t of tokens) if (lc.includes(t)) score += 1;
  }
  return score;
}

/** Component */
export default function Assistant({
  wikiPages = [],
  assistantName = "Lumi",
  maxChats = 3,
  basePath = "/wiki",
}: AssistantProps) {
  const [open, setOpen] = useState(false);
  const [tabs, setTabs] = useState<ChatTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // initialize with one tab if empty
  useEffect(() => {
    if (tabs.length === 0) {
      const id = Date.now();
      const intro: ChatMessage = {
        role: "bot",
        text: `👋 Hallo — ich bin ${assistantName}. Frag mich nach Prozessen, Formularen oder Richtlinien. Du kannst auch Quick-Actions nutzen.`,
        suggestions: [
          { label: "🔎 Artikel suchen", href: undefined },
          { label: "📄 Letzte Artikel", href: undefined },
          { label: "❓ Hilfe", href: undefined },
        ],
        createdAt: Date.now(),
      };
      const first: ChatTab = {
        id,
        title: "Chat 1",
        messages: [intro],
        createdAt: id,
      };
      setTabs([first]);
      setActiveTabId(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // autoscroll on message change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tabs, activeTabId]);

  // keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        createNewChat();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tabs]);

  const activeTab = useMemo(
    () => tabs.find((t) => t.id === activeTabId) ?? null,
    [tabs, activeTabId]
  );

  /** Create a a new chat/tab with intro & quick actions */
  function createNewChat() {
    if (tabs.length >= maxChats) return;
    const id = Date.now();
    const intro: ChatMessage = {
      role: "bot",
      text: `👋 Neues Gespräch mit ${assistantName}. Womit darf ich helfen?`,
      suggestions: [
        { label: "🔎 Artikel suchen", href: undefined },
        { label: "📄 Letzte Artikel", href: undefined },
        { label: "❓ Hilfe", href: undefined },
      ],
      createdAt: Date.now(),
    };
    const newTab: ChatTab = {
      id,
      title: `Chat ${tabs.length + 1}`,
      messages: [intro],
      createdAt: id,
    };
    setTabs((s) => [...s, newTab]);
    setActiveTabId(id);
    setOpen(true);
  }

  /** Delete a specific chat */
  function deleteChat(id: number) {
    setTabs((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      if (remaining.length === 0) {
        // ensure at least one tab remains
        const nid = Date.now();
        const intro: ChatMessage = {
          role: "bot",
          text: `👋 ${assistantName} ist bereit.`,
          createdAt: Date.now(),
        };
        const base: ChatTab = { id: nid, title: "Chat 1", messages: [intro], createdAt: nid };
        setActiveTabId(nid);
        return [base];
      }
      if (activeTabId === id) setActiveTabId(remaining[0].id);
      return remaining;
    });
  }

  /** Clear all chats */
  function clearAllChats() {
    const id = Date.now();
    const intro: ChatMessage = {
      role: "bot",
      text: `👋 ${assistantName} wurde zurückgesetzt.`,
      createdAt: Date.now(),
    };
    const base: ChatTab = { id, title: "Chat 1", messages: [intro], createdAt: id };
    setTabs([base]);
    setActiveTabId(id);
  }

  /** Clear messages in a tab (reset to intro) */
  function clearTabMessages(tabId: number) {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === tabId
          ? {
              ...t,
              messages: [
                {
                  role: "bot",
                  text: `Chat zurückgesetzt. ${assistantName} ist bereit.`,
                  createdAt: Date.now(),
                },
              ],
            }
          : t
      )
    );
  }

  /** Handle suggestion actions (search / recent / help or custom) */
  function handleSuggestionAction(s: BotSuggestion) {
    const label = s.label.toLowerCase();
    if (label.includes("such") || label.includes("🔎") || label.includes("search")) {
      // open mini search: copy label into input (user can edit) and focus
      setInput("");
      setTimeout(() => {
        setInput("");
        inputRef.current?.focus();
      }, 50);
    } else if (label.includes("letzte") || label.includes("recent")) {
      // show recent pages from wikiPages if available
      const recent = (wikiPages ?? []).slice(0, 5).map((p) => ({
        id: p.id,
        label: p.name,
        href: `${basePathFor(wikiPages)}/${p.id}`,
      }));
      // push a bot message with suggestions linking to recent pages
      const botMsg: ChatMessage = {
        role: "bot",
        text: "Hier sind die letzten Seiten:",
        suggestions: recent,
        createdAt: Date.now(),
      };
      pushBotMessage(botMsg);
    } else {
      // help: show short help message
      const botMsg: ChatMessage = {
        role: "bot",
        text:
          "Tipps: 1) Nutze Schlüsselwörter (z.B. 'Urlaub beantragen'), 2) Klick Quick-Actions, 3) Strg/Cmd+K für neuen Chat.",
        createdAt: Date.now(),
      };
      pushBotMessage(botMsg);
    }
  }

  /** push bot message into active chat */
  function pushBotMessage(msg: ChatMessage) {
    if (!activeTabId) return;
    setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, messages: [...t.messages, msg] } : t)));
  }

  /** Send current input as user message, perform simple search & respond with suggestions */
  function sendInput() {
    const text = input.trim();
    if (!text || !activeTabId) return;

    const userMsg: ChatMessage = { role: "user", text, createdAt: Date.now() };
    setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, messages: [...t.messages, userMsg] } : t)));
    setInput("");

    // perform simple scoring/search on wikiPages
    if (wikiPages && wikiPages.length > 0) {
      const scored = wikiPages
        .map((p) => ({ id: p.id, name: p.name, score: scorePage(text, p) }))
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map((s) => ({ id: s.id, label: s.name, href: `${basePathFor(wikiPages)}/${s.id}`, score: s.score }));

      const botMsg: ChatMessage =
        scored.length > 0
          ? { role: "bot", text: `Ich habe ${scored.length} mögliche Treffer gefunden:`, suggestions: scored, createdAt: Date.now() }
          : { role: "bot", text: "Keine Treffer gefunden. Versuche andere Stichworte oder Quick-Actions.", createdAt: Date.now() };

      // push bot message
      setTimeout(() => pushBotMessage(botMsg), 200); // small delay for UX
    } else {
      // if no wikiPages, just echo suggestion placeholder
      const botMsg: ChatMessage = { role: "bot", text: "Suche ausgeführt (kein Index vorhanden).", createdAt: Date.now() };
      setTimeout(() => pushBotMessage(botMsg), 150);
    }
  }

  // helper for basePath when wikiPages present; fallback to "/wiki"
  function basePathFor(pages: WikiPage[]) {
    return basePath || "/wiki";
  }

  /** Export active chat as markdown */
  function exportActiveChatAsMarkdown() {
    if (!activeTab) return;
    const lines: string[] = [`# Chat – ${assistantName}`, `Titel: ${activeTab.title}`, `Datum: ${new Date(activeTab.createdAt).toLocaleString()}`, ""];
    for (const m of activeTab.messages) {
      if (m.role === "user") lines.push(`**Du:** ${m.text}`);
      else {
        lines.push(`**${assistantName}:** ${m.text}`);
        if (m.suggestions?.length) {
          lines.push("");
          lines.push(`Vorschläge:`);
          for (const s of m.suggestions) lines.push(`- ${s.label}${s.href ? ` (${s.href})` : ""}`);
        }
      }
    }
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${assistantName}_${activeTab.title.replace(/\s+/g, "_")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** If user clicks a suggestion link, open in new tab (external navigation) */
  function onSuggestionClick(s: BotSuggestion) {
    if (s.href) window.open(s.href, "_blank");
    else handleSuggestionAction(s);
  }

  // small UI helpers
  const recentUserQueries = useMemo(() => {
    // extract last user messages across active tab (limit 3)
    if (!activeTab) return [];
    const userMsgs = activeTab.messages.filter((m) => m.role === "user").slice(-3).reverse();
    return userMsgs.map((m) => m.text);
  }, [activeTab]);

  // render
  return (
    <div>
      {/* Floating Bubble */}
      {!open && (
        <button
          aria-label={`${assistantName} öffnen`}
          title={`${assistantName} öffnen`}
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-full shadow-lg"
        >
          <MessageCircle size={20} />
          <span className="text-sm font-medium">{assistantName}</span>
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[460px] h-[580px] bg-white border border-slate-300 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-100 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold">💡 {assistantName} – Dein Wiki-Guide</div>
              <div className="text-xs text-slate-500">Verwaltung</div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={exportActiveChatAsMarkdown} title="Exportieren" className="text-slate-600 hover:text-slate-900">
                <Download size={16} />
              </button>
              <button onClick={() => createNewChat()} title="Neuer Chat" className="text-slate-600 hover:text-slate-900">
                <Plus size={16} />
              </button>
              <button onClick={() => clearAllChats()} title="Alle Chats löschen" className="text-red-600 hover:text-red-800">
                <Trash2 size={16} />
              </button>
              <button onClick={() => setOpen(false)} title="Schließen" className="text-slate-600 hover:text-slate-900">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 items-center px-2 py-1 bg-slate-50 border-b border-slate-200 overflow-x-auto">
            {tabs.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveTabId(t.id)}
                className={`px-3 py-1 text-sm cursor-pointer select-none ${
                  activeTabId === t.id ? "bg-white border border-slate-300 rounded-md text-slate-900" : "text-slate-600 hover:bg-slate-50"
                }`}
                title={t.title}
              >
                <div className="flex items-center gap-2">
                  <span>{t.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(t.id);
                    }}
                    title="Tab löschen"
                    className="text-slate-400 hover:text-red-600 ml-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}

            {/* new chat button */}
            <div className="ml-auto">
              <button
                className="px-2 py-1 text-sm text-slate-600 hover:text-slate-900"
                onClick={createNewChat}
                disabled={tabs.length >= maxChats}
                title={tabs.length >= maxChats ? `Max ${maxChats} Chats` : "Neuer Chat"}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
            {activeTab ? (
              activeTab.messages.map((m, idx) => (
                <div key={idx} className={`mb-3 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`${m.role === "user" ? "bg-slate-700 text-white" : "bg-white border border-slate-200 text-slate-800"} px-3 py-2 rounded-md max-w-[84%]`}>
                    <div className="whitespace-pre-wrap text-sm">{m.text}</div>

                    {m.suggestions && m.suggestions.length > 0 && (
                      <div className="mt-2 flex flex-col gap-2">
                        {m.suggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => onSuggestionClick(s)}
                            className="text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-md text-sm"
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate">{s.label}</span>
                              {s.score !== undefined && <span className="text-xs text-slate-400 ml-2">#{s.score}</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-600">Kein aktiver Chat. Erstelle einen neuen Chat.</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions / recent */}
          <div className="px-3 py-2 border-t border-slate-200 bg-white">
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                onClick={() => {
                  setInput("Urlaub beantragen");
                  inputRef.current?.focus();
                }}
                className="px-2 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50"
              >
                Beispiel: Urlaub
              </button>
              <button
                onClick={() => {
                  setInput("Dienstreise Abrechnung");
                  inputRef.current?.focus();
                }}
                className="px-2 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50"
              >
                Beispiel: Dienstreise
              </button>
              <button
                onClick={() => {
                  setInput("Zeiterfassung Fehlzeit");
                  inputRef.current?.focus();
                }}
                className="px-2 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50"
              >
                Beispiel: Zeiterfassung
              </button>

              {/* recent pages from wikiPages prop */}
              {wikiPages && wikiPages.length > 0 && (
                <div className="ml-auto text-xs text-slate-500 self-center">Letzte Seiten:</div>
              )}
            </div>

            {wikiPages && wikiPages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {wikiPages.slice(0, 5).map((p) => (
                  <a
                    key={p.id}
                    href={`${basePathFor(wikiPages)}/${p.id}`}
                    className="px-2 py-1 border border-slate-200 rounded text-xs bg-white hover:bg-slate-50"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {p.name}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Input row */}
          <div className="px-3 py-2 border-t border-slate-200 bg-white flex gap-2 items-center">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendInput();
              }}
              className="flex-1 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300"
              placeholder={`Frag ${assistantName} (z. B. \"Urlaub beantragen\")`}
            />
            <button
              onClick={() => sendInput()}
              title="Senden"
              className="inline-flex items-center justify-center bg-slate-700 hover:bg-slate-800 text-white px-3 py-2 rounded"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
