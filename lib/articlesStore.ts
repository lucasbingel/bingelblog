"use client";

export interface Article {
  id: string;
  name: string;
  creator: string;
  views: number;
  content: string;
}

let articles: Record<string, Article> = {
  R70A21: {
    id: "R70A21",
    name: "Erster Artikel",
    creator: "Admin",
    views: 123,
    content: "## Hallo Welt\n\n```js\nconsole.log('Hi');\n```",
  },
};

export function getArticleById(id: string): Article | null {
  return articles[id] ?? null;
}

export function updateArticle(id: string, content: string): Article | null {
  if (!articles[id]) return null;
  articles[id].content = content;
  return articles[id];
}
