"use client";

export default function Sidebar() {
  return (
    <div className="sticky top-0 h-screen flex flex-col w-72 bg-gray-100 border-r">
      {/* Header */}
      <div className="flex items-center p-4 gap-2 border-b">
        <span className="font-bold text-lg">Wiki Pages</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <input
          type="text"
          placeholder="Search..."
          className="w-full px-2 py-1 border rounded mb-4"
        />
        <ul className="space-y-2 text-sm">
          <li className="hover:bg-gray-200 p-2 rounded cursor-pointer">🏠 Home</li>
          <li>
            <div className="hover:bg-gray-200 p-2 rounded cursor-pointer">📘 Kapitel 1</div>
            <ul className="ml-6 space-y-1">
              <li className="hover:bg-gray-200 p-1 rounded cursor-pointer">1.1 Einführung</li>
              <li className="hover:bg-gray-200 p-1 rounded cursor-pointer">1.2 Details</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
}
