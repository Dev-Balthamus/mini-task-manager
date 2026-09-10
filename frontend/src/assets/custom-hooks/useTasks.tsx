import { useEffect, useState } from "react";

export const tasksURL = import.meta.env.VITE_TASKS_URL;

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: string;
  executed: boolean;
  created_at: string;
  updated_at?: string;
}

// Tipo specifico per la fase di creazione Task, in cui l'ID è omesso
export type CreateTaskDTO = Omit<Task, "id" | "created_at" | "updated_at">;

export function useTasks() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<Task[] | null>(null);

  async function fetchTasksJSON() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(tasksURL, {
        credentials: "include",
      });
      const tasks = await response.json();

      if (response.status !== 200) {
        setError(new Error());
      }

      setData(tasks);
    } catch (error) {
      setError(error as Error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasksJSON();
  }, []);

  return { loading, error, data, onReloadTasks: fetchTasksJSON };
}
