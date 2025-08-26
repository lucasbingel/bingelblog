"use client";

import { useState, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import type { ArticleBlock } from "@/lib/articles";

export interface WikiPage {
  id: string;
  name: string;
  parentId?: string;
  children?: WikiPage[];
  content?: ArticleBlock[];
}

interface SidebarProps {
  onSelectPage: (page: WikiPage) => void;
}

interface SidebarItemProps {
  node: WikiPage;
  level: number;
  onSelectPage: (page: WikiPage) => void;
  addPage: (parentId?: string) => void;
  deletePage: (id: string) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  updatePageName: (id: string, name: string) => void;
}

const SidebarItem = ({
  node,
  level,
  onSelectPage,
  addPage,
  deletePage,
  editingId,
  setEditingId,
  updatePageName,
}: SidebarItemProps) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <li className="space-y-1">
      <div
        className="flex items-center gap-1 cursor-pointer"
        style={{ paddingLeft: level * 16 }}
      >
        {editingId === node.id ? (
          <input
            type="text"
            className="border rounded px-1 py-0.5 text-sm w-full"
            value={node.name}
            onChange={e => updatePageName(node.id, e.target.value)}
            onBlur={() => setEditingId(null)}
            autoFocus
          />
        ) : (
          <>
            {hasChildren && (
              <span
                className="select-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
              >
                {expanded ? "▾" : "▸"}
              </span>
            )}
            <span
              className="hover:bg-gray-200 p-1 rounded flex-1"
              onClick={() => onSelectPage(node)}
            >
              {node.name}
            </span>
            <button
              className="text-xs px-1 py-0.5 hover:bg-gray-300 rounded"
              onClick={() => addPage(node.id)}
            >
              ➕
            </button>
            <button
              className="text-xs px-1 py-0.5 hover:bg-red-200 rounded text-red-600"
              onClick={() => deletePage(node.id)}
            >
              🗑️
            </button>
          </>
        )}
      </div>

      {hasChildren && expanded && (
        <ul className="mt-1">
          {node.children!.map(child => (
            <SidebarItem
              key={child.id}
              node={child}
              level={level + 1}
              onSelectPage={onSelectPage}
              addPage={addPage}
              deletePage={deletePage}
              editingId={editingId}
              setEditingId={setEditingId}
              updatePageName={updatePageName}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default function Sidebar({ onSelectPage }: SidebarProps) {
  const [pages, setPages] = useState<WikiPage[]>([
    { id: "home", name: "🏠 Home", children: [], content: [] },
    {
      id: "chapter1",
      name: "📘 Kapitel 1",
      children: [
        { id: "1.1", name: "1.1 Einführung", parentId: "chapter1", children: [], content: [] },
        { id: "1.2", name: "1.2 Details", parentId: "chapter1", children: [], content: [] },
      ],
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const addPage = (parentId?: string) => {
    const newPage: WikiPage = { id: uuidv4(), name: "Neue Seite", parentId, children: [], content: [] };
    setPages(prev => {
      if (!parentId) return [...prev, newPage];

      const addChild = (nodes: WikiPage[]): WikiPage[] =>
        nodes.map(n => {
          if (n.id === parentId) {
            const children = n.children ? [...n.children, newPage] : [newPage];
            return { ...n, children };
          }
          if (n.children) return { ...n, children: addChild(n.children) };
          return n;
        });

      return addChild(prev);
    });

    setEditingId(newPage.id);
  };

  const updatePageName = (id: string, name: string) => {
    const updateName = (nodes: WikiPage[]): WikiPage[] =>
      nodes.map(n => {
        if (n.id === id) return { ...n, name };
        if (n.children) return { ...n, children: updateName(n.children) };
        return n;
      });
    setPages(prev => updateName(prev));
  };

  const deletePage = (id: string) => {
    const removePage = (nodes: WikiPage[]): WikiPage[] =>
      nodes
        .filter(n => n.id !== id)
        .map(n => (n.children ? { ...n, children: removePage(n.children) } : n));
    setPages(prev => removePage(prev));
  };

  const filteredPages = useMemo(() => {
    if (!searchTerm) return pages;

    const filterNodes = (nodes: WikiPage[]): WikiPage[] =>
      nodes
        .map(n => ({ ...n, children: n.children ? filterNodes(n.children) : undefined }))
        .filter(n => n.name.toLowerCase().includes(searchTerm.toLowerCase()) || (n.children && n.children.length > 0));

    return filterNodes(pages);
  }, [pages, searchTerm]);

  return (
    <div className="sticky top-0 h-screen flex flex-col w-72 bg-gray-100 border-r">
      <div className="flex items-center p-4 gap-2 border-b justify-between">
        <span className="font-bold text-lg">Wiki Pages</span>
        <button
          className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => addPage()}
        >
          ➕ Add Page
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-2 py-1 border rounded mb-4"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <ul className="space-y-2 text-sm">
          {filteredPages.map(node => (
            <SidebarItem
              key={node.id}
              node={node}
              level={0}
              onSelectPage={onSelectPage}
              addPage={addPage}
              deletePage={deletePage}
              editingId={editingId}
              setEditingId={setEditingId}
              updatePageName={updatePageName}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
