"use client";

import { useState } from "react";

export default function Sidebar() {
  const [open, setOpen] = useState(true);

  return (
    <aside
      className={`bg-gray-100 border-r ${
        open ? "w-72" : "w-20"
      } h-[calc(100vh-64px)] flex-shrink-0 transition-all duration-300 sticky top-[64px]`}
    >
      {/* Header */}
      <div className="flex items-center p-4 gap-2 border-b">
        <img src="/images/Lucas.jpg" alt="Logo" className="w-8 h-8" />
        {open && <span className="font-bold text-lg">Wiki Pages</span>}
        <button className="ml-auto" onClick={() => setOpen(!open)}>
          ☰
        </button>
      </div>

      {/* Content */}
      {open && (
        <div className="p-4 overflow-auto h-[calc(100%-64px)]">
          <input
            type="text"
            placeholder="Search..."
            className="w-full px-2 py-1 border rounded mb-4"
          />
          <ul className="space-y-2 text-sm">
            <li>Home</li>
            <li>
              Kapitel 1
              <ul className="ml-4 space-y-1">
                <li>1.1</li>
                <li>1.2</li>
              </ul>
            </li>
          </ul>
        </div>
      )}
    </aside>
  );
}
