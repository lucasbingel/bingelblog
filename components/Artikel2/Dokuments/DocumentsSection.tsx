"use client";

import { useDocuments } from "@/hooks/useDocuments";
import DocumentUpload from "./DocumentUpload";
import DocumentList from "./DocumentList";

export default function DocumentSection() {
  const { documents, handleUpload, deleteDoc } = useDocuments([
    { id: "1", name: "Projektplan.pdf", url: "/docs/projektplan.pdf" },
    { id: "2", name: "Notizen.docx", url: "/docs/notizen.docx" },
  ]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">📂 Documents</h2>

      {/* Upload Feld */}
      <div className="mb-4">
        <DocumentUpload onUpload={handleUpload} />
      </div>

      {/* Liste */}
      <DocumentList documents={documents} onDelete={deleteDoc} />
    </div>
  );
}
