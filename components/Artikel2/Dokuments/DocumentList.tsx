"use client";

import { DocumentItem } from "@/hooks/useDocuments";

interface Props {
  documents: DocumentItem[];
  onDelete: (id: string) => void;
}

export default function DocumentList({ documents, onDelete }: Props) {
  if (documents.length === 0) {
    return <p className="text-gray-500">Noch keine Dokumente hochgeladen.</p>;
  }

  return (
    <ul className="divide-y divide-gray-200 border rounded-lg">
      {documents.map((doc) => (
        <li key={doc.id} className="flex justify-between items-center px-4 py-2">
          <a
            href={doc.url}
            target="_blank"
            className="text-blue-600 hover:underline"
          >
            {doc.name}
          </a>
          <button
            onClick={() => onDelete(doc.id)}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            🗑️ Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
