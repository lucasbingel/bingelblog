// components/Artikel2/types.ts
export type EditorBlockType =
  | "heading"
  | "text"
  | "code"
  | "list"
  | "image"
  | "quote"
  | "video"
  | "divider";

export interface EditorBlock {
  language?: string;
  id: string;
  type: EditorBlockType;
  content: string; // je nach type: text, url, markdown-like list (zeilenweise), etc.
}
