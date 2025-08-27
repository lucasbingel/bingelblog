interface HistoryItem {
  id: string;
  user: string;
  action: string;
  date: string;
}

interface Props {
  history: HistoryItem[];
}

export default function HistoryTab({ history }: Props) {
  return (
    <div className="p-4 space-y-2">
      <h2 className="text-xl font-semibold mb-2">📜 History</h2>
      <ul className="divide-y divide-gray-200">
        {history.map(h => (
          <li key={h.id} className="py-2 flex justify-between">
            <span className="text-gray-700">{h.user}: {h.action}</span>
            <span className="text-gray-400 text-xs">{h.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
