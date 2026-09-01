export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  executed: boolean;
}

// Tipo per la fase di creazione Task: l'ID viene omesso in quanto generato dal database
export type CreateTaskDTO = Omit<Task, "id">;
