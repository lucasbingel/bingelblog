interface StatsProps {
  stats: { views: number; edits: number; comments: number; attachments: number };
}

export default function StatsTab({ stats }: StatsProps) {
  return (
    <div className="p-4 space-y-2">
      <h2 className="text-xl font-semibold mb-2">📊 Stats</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-2 border rounded bg-gray-50 text-center">
          <div className="text-gray-500 text-sm">Views</div>
          <div className="font-bold text-lg">{stats.views}</div>
        </div>
        <div className="p-2 border rounded bg-gray-50 text-center">
          <div className="text-gray-500 text-sm">Edits</div>
          <div className="font-bold text-lg">{stats.edits}</div>
        </div>
        <div className="p-2 border rounded bg-gray-50 text-center">
          <div className="text-gray-500 text-sm">Comments</div>
          <div className="font-bold text-lg">{stats.comments}</div>
        </div>
        <div className="p-2 border rounded bg-gray-50 text-center">
          <div className="text-gray-500 text-sm">Attachments</div>
          <div className="font-bold text-lg">{stats.attachments}</div>
        </div>
      </div>
    </div>
  );
}
