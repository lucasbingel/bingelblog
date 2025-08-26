// components/Artikel2/EditorToolbar.tsx
"use client";

import {
  Save,
  X,
  Heading,
  Type,
  Code,
  List,
  Image,
  Quote,
  Video,
  Divide,
  Table,
  Layers,
  Link as LinkIcon,
  FileText,
  BarChart,
  Activity,
  ChevronDown,
  AlertCircle,
  Info,
  Sun,
  Moon,
  Clock,
  User,
  Calendar
} from "lucide-react";
import { useState, useRef, JSX, useEffect } from "react";
import type { EditorBlockType } from "./types";

interface Props {
  onAdd: (type: EditorBlockType, option?: string) => void;
  onSave: () => void;
  onCancel?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}

interface DropdownItem {
  label: string;
  option?: string;
  icon?: JSX.Element;
  type: EditorBlockType;
  preview?: JSX.Element;
}

// --- Vorschau-Komponenten
const previewBox = (text: string) => (
  <div className="p-2 text-xs text-gray-600 border rounded bg-gray-50 w-40">{text}</div>
);

// --- Items
const basicItems: DropdownItem[] = [
  { type: "text", label: "Text", icon: <Type className="w-4 h-4" />, preview: previewBox("Simple Text") },
  { type: "list", label: "List", icon: <List className="w-4 h-4" />, preview: previewBox("Bullet or Numbered List") },
  { type: "quote", label: "Quote", icon: <Quote className="w-4 h-4" />, preview: previewBox("Quote Block") },
  { type: "todo", label: "ToDo / Checkbox", icon: <List className="w-4 h-4" />, preview: previewBox("☐ Task 1\n☐ Task 2") },
];

const headerSizes: DropdownItem[] = [
  { type: "heading", label: "H1", option: "h1", icon: <Heading className="w-4 h-4" />, preview: previewBox("H1 Preview") },
  { type: "heading", label: "H2", option: "h2", icon: <Heading className="w-4 h-4" />, preview: previewBox("H2 Preview") },
  { type: "heading", label: "H3", option: "h3", icon: <Heading className="w-4 h-4" />, preview: previewBox("H3 Preview") },
];

const codeLanguages: DropdownItem[] = [
  { type: "code", label: "JS", option: "javascript", icon: <Code className="w-4 h-4" />, preview: previewBox("JS Code") },
  { type: "code", label: "TS", option: "typescript", icon: <Code className="w-4 h-4" />, preview: previewBox("TS Code") },
  { type: "code", label: "Python", option: "python", icon: <Code className="w-4 h-4" />, preview: previewBox("Python Code") },
];

const tableFormats: DropdownItem[] = [
  { type: "table", label: "1x2", option: "1x2", icon: <Table className="w-4 h-4" />, preview: previewBox("1x2 Table") },
  { type: "table", label: "2x2", option: "2x2", icon: <Table className="w-4 h-4" />, preview: previewBox("2x2 Table") },
];

const sections: DropdownItem[] = [
  { type: "section", label: "Section", icon: <Layers className="w-4 h-4" />, preview: previewBox("Section Container") },
  { type: "collapsible", label: "Collapsible", icon: <Layers className="w-4 h-4" />, preview: previewBox("Accordion / Collapsible Block") },
  { type: "multiColumn", label: "2 Column Layout", icon: <Layers className="w-4 h-4" />, preview: previewBox("Two Columns") },
];

const dividers: DropdownItem[] = [
  { type: "divider", label: "Line", option: "line", icon: <Divide className="w-4 h-4" />, preview: previewBox("--- Line") },
  { type: "divider", label: "Spacer", option: "spacer", icon: <Divide className="w-4 h-4" />, preview: previewBox("Spacer") },
];

const mediaItems: DropdownItem[] = [
  { type: "image", label: "Image", icon: <Image className="w-4 h-4" />, preview: previewBox("Image Placeholder") },
  { type: "video", label: "Video", icon: <Video className="w-4 h-4" />, preview: previewBox("Video Placeholder") },
  { type: "attachment", label: "Attachment", icon: <FileText className="w-4 h-4" />, preview: previewBox("Upload / Drag & Drop / Downloadable File") },
  { type: "googlemaps", label: "Google Maps", icon: <Layers className="w-4 h-4" />, preview: previewBox("Embed Google Map") },
];

const alertItems: DropdownItem[] = [
  { type: "alert", label: "Info", option: "info", icon: <Info className="w-4 h-4" />, preview: previewBox("Info Box") },
  { type: "alert", label: "Warning", option: "warning", icon: <AlertCircle className="w-4 h-4" />, preview: previewBox("Warning Box") },
];

const faqItems: DropdownItem[] = [
  { type: "faq", label: "FAQ Block", icon: <Layers className="w-4 h-4" />, preview: previewBox("Accordion FAQ") },
];

const smartItems: DropdownItem[] = [
  { type: "datetime", label: "Date / Time", icon: <Clock className="w-4 h-4" />, preview: previewBox("Insert Current Date/Time") },
  { type: "author", label: "Author Info", icon: <User className="w-4 h-4" />, preview: previewBox("Insert Author Info") },
  { type: "autoNumber", label: "Auto Number", icon: <List className="w-4 h-4" />, preview: previewBox("Auto Numbering / ToDo IDs") },
  { type: "externalAPI", label: "External Data", icon: <BarChart className="w-4 h-4" />, preview: previewBox("API Data Insert") },
];

export default function EditorToolbar({ onAdd, onSave, onCancel, onUndo, onRedo }: Props) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [hoverPreview, setHoverPreview] = useState<JSX.Element | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleClick = (item: DropdownItem) => {
    onAdd(item.type, item.option);
    setHoverPreview(null);
  };

  const renderDropdown = (label: string, items: DropdownItem[]) => (
    <div
      className="relative"
      onMouseEnter={() => {
        if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
        setOpenDropdown(label);
      }}
      onMouseLeave={() => {
        dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 300);
        setHoverPreview(null);
      }}
    >
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition">
        {label} <ChevronDown className="w-4 h-4" />
      </button>
      {openDropdown === label && (
        <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded shadow-lg z-50">
          {items.map((it) => (
            <div
              key={it.label}
              className="relative"
              onMouseEnter={() => setHoverPreview(it.preview || null)}
              onMouseLeave={() => setHoverPreview(null)}
            >
              <button
                onClick={() => handleClick(it)}
                className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 transition"
              >
                {it.icon} {it.label}
              </button>
            </div>
          ))}
        </div>
      )}
      {hoverPreview && openDropdown === label && (
        <div className="absolute top-0 left-full ml-2 z-[9999]">{hoverPreview}</div>
      )}
    </div>
  );

  // --- Dark Mode Toggle
  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={`sticky top-0 z-40 ${darkMode ? "bg-gray-900 text-white" : "bg-white/80 text-gray-900"} backdrop-blur border-b`}>
      <div className="mx-auto max-w-6xl px-4 py-2 flex flex-col gap-2">

        {/* Save / Cancel / Undo / Redo / Dark Mode */}
        <div className="flex items-center justify-start gap-2">
          <button onClick={onSave} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
            <Save className="w-4 h-4" /> Save
          </button>
          {onCancel && <button onClick={onCancel} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow hover:bg-gray-300 transition"><X className="w-4 h-4" /> Cancel</button>}
          {onUndo && <button onClick={onUndo} className="inline-flex items-center gap-2 px-3 py-1.5 border rounded hover:bg-gray-100 transition">Undo</button>}
          {onRedo && <button onClick={onRedo} className="inline-flex items-center gap-2 px-3 py-1.5 border rounded hover:bg-gray-100 transition">Redo</button>}
          <button onClick={toggleDarkMode} className="inline-flex items-center gap-2 px-3 py-1.5 border rounded hover:bg-gray-100 transition">
            {darkMode ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
          </button>
        </div>

        {/* Block Buttons */}
        <div className="flex flex-wrap gap-2 items-center">
          {basicItems.map((it) => (
            <button key={it.label} onClick={() => handleClick(it)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white hover:bg-gray-50 transition">
              {it.icon} {it.label}
            </button>
          ))}

          {renderDropdown("Header", headerSizes)}
          {renderDropdown("Code", codeLanguages)}
          {renderDropdown("Table", tableFormats)}
          {renderDropdown("Sections", sections)}
          {renderDropdown("Divider", dividers)}
          {renderDropdown("Media", mediaItems)}
          {renderDropdown("Alerts", alertItems)}
          {renderDropdown("FAQ", faqItems)}
          {renderDropdown("Smart Blocks", smartItems)}
        </div>
      </div>
    </div>
  );
}
