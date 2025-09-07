"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface TocSidebarProps {
  headings: { id: string; text: string; index: number }[];
  virtuosoRef: React.RefObject<any>; // Virtuoso Ref für Scroll
}

export default function TocSidebar({ headings, virtuosoRef }: TocSidebarProps) {
  const [open, setOpen] = useState(false); // Sidebar standardmäßig zu
  const [search, setSearch] = useState(""); // Suchfeld

  // Scroll zu ausgewähltem Heading
  const handleClick = (heading: { id: string; text: string; index: number }) => {
    if (virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({ index: heading.index, align: "start", behavior: "smooth" });
    }
  };

  // Gefilterte Headings basierend auf Suchtext
  const filteredHeadings = useMemo(() => {
    if (!search) return headings;
    return headings.filter(h => h.text.toLowerCase().includes(search.toLowerCase()));
  }, [search, headings]);

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white shadow-lg rounded-l-lg`}
      style={{ width: open ? 260 : 0, zIndex: 50 }}
    >
      {/* Toggle Button */}
      <div
        className="absolute -left-7 top-1/2 -translate-y-1/2 bg-slate-600 rounded-lg p-2 cursor-pointer shadow-lg flex items-center justify-center"
        onClick={() => setOpen(!open)}
      >
        {open ? <ChevronRight size={20} color="white" /> : <ChevronLeft size={20} color="white" />}
      </div>

      {open && (
        <div className="h-full flex flex-col">
          {/* Überschrift TOC */}
          <h3 className="sticky top-0 bg-white z-10 font-semibold mb-0 py-2 px-4">
            Inhaltsverzeichnis
          </h3>

          {/* Suchleiste */}
          <div className="sticky top-12 bg-white z-10 px-4 pb-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Suche Überschriften..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* Liste gefilterter Headings */}
          <ul className="overflow-y-auto flex-1 px-4 space-y-1 mt-2">
            {filteredHeadings.map((h) => (
              <li
                key={h.id}
                className="cursor-pointer text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md p-1 transition-colors"
                onClick={() => handleClick(h)}
              >
                {h.text}
              </li>
            ))}
            {filteredHeadings.length === 0 && (
              <li className="text-gray-400 text-sm italic">Keine Überschriften gefunden</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
