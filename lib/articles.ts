import { ReactNode } from "react";

export type ArticleBlock = {
  id: string;
  type: "text" | "heading" | "code" | "image" | "list";
  content: string;
};

export type Article = {
  category: ReactNode;
  description: ReactNode;
  lastUpdate: ReactNode;
  tag: ReactNode;
  id: string;
  name: string;
  content: string; // JSON-String von ArticleBlock[]
  creator: string;
  views: number;
};

let articles: Record<string, Article> = {
  R70A21: {
    id: "R70A21",
    name: "Erster Artikel",
    creator: "Admin",
    views: 123,
    content: JSON.stringify([
      { id: "1", type: "heading", content: "Hallo Welt" },
      { id: "2", type: "text", content: "Dies ist ein Beispielartikel." },
      { id: "3", type: "code", content: "console.log('Hallo Welt');" },
    ]),
    category: undefined,
    description: undefined,
    lastUpdate: undefined,
    tag: undefined
  },
  R70A22: {
    id: "R70A22",
    name: "zweiter Artikel",
    creator: "Admin",
    views: 35545,
    content: JSON.stringify([
      { id: "1", type: "heading", content: "Hallo Welt2" },
      { id: "2", type: "text", content: "Dies ist ein Beispielartikel 2." },
      { id: "3", type: "code", content: "console.log('Hallo Welt');" },
      { id: "4", type: "heading", content: "Hallo Welt2" },
      { id: "5", type: "text", content: "Dies ist ein Beispielartikel 2." },
      { id: "6", type: "code", content: "console.log('Hallo Welt');" },
    ]),
    category: undefined,
    description: "testdescripton",
    lastUpdate: "01.12.2025",
    tag: "Info"
  },
};

export function getArticles(): Article[] {
  return Object.values(articles);
}

export function getArticleById(id: string): Article | null {
  return articles[id] ?? null;
}

export function updateArticle(id: string, newContent: string): Article | null {
  if (!articles[id]) return null;
  articles[id].content = newContent;
  return articles[id];
}
