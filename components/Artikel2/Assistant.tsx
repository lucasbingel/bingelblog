// components/Artikel2/Assistant.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Plus, Trash2, Send, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LumiIcon from "../../public/images/Lumi.png"; // dein PNG
import ChatOnboarding from "./ChatOnboarding";


/**
 * Assistant (Lumi) — überarbeitete, kommentierte Version
 *
 * Features / Änderungen:
 * - Strukturierter durch //#region-Blöcke (gut in VS Code sichtbar)
 * - Verbesserte Suche: Token-Scoring + einfache Fuzzy (Levenshtein) für Tippfehler
 * - Index-Cache für schnellere Suche beim wiederholten Durchsuchen
 * - Rechte-/Referatsfilter: zeigt Treffer nur, wenn userRefs Zugriff hat; nicht-öffentliche Treffer werden angezeigt, aber als "kein Zugriff" markiert
 * - UI: kleine Verbesserungen (Badge für Referat, "Seite erstellen"-Vorschlag, Strg/Cmd+Enter sendet)
 * - Onboarding / Intro beim ersten Start
 * - Quick-Actions & Recent Queries
 * - Mehr und klarere Kommentare (was macht welcher Teil)
 */

/* =========================================
   Types / Interfaces
   ========================================= */

//#region Types
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
  parentId?: string; // interpretieren wir als "Referat / Abteilung" id
  meta?: {
    tags?: string[];
    visibility?: "public" | "internal" | "restricted";
    createdBy?: string;
  };
}
export interface BotSuggestion {
  id?: string;
  label: string;
  href?: string;
  score?: number;
  access?: boolean; // true wenn der aktuelle User Zugriff hat
  parentId?: string; // Referat Id wenn vorhanden
}
export interface ChatMessage {
  role: "user" | "bot";
  text: string;
  imageSrc?: string;           // optionales Bild
  imagePosition?: "top" | "left"; // Position des Bildes
  suggestions?: BotSuggestion[];
  suggestionColumns?: number; // hier 2 Spalten
  createdAt?: number;
}

export interface ChatTab {
  id: number;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
}
//#endregion

/* =========================================
   Props for the Assistant component
   ========================================= */

//#region Props
interface AssistantProps {
  wikiPages?: WikiPage[]; // wiki pages dynamic (user generated)
  assistantName?: string; // default "Lumi"
  maxChats?: number; // default 3
  basePath?: string; // url-prefix for wiki links
  userRefs?: string[]; // IDs of referate/Abteilungen the current user can access (for permissions)
}
//#endregion





/* =========================================
   Helper functions: scoring, fuzzy, index builder
   ========================================= */

//#region Search & Utility Functions

function levenshteinDistance(a: string, b: string) {
  const n = a.length;
  const m = b.length;
  if (n === 0) return m;
  if (m === 0) return n;
  const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[n][m];
}

function similarityFromDistance(a: string, b: string) {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const dist = levenshteinDistance(a, b);
  return 1 - dist / maxLen;
}

function scorePage(query: string, page: WikiPage) {
  const q = query.trim().toLowerCase();
  if (!q) return 0;
  const tokens = q.split(/\s+/).filter(Boolean);
  let score = 0;
  const title = (page.name || "").toLowerCase();

  for (const t of tokens) {
    if (title.includes(t)) score += 6;
    else {
      const sim = similarityFromDistance(t, title);
      if (sim > 0.6) score += Math.round(sim * 4);
    }
  }

  const maxBlocks = Math.min(200, page.content?.length ?? 0);
  for (let i = 0; i < maxBlocks; i++) {
    const b = page.content[i];
    const text = typeof b?.content === "string" ? b.content : JSON.stringify(b?.content ?? "");
    const lc = text.toLowerCase();
    for (const t of tokens) {
      if (lc.includes(t)) score += 1;
      else {
        const sim = similarityFromDistance(t, lc);
        if (sim > 0.7) score += 1;
      }
    }
  }

  if ((page.content?.length ?? 0) < 2) score *= 0.9;

  return score;
}

function buildIndex(pages: WikiPage[]) {
  return pages.map((p) => {
    const snippet = (p.content ?? [])
      .slice(0, 10)
      .map((b) => (typeof b?.content === "string" ? b.content : JSON.stringify(b?.content ?? "")))
      .join(" ");
    return {
      id: p.id,
      title: p.name ?? "",
      snippet,
      parentId: p.parentId,
      visibility: p.meta?.visibility ?? "public",
    };
  });
}
//#endregion

/* =========================================
   Main Assistant Component
   ========================================= */

//#region Component
export default function Assistant({
  wikiPages = [],
  assistantName = "Lumi",
  maxChats = 3,
  basePath = "/wiki",
  userRefs = [],
}: AssistantProps) {
  //#region State
  const [open, setOpen] = useState(false);
  const [tabs, setTabs] = useState<ChatTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
const chatWindowRef = useRef<HTMLDivElement | null>(null);


  //#endregion

  //#region Derived / Memoized values
  const index = useMemo(() => buildIndex(wikiPages), [wikiPages]);
  const activeTab = useMemo(() => tabs.find((t) => t.id === activeTabId) ?? null, [tabs, activeTabId]);
  const recentUserQueries = useMemo(() => {
    if (!activeTab) return [];
    const userMsgs = activeTab.messages.filter((m) => m.role === "user").slice(-4).reverse();
    return userMsgs.map((m) => m.text);
  }, [activeTab]);
  //#endregion

  //#region Onboarding
  const sendButtonRef = useRef<HTMLInputElement | null>(null);
  const newChatButtonRef = useRef<HTMLInputElement | null>(null);
const [showOnboarding, setShowOnboarding] = useState(true); // <-- NEU
const exportRef = useRef<HTMLButtonElement | null>(null);
const newChatRef = useRef<HTMLButtonElement | null>(null);
const clearAllRef = useRef<HTMLButtonElement | null>(null);
const closeRef = useRef<HTMLButtonElement | null>(null);


  //#endregion

//#region Close window Outside
useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (chatWindowRef.current && !chatWindowRef.current.contains(event.target as Node)) {
      setOpen(false); // schließt das Chat-Fenster
    }
  }

  if (open) {
    document.addEventListener("mousedown", handleClickOutside);
  } else {
    document.removeEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [open]);

//#endregion

  //#region Lifecycle effects
useEffect(() => {
  if (tabs.length === 0) {
    const id = Date.now();

    // Erste Nachricht mit Bild + Begrüßung (kein Chat-Block)
    // const welcomeMessage: ChatMessage = {
    //   role: "bot",
    //   text: "Hi, ich bin Lumi!",
    //   imageSrc: LumiIcon.src, // hier dein Bild
    //   createdAt: Date.now(),
    // };

    // Erste „richtige“ Bot-Nachricht
    const introMessage: ChatMessage = {
      role: "bot",
      text: `Hallo — ich bin ${assistantName}. Frag mich nach Prozessen, Formularen oder Richtlinien. Du kannst auch Quick-Actions nutzen.`,
      imageSrc: LumiIcon.src, // hier dein Bild
      imagePosition: "left",
      suggestionColumns: 2, // hier 2 Spalten
      suggestions: [
        { label: "🔎 Artikel suchen", href: undefined },
        { label: "📄 Letzte Artikel", href: undefined },
        { label: "❓ Support kontaktieren", href: undefined },
        { label: "❓ Favoriten anzeigen", href: undefined },
        { label: "❓ Datenschutzrichtlinien", href: undefined },
        { label: "❓ Hilfe", href: undefined }
      ],
      createdAt: Date.now() + 1, // damit Reihenfolge korrekt bleibt
    };

    const firstTab: ChatTab = {
      id,
      title: "Chat 1",
      // messages: [welcomeMessage, introMessage],
      messages: [introMessage],
      createdAt: id,
    };

    setTabs([firstTab]);
    setActiveTabId(id);
  }
}, []);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tabs, activeTabId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        createNewChat();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        sendInput();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tabs, input, activeTabId]);
  //#endregion

  //#region Chat management
  function createNewChat() {
    if (tabs.length >= maxChats) return;
    const id = Date.now();
    const intro: ChatMessage = {
      role: "bot",
      text: `Neues Gespräch mit ${assistantName}. Womit darf ich helfen?`,
      imageSrc: LumiIcon.src, // hier dein Bild
      imagePosition: "left",
      suggestionColumns:2,
      suggestions: [
        { label: "🔎 Artikel suchen", href: undefined },
        { label: "📄 Letzte Artikel", href: undefined },
        { label: "❓ Support kontaktieren", href: undefined },
        { label: "❓ Favoriten anzeigen", href: undefined },
        { label: "❓ Datenschutzrichtlinien", href: undefined },
        { label: "❓ Hilfe", href: undefined }
      ],
      createdAt: Date.now(),
    };
    const newTab: ChatTab = { id, title: `Chat ${tabs.length + 1}`, messages: [intro], createdAt: id };
    setTabs((s) => [...s, newTab]);
    setActiveTabId(id);
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function deleteChat(id: number) {
    setTabs((prev) => {
      const remaining = prev.filter((p) => p.id !== id);
      if (remaining.length === 0) {
        const nid = Date.now();
        const intro: ChatMessage = {
          role: "bot",
          text: `${assistantName} ist bereit.`,
          imageSrc: LumiIcon.src, // hier dein Bild
      imagePosition: "left",
            suggestionColumns:2,
      suggestions: [
        { label: "🔎 Artikel suchen", href: undefined },
        { label: "📄 Letzte Artikel", href: undefined },
        { label: "❓ Support kontaktieren", href: undefined },
        { label: "❓ Favoriten anzeigen", href: undefined },
        { label: "❓ Datenschutzrichtlinien", href: undefined },
        { label: "❓ Hilfe", href: undefined }
      ],
          createdAt: Date.now(),
        };
        setActiveTabId(nid);
        return [{ id: nid, title: "Chat 1", messages: [intro], createdAt: nid }];
      }
      if (activeTabId === id) setActiveTabId(remaining[0].id);
      return remaining;
    });
  }

  function clearAllChats() {
    const id = Date.now();
    const intro: ChatMessage = {
      role: "bot",
      text: `${assistantName} wurde zurückgesetzt.`,
      imageSrc: LumiIcon.src, // hier dein Bild
      imagePosition: "left",
      createdAt: Date.now(),
    };
    const base: ChatTab = { id, title: "Chat 1", messages: [intro], createdAt: id };
    setTabs([base]);
    setActiveTabId(id);
  }

  //#endregion

  //#region Messaging helpers
  function pushBotMessage(msg: ChatMessage) {
    if (!activeTabId) return;
    setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, messages: [...t.messages, msg] } : t)));
  }
  //#endregion

  //#region Suggestion handling & click behavior
  function basePathFor(_pages: WikiPage[]) {
    return basePath || "/wiki";
  }

  function handleSuggestionAction(s: BotSuggestion) {
    const label = s.label.toLowerCase();
    if (label.includes("such") || label.includes("🔎") || label.includes("search")) {
      setInput("");
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }
    if (label.includes("letzte") || label.includes("recent")) {
      const recent = (wikiPages ?? [])
        .slice(0, 5)
        .map((p) => ({ id: p.id, label: p.name, href: `${basePathFor(wikiPages)}/${p.id}`, parentId: p.parentId }));
      const botMsg: ChatMessage = { role: "bot", text: "Hier sind die letzten Seiten:", suggestions: recent, createdAt: Date.now() };
      pushBotMessage(botMsg);
      return;
    }
    const botMsg: ChatMessage = {
      role: "bot",
      text:
        "Tipps: 1) Nutze Schlüsselwörter (z.B. 'Urlaub beantragen'), 2) Klick Quick-Actions, 3) Strg/Cmd+K für neuen Chat. Bei Tippfehlern versuche es mit ähnlichen Wörtern — Lumi schlägt fuzzy Treffer vor.",
      createdAt: Date.now(),
    };
    pushBotMessage(botMsg);
  }

  function onSuggestionClick(s: BotSuggestion) {
    if (s.href) {
      window.open(s.href, "_blank");
    } else {
      handleSuggestionAction(s);
    }
  }
  //#endregion

  //#region Input send & search logic
  function sendInput() {
    const text = input.trim();
    if (!text || !activeTabId) return;

    const userMsg: ChatMessage = { role: "user", text, createdAt: Date.now() };
    setTabs((prev) => prev.map((t) => (t.id === activeTabId ? { ...t, messages: [...t.messages, userMsg] } : t)));
    setInput("");

    if (wikiPages && wikiPages.length > 0) {
      const scored = wikiPages
        .map((p) => ({ p, score: scorePage(text, p) }))
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((s) => {
          const access = !s.p.parentId || userRefs.length === 0 || userRefs.includes(s.p.parentId);
          return {
            id: s.p.id,
            label: s.p.name,
            href: `${basePathFor(wikiPages)}/${s.p.id}`,
            score: Math.round(s.score * 10) / 10,
            access,
            parentId: s.p.parentId,
          } as BotSuggestion;
        });

      let finalSuggestions = scored;
      if (finalSuggestions.length === 0) {
        const fuzzy = wikiPages
          .map((p) => ({
            p,
            sim: similarityFromDistance(text.toLowerCase(), (p.name || "").toLowerCase()),
          }))
          .filter((s) => s.sim > 0.45)
          .sort((a, b) => b.sim - a.sim)
          .slice(0, 6)
          .map((s) => ({
            id: s.p.id,
            label: s.p.name,
            href: `${basePathFor(wikiPages)}/${s.p.id}`,
            score: Math.round(s.sim * 100) / 10,
            access: !s.p.parentId || userRefs.length === 0 || userRefs.includes(s.p.parentId),
            parentId: s.p.parentId,
          }));
        finalSuggestions = fuzzy;
      }

      const botMsg: ChatMessage =
        finalSuggestions.length > 0
          ? {
              role: "bot",
              text: `Ich habe ${finalSuggestions.length} mögliche Treffer gefunden:`,
              suggestions: finalSuggestions,
              createdAt: Date.now(),
            }
          : {
              role: "bot",
              text:
                "Keine Treffer gefunden. Du kannst eine neue Seite erstellen oder andere Stichworte versuchen. Vorschlag: 'Seite erstellen: <Titel>'",
              suggestions: [
                { label: `Seite erstellen: "${text}"`, href: `${basePathFor(wikiPages)}/create?title=${encodeURIComponent(text)}` },
              ],
              createdAt: Date.now(),
            };

      setTimeout(() => pushBotMessage(botMsg), 150);
    } else {
      const botMsg: ChatMessage = { role: "bot", text: "Suche ausgeführt (kein Index vorhanden).", createdAt: Date.now() };
      setTimeout(() => pushBotMessage(botMsg), 120);
    }
  }
  //#endregion

  //#region Export chat as markdown
  function exportActiveChatAsMarkdown() {
    if (!activeTab) return;
    const lines: string[] = [
      `# Chat – ${assistantName}`,
      `Titel: ${activeTab.title}`,
      `Datum: ${new Date(activeTab.createdAt).toLocaleString()}`,
      "",
    ];
    for (const m of activeTab.messages) {
      if (m.role === "user") lines.push(`**Du:** ${m.text}`);
      else {
        lines.push(`**${assistantName}:** ${m.text}`);
        if (m.suggestions?.length) {
          lines.push("");
          lines.push(`Vorschläge:`);
          for (const s of m.suggestions) lines.push(`- ${s.label}${s.href ? ` (${s.href})` : ""}${s.access === false ? " [kein Zugriff]" : ""}`);
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
  //#endregion

  /* =========================================
     Render UI
     ========================================= */

return (
  <div ref={chatWindowRef}>
    {/* Overlay + Chat Window */}
    {open && (
      <div
        className="fixed inset-0 backdrop-blur-[2px] bg-white/40 z-40 cursor-pointer"
        onClick={() => setOpen(false)} // Klick auf Overlay = schließen
      >
      
      {/* Hinweis-Text */}
      <div className="absolute top-1/2 left-0 right-[560px] 
                mx-auto -translate-y-1/2 
                text-gray-500 text-sm font-normal italic 
                pointer-events-none select-none 
                bg-gray-100 bg-opacity-30 px-2 py-1 rounded 
                text-center">
  Zum Schließen außerhalb klicken.
</div>




        {/* Chat Window */}
        <div
          className="fixed bottom-6 right-6 z-50 w-[520px] h-[640px] bg-white border border-slate-300 shadow-2xl flex flex-col pointer-events-auto cursor-default"
          onClick={(e) => e.stopPropagation()} // Klick im Fenster blockiert Close
        >
          {/* ChatOnboarding Overlay */}
          {showOnboarding && (
            <ChatOnboarding
              inputRef={inputRef}
              exportButtonRef={exportRef}
              newChatButtonRef={newChatRef}
              clearAllButtonRef={clearAllRef}
              closeButtonRef={closeRef}
              onFinish={() => setShowOnboarding(false)}
            />
          )}

          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-100 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold">
                {assistantName} – Dein Wiki-Guide
              </div>
              <div className="text-xs text-slate-500">Verwaltung</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                ref={exportRef}
                onClick={exportActiveChatAsMarkdown}
                title="Exportieren"
                className="text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <Download size={16} />
              </button>
              <button
                ref={newChatRef}
                onClick={() => createNewChat()}
                title="Neuer Chat"
                className="text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <Plus size={16} />
              </button>
              <button
                ref={clearAllRef}
                onClick={() => clearAllChats()}
                title="Alle Chats löschen"
                className="text-red-600 hover:text-red-800 cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
              <button
                ref={closeRef}
                onClick={() => setOpen(false)}
                title="Schließen"
                className="text-slate-600 hover:text-slate-900 cursor-pointer"
              >
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
                  activeTabId === t.id
                    ? "bg-white border border-slate-300 rounded-md text-slate-900"
                    : "text-slate-600 hover:bg-slate-50"
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
                    className="text-slate-400 hover:text-red-600 ml-1 cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ))}

            {/* new chat button */}
            <div className="ml-auto">
              <button
                className="px-2 py-1 text-sm text-slate-600 hover:text-slate-900 cursor-pointer"
                onClick={createNewChat}
                disabled={tabs.length >= maxChats}
                title={
                  tabs.length >= maxChats ? `Max ${maxChats} Chats` : "Neuer Chat"
                }
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 relative">
            {activeTab ? (
              activeTab.messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`mb-3 flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`${
                      m.role === "user"
                        ? "bg-slate-700 text-white"
                        : "bg-white border border-slate-200 text-slate-800"
                    } px-3 py-2 rounded-md max-w-[84%]`}
                  >
                    {/* Container für Bild + Text */}
                    <div
                      className={`${
                        m.imageSrc && m.imagePosition === "left"
                          ? "flex gap-3 items-center"
                          : "flex flex-col"
                      }`}
                    >
                      {/* Bild links */}
                      {m.imageSrc && m.imagePosition === "left" && (
                        <img
                          src={m.imageSrc}
                          alt="Bild"
                          className="w-20 h-20 rounded-full flex-shrink-0"
                        />
                      )}

                      {/* Bild oben */}
                      {m.imageSrc && m.imagePosition === "top" && (
                        <img
                          src={m.imageSrc}
                          alt="Bild"
                          className="w-32 h-32 mb-2 rounded-full self-center"
                        />
                      )}

                      {/* Text */}
                      <div className="whitespace-pre-wrap text-sm">
                        {m.text}
                      </div>
                    </div>

                    {/* Suggestions */}
                    {m.suggestions && m.suggestions.length > 0 && (
                      <div
                        className="mt-2 grid gap-2"
                        style={{
                          gridTemplateColumns: `repeat(${
                            m.suggestionColumns ?? 1
                          }, minmax(0, 1fr))`,
                        }}
                      >
                        {m.suggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => onSuggestionClick(s)}
                            className={`text-left flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-md text-sm cursor-pointer ${
                              s.access === false
                                ? "opacity-60 pointer-events-auto"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="min-w-[100px] truncate">
                                {s.label}
                              </div>
                              {s.parentId && (
                                <div className="text-xs px-2 py-0.5 rounded bg-slate-100 border text-slate-600">
                                  {s.parentId}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {s.score !== undefined && (
                                <span className="text-xs text-slate-400 ml-2">
                                  #{s.score}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-600">
                Kein aktiver Chat. Erstelle einen neuen Chat.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions / recent */}
          <div className="px-3 py-2 border-t border-slate-200 bg-white">
            <div className="flex flex-wrap gap-2 mb-2 items-center">
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

              {wikiPages && wikiPages.length > 0 && (
                <div className="ml-auto text-xs text-slate-500 self-center">
                  Letzte Seiten:
                </div>
              )}
            </div>

            {wikiPages && wikiPages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {wikiPages.slice(0, 5).map((p) => {
                  const access =
                    !p.parentId ||
                    userRefs.length === 0 ||
                    userRefs.includes(p.parentId);
                  return (
                    <a
                      key={p.id}
                      href={`${basePathFor(wikiPages)}/${p.id}`}
                      className={`px-2 py-1 border border-slate-200 rounded text-xs bg-white hover:bg-slate-50 ${
                        !access ? "opacity-60" : ""
                      }`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {p.name}
                    </a>
                  );
                })}
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
                if (e.key === "Enter" && !(e.ctrlKey || e.metaKey)) {
                  sendInput();
                }
              }}
              className="flex-1 border border-slate-200 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-300"
              placeholder={`Frag ${assistantName} (z. B. "Urlaub beantragen")  — Strg/Cmd+Enter für Senden`}
            />

            <div className="hidden sm:flex gap-1 mr-2">
              {recentUserQueries.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(q);
                    inputRef.current?.focus();
                  }}
                  className="text-xs px-2 py-1 border border-slate-200 rounded hover:bg-slate-50 cursor-pointer"
                >
                  {q.length > 14 ? q.slice(0, 14) + "…" : q}
                </button>
              ))}
            </div>

            <button
              onClick={() => sendInput()}
              title="Senden"
              className="inline-flex items-center justify-center bg-slate-700 hover:bg-slate-800 text-white px-3 py-2 rounded cursor-pointer"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Floating Bubble */}
    {!open && (
      <button
        aria-label={`${assistantName} öffnen`}
        title={`${assistantName} öffnen`}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-full shadow-lg cursor-pointer"
      >
        <MessageCircle size={20} />
        <span className="text-sm font-medium">{assistantName}</span>
      </button>
    )}
  </div>
);

// Setze showOnboarding direkt nach dem Öffnen des Fensters
useEffect(() => {
  if (open) setShowOnboarding(true);
}, [open]);

}
