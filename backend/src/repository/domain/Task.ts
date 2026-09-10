export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  executed: boolean;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

// Tipo per la fase di creazione Task: l'ID viene omesso in quanto generato dal database
export type CreateTaskDTO = Omit<Task, "id" | "created_at" | "updated_at">;
