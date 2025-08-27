import { useState } from "react";

export interface CommentItem {
  id: string;
  author: string;
  text: string;
  date: string;
}

export interface TaskItem {
  id: string;
  title: string;
  done: boolean;
}

export interface LinkItem {
  id: string;
  name: string;
  url: string;
}

export function useTabs(initialStats?: { views: number; edits: number; comments: number; attachments: number }) {
  const [comments, setComments] = useState<CommentItem[]>([
    { id: "1", author: "Anna", text: "Kannst du das Diagramm noch erklären?", date: "2025-08-27 10:15" },
    { id: "2", author: "Mark", text: "Sieht gut aus!", date: "2025-08-27 09:50" },
  ]);

  const [tasks, setTasks] = useState<TaskItem[]>([
    { id: "1", title: "Review Article", done: false },
    { id: "2", title: "Add Images", done: true },
  ]);

  const [links, setLinks] = useState<LinkItem[]>([
    { id: "1", name: "React Docs", url: "https://react.dev" },
    { id: "2", name: "Next.js Docs", url: "https://nextjs.org" },
  ]);

  const [stats, setStats] = useState(initialStats || { views: 128, edits: 12, comments: comments.length, attachments: 3 });

  return { comments, setComments, tasks, setTasks, links, setLinks, stats };
}
