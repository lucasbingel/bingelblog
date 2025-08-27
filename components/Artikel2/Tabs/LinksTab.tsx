import { LinkItem } from "@/hooks/useTabs";
import { useState } from "react";

interface Props {
  links: LinkItem[];
  setLinks: (l: LinkItem[]) => void;
}

export default function LinksTab({ links, setLinks }: Props) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const addLink = () => {
    if (!name || !url) return;
    setLinks([...links, { id: crypto.randomUUID(), name, url }]);
    setName("");
    setUrl("");
  };

  const deleteLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
  };

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-xl font-semibold mb-2">🔗 Links</h2>

      <ul className="list-disc ml-5 space-y-1">
        {links.map(l => (
          <li key={l.id} className="flex justify-between items-center">
            <a href={l.url} target="_blank" className="text-blue-600 hover:underline">{l.name}</a>
            <button onClick={() => deleteLink(l.id)} className="text-red-500 hover:text-red-700 text-sm">🗑️</button>
          </li>
        ))}
      </ul>

      <div className="flex gap-2 mt-2">
        <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} className="border rounded p-1 flex-1"/>
        <input type="text" placeholder="URL" value={url} onChange={e => setUrl(e.target.value)} className="border rounded p-1 flex-1"/>
        <button onClick={addLink} className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600">Add</button>
      </div>
    </div>
  );
}
