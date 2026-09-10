import { createContext, useContext } from "react";
import { type Task } from "../custom-hooks/useTasks";

export type PriorityCriterion = "" | "low" | "high";
export type ExecutionCriterion = "" | "executed" | "pending";

interface TaskContext {
  loading: boolean;
  error: Error | null;
  tasks: Task[] | null;
  reloadTasks: () => Promise<void>;
  priority: PriorityCriterion;
  toOrderByPriority: (priority: PriorityCriterion) => void;
  execution: ExecutionCriterion;
  toOrderByExecution: (priority: ExecutionCriterion) => void;
}

export const TaskEditorContext = createContext<TaskContext | undefined>(undefined);

export const useTaskEditor = () => {
  const context = useContext(TaskEditorContext);
  if (!context) {
    throw new Error("useTasks must be used within the TaskEditor Provider");
  }
  return context;
};
