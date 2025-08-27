import { CommentItem } from "@/hooks/useTabs";
import { useState } from "react";

interface Props {
  comments: CommentItem[];
  setComments: (c: CommentItem[]) => void;
}

export default function CommentsTab({ comments, setComments }: Props) {
  const [newComment, setNewComment] = useState("");

  const addComment = () => {
    if (!newComment.trim()) return;
    setComments([
      ...comments,
      { id: crypto.randomUUID(), author: "You", text: newComment, date: new Date().toISOString() },
    ]);
    setNewComment("");
  };

  return (
    <div className="p-4 space-y-3">
      <h2 className="text-xl font-semibold mb-2">💬 Comments</h2>
      {comments.map(c => (
        <div key={c.id} className="border p-2 rounded bg-gray-50">
          <div className="text-sm font-bold">{c.author}</div>
          <div className="text-gray-700">{c.text}</div>
          <div className="text-xs text-gray-400">{c.date}</div>
        </div>
      ))}
      <textarea
        className="w-full border rounded p-2 mt-2"
        placeholder="Add a comment..."
        value={newComment}
        onChange={e => setNewComment(e.target.value)}
      />
      <button
        className="mt-2 px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={addComment}
      >
        Post
      </button>
    </div>
  );
}
