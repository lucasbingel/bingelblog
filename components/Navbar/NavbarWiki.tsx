"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function WikiNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isWiki = pathname?.startsWith("/wiki") ?? false;

  let articleId: string | undefined;
  if (isWiki && pathname) {
    const parts = pathname.split("/");
    articleId = parts[2]; // /wiki/[id]/...
  }

  return (
    <nav className="bg-white shadow p-4 flex items-center justify-between sticky top-0 z-50">
      {/* Left: Back */}
      <div>
        {isWiki && (
          <button
            className="flex items-center gap-1 text-gray-700 hover:text-blue-600"
            onClick={() => router.push("/")} // Back immer auf Homepage/Wiki Liste
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        )}
      </div>

      {/* Center: Wiki Links */}
      <div className="flex-1 flex justify-center gap-4">
        {isWiki && (
          <>
            <Link href="/wiki" className="hover:text-blue-600">Wiki Home</Link>
            <Link href="/wiki/documents" className="hover:text-blue-600">Documents</Link>
          </>
        )}
      </div>

      {/* Right: Artikel ID */}
      <div>
        {isWiki && articleId && <span className="font-bold text-gray-800">#{articleId}</span>}
      </div>
    </nav>
  );
}
