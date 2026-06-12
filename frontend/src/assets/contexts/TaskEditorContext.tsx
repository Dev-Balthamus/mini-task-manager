import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useTasksJSON, type Task } from "../custom-hooks/useTasksJSON";

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
  const [priority, setPriority] = useState<PriorityCriterion>("");
  const [execution, setExecution] = useState<ExecutionCriterion>("");

  function toOrderByPriority(priority: PriorityCriterion) {
    setPriority(priority);
  }
  function toOrderByExecution(execution: ExecutionCriterion) {
    setExecution(execution);
  }

  const orderedTasks = useMemo(() => {
    if (!data) return [];

    const tasksCopy = [...data];

    const priorityNumValue: Map<string, number> = new Map();

    switch (priority) {
      case "low":
        {
          priorityNumValue.set("low", 0);
          priorityNumValue.set("medium", 1);
          priorityNumValue.set("high", 2);
        }
        break;
      case "high":
        {
          priorityNumValue.set("low", 2);
          priorityNumValue.set("medium", 1);
          priorityNumValue.set("high", 0);
        }
        break;
      default: {
        priorityNumValue.set("low", 1);
        priorityNumValue.set("medium", 1);
        priorityNumValue.set("high", 1);
      }
    }

    tasksCopy.sort((a, b) => {
      if (execution === "executed" || execution === "pending") {
        const aExecutionStatus = a.executed === true ? 1 : 0;
        const bExecutionStatus = b.executed === true ? 1 : 0;

        const order = execution === "executed" ? 1 : -1;

        if (aExecutionStatus !== bExecutionStatus) return aExecutionStatus > bExecutionStatus ? -order : order;
      }

      if (priority === "low" || priority === "high") {
        const priorityANum = priorityNumValue.get(a.priority)!;
        const priorityBNum = priorityNumValue.get(b.priority)!;

        if (priorityANum !== priorityBNum) return priorityANum - priorityBNum;
      }

      if (a.id !== b.id) return a.id < b.id ? -1 : 1;

      return 0;
    });

    return tasksCopy;
  }, [data, priority, execution]);

  return (
    <TaskEditorContext.Provider
      value={{
        loading,
        error,
        tasks: orderedTasks,
        reloadTasks: onReloadTasks,
        priority,
        toOrderByPriority,
        execution,
        toOrderByExecution,
      }}
    >
      {children}
    </TaskEditorContext.Provider>
  );
};
