import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow p-4 flex justify-between items-center mb-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
        <span className="font-bold text-lg">Mein Portfolio</span>
      </div>
      <div className="flex gap-4">
        <Link href="/" className="hover:text-blue-600">Übersicht</Link>
        <Link href="/portfolio" className="hover:text-blue-600">Portfolio</Link>
        <Link href="/rules" className="hover:text-blue-600">Regeln</Link>
        <Link href="/forecast" className="hover:text-blue-600">Prognose</Link>
        <Link href="/dividend" className="hover:text-blue-600">Dividenden</Link>
      </div>
    </nav>
  );
}
