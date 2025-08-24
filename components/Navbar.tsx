"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Hydration-Safe Rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Wiki-Erkennung
  const isWiki = pathname?.startsWith("/wiki") ?? false;

  let articleId: string | undefined;
  if (isWiki && pathname) {
    const parts = pathname.split("/");
    articleId = parts[2]; // /wiki/[id]/...
  }

  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center sticky top-0 z-50">
      <a href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-full">
          <img src="/images/Lucas.jpg" alt="Logo" className="w-8 h-8" />
        </div>
        <span className="font-bold text-lg">Mein Portfolio</span>
      </a>


      <div className="flex gap-4 items-center">
        {isWiki ? (
          <>
            <button
              className="px-3 py-1 border rounded"
              onClick={() => router.back()}
            >
              Back
            </button>
            <Link href="/wiki" className="px-3 py-1 border rounded">
              Wiki Home
            </Link>
            <button className="px-3 py-1 border rounded">Documents</button>
            {articleId && (
              <span className="font-mono text-gray-700">#{articleId}</span>
            )}
          </>
        ) : (
          <>
            <Link href="/" className="hover:text-blue-600">Übersicht</Link>
            <Link href="/portfolio" className="hover:text-blue-600">Portfolio</Link>
            <Link href="/rules" className="hover:text-blue-600">Regeln</Link>
            <Link href="/forecast" className="hover:text-blue-600">Prognose</Link>
            <Link href="/dividend" className="hover:text-blue-600">Dividenden</Link>
          </>
        )}
      </div>
    </nav>
  );
}
