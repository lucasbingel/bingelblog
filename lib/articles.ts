import { ReactNode } from "react";

export type ArticleBlock = {
  id: string;
  type: "text" | "heading" | "code" | "image" | "list" | "quote" | "video" | "divider";
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
      { id: "4", type: "quote", content: "Dies ist ein Zitat." },
      { id: "5", type: "divider", content: "" },
      { id: "6", type: "video", content: "https://www.youtube.com/watch?v=HEfUVf0nn8g" }
    ]),
    category: undefined,
    description: undefined,
    lastUpdate: undefined,
    tag: undefined
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
