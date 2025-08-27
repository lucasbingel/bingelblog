"use client";

import { useRef, useState } from "react";

interface Props {
  onUpload: (files: FileList | null) => void;
}

export default function DocumentUpload({ onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    onUpload(e.dataTransfer.files);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition 
        ${isDragging ? "bg-blue-50 border-blue-400" : "border-gray-300 hover:border-blue-400"}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        ref={inputRef}
        className="hidden"
        onChange={(e) => onUpload(e.target.files)}
      />
      <p className="text-gray-600">
        📂 Dateien hierher ziehen oder klicken, um hochzuladen
      </p>
    </div>
  );
}
