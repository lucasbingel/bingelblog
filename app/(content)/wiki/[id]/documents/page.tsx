"use client";

export default function DocumentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">📂 Documents</h1>
      <p className="text-gray-600 mb-6">
        Hier findest du deine Dokumente, Berichte und Ressourcen.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4 shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg">📑 Report 1</h2>
          <p className="text-sm text-gray-500">Zuletzt bearbeitet: gestern</p>
        </div>

        <div className="border rounded-lg p-4 shadow hover:shadow-md transition">
          <h2 className="font-semibold text-lg">📑 Report 2</h2>
          <p className="text-sm text-gray-500">Zuletzt bearbeitet: letzte Woche</p>
        </div>
      </div>
    </div>
  );
}
