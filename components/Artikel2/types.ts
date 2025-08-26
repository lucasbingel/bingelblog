// Pfad: components/Artikel2/types.ts

// components/Artikel2/types.ts
export type EditorBlockType =
  | "text"
  | "heading"
  | "code"
  | "list"
  | "image"
  | "video"
  | "quote"
  | "divider"
  | "table"
  | "section"
  | "collapsible"
  | "link"
  | "chart"
  | "template"
  | "media"
  | "alert"
  | "faq"
  | "datetime"
  | "author"
  | "autoNumber"
  | "externalAPI"
  | "attachment"
  | "googlemaps"
  | "multiColumn"
  | "todo";


export interface EditorBlock {
  id: string;
  type: EditorBlockType;
  content: any; // string | string[][] | object etc.
  language?: string;
  children?: EditorBlock[];
  level?: "info" | "error"; // alert
}


export interface WikiPage {
  id: string;
  name: string;
  content: EditorBlock[];
  parentId?: string;
  children?: WikiPage[];
}
