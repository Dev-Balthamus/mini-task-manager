import { useMemo, useState, type ReactNode } from "react";
import { useTasks } from "../custom-hooks/useTasks";
import { type PriorityCriterion, type ExecutionCriterion, TaskEditorContext } from "./TaskEditorContext";

interface TaskEditorProps {
  children: ReactNode;
}

export const TaskEditor = ({ children }: TaskEditorProps) => {
  const { loading, error, data, onReloadTasks } = useTasks();
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

      // Ordine di default: incrementale per data di creazione
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateA - dateB;
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
