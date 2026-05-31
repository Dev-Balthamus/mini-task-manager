import { createContext, useContext, type ReactNode } from "react";
import { useTasksJSON, type Task } from "../custom-hooks/useTasksJSON";

interface TaskContext {
  loading: boolean;
  error: Error | null;
  tasks: Task[] | null;
  reloadTasks: () => Promise<void>;
}

const TaskEditorContext = createContext<TaskContext | undefined>(undefined);

export const useTaskEditor = () => {
  const context = useContext(TaskEditorContext);
  if (!context) {
    throw new Error("useTasks must be used within the TaskEditor Provider");
  }
  return context;
};

interface TaskEditorProps {
  children: ReactNode;
}

export const TaskEditor: React.FC<TaskEditorProps> = ({ children }) => {
  const { loading, error, data, onReloadTasks } = useTasksJSON();
  return (
    <TaskEditorContext.Provider value={{ loading, error, tasks: data, reloadTasks: onReloadTasks }}>
      {children}
    </TaskEditorContext.Provider>
  );
};
