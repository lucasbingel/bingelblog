// components/Artikel2/blockFactory.ts
import type { EditorBlock, EditorBlockType } from "./types";

const id = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const defaultContentFor = (type: EditorBlockType): string => {
  switch (type) {
    case "heading":
      return "Neue Überschrift";
    case "text":
      return "Neuer Absatz …";
    case "code":
      return "console.log('Hello');";
    case "list":
      return "Listenpunkt 1\nListenpunkt 2";
    case "image":
      return "https://placehold.co/800x400";
    case "quote":
      return "Dies ist ein Zitat.";
    case "video":
      return "https://www.youtube.com/embed/dQw4w9WgXcQ";
    case "divider":
      return "";
  }
};

export const makeBlock = (type: EditorBlockType): EditorBlock => ({
  id: id(),
  type,
  content: defaultContentFor(type),
});
