import { TaskItem } from "@/hooks/useTabs";

interface Props {
  tasks: TaskItem[];
  setTasks: (t: TaskItem[]) => void;
}

export default function TasksTab({ tasks, setTasks }: Props) {
  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-xl font-semibold mb-2">✅ Tasks</h2>
      {tasks.map(t => (
        <div key={t.id} className="flex items-center gap-2">
          <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} />
          <span className={t.done ? "line-through text-gray-400" : ""}>{t.title}</span>
        </div>
      ))}
    </div>
  );
}
