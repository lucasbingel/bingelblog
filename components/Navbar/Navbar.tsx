"use client";

import Link from "next/link";

export default function MainNavbar() {
  return (
    <nav className="bg-white shadow p-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <img src="/images/Lucas.jpg" alt="Logo" className="w-8 h-8 rounded-full" />
        <span className="font-bold text-lg text-gray-800">Wiki Pages</span>
      </div>

      <div className="flex gap-4">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <Link href="/wiki" className="hover:text-blue-600">Wiki</Link>
      </div>
    </nav>
  );
}
