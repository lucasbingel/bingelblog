// lib/wikipages.ts
import type { EditorBlock } from "@/components/Artikel2/types";

export interface WikiPageRaw {
  id: string;
  name: string;
  parentId?: string;
  children?: WikiPageRaw[];
  content: string; // JSON-String
}

export interface WikiPage {
  id: string;
  name: string;
  parentId?: string;
  children?: WikiPage[];
  content: EditorBlock[]; // Parsed
}

// --- Lokale DB (simuliert)
let wikiPages: WikiPageRaw[] = [];

// --- Adapter: raw -> typed
export function parseWikiPage(raw: WikiPageRaw): WikiPage {
  const children = raw.children?.map(parseWikiPage) || [];
  let content: EditorBlock[] = [];
  try {
    content = JSON.parse(raw.content) as EditorBlock[];
  } catch {}
  return { ...raw, children, content };
}

export function serializeWikiPage(page: WikiPage): WikiPageRaw {
  const children = page.children?.map(serializeWikiPage) || [];
  return { ...page, children, content: JSON.stringify(page.content || []) };
}

// --- CRUD
export function getWikiArticles(): WikiPage[] {
  return wikiPages.map(parseWikiPage);
}

export function getWikiArticleById(id: string): WikiPage | undefined {
  const raw = wikiPages.find(p => p.id === id);
  if (!raw) return undefined;
  return parseWikiPage(raw);
}

export function createWikiArticle(id: string): WikiPage {
  const newPage: WikiPage = {
    id,
    name: "Neue Seite",
    content: [],
    children: [],
  };
  wikiPages.push(serializeWikiPage(newPage));
  return newPage;
}

export function saveWikiArticle(page: WikiPage) {
  const raw = serializeWikiPage(page);
  const index = wikiPages.findIndex(p => p.id === page.id);
  if (index >= 0) wikiPages[index] = raw;
  else wikiPages.push(raw);
}
