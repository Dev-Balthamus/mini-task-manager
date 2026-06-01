import { useEffect, useState } from "react";

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: string;
  executed: boolean;
}

export function useTasksJSON() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<Task[] | null>(null);

  async function fetchTasksJSON() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/api/tasks");
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
