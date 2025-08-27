"use client";

import { useState } from "react";
import { generateUUID } from "@/app/utils/uuid";

export interface DocumentItem {
  id: string;
  name: string;
  url: string;
}

export function useDocuments(initialDocs: DocumentItem[] = []) {
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocs);

  const handleUpload = (files: FileList | null) => {
    if (!files) return;
    const newDocs: DocumentItem[] = Array.from(files).map((file) => ({
      id: generateUUID(),
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setDocuments((prev: DocumentItem[]) => [...prev, ...newDocs]);
  };

  const deleteDoc = (id: string) => {
    setDocuments((prev: DocumentItem[]) => prev.filter((d) => d.id !== id));
  };

  return { documents, handleUpload, deleteDoc };
}
