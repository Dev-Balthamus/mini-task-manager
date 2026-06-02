import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useTasksJSON, type Task } from "../custom-hooks/useTasksJSON";

export type OrderCriterion = "" | "low" | "high" | "executed" | "pending";

interface TaskContext {
  loading: boolean;
  error: Error | null;
  tasks: Task[] | null;
  reloadTasks: () => Promise<void>;
  orderCriterion: OrderCriterion;
  toOrderCriterion: (criterion: OrderCriterion) => void;
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
  const [orderCriterion, setOrderCriterion] = useState<OrderCriterion>("");

  function toOrderCriterion(criterion: OrderCriterion) {
    setOrderCriterion(criterion);
  }

  const orderedTasks = useMemo(() => {
    if (!data) return [];

    const tasksCopy = [...data];

    if (orderCriterion === "low") {
      tasksCopy.sort((a, b) => {
        if (a.priority === "low" && b.priority === "high") {
          return -1;
        }
        if (a.priority === "low" && b.priority === "medium") {
          return -1;
        }
        if (a.priority === "medium" && b.priority === "high") {
          return -1;
        }
        if (a.priority === b.priority) {
          if (a.id < b.id) {
            return -1;
          }
          if (a.id > b.id) {
            return 1;
          }
        }
        return 0;
      });
    }

    if (orderCriterion === "high") {
      tasksCopy.sort((a, b) => {
        if (a.priority === "high" && b.priority === "low") {
          return -1;
        }
        if (a.priority === "medium" && b.priority === "low") {
          return -1;
        }
        if (a.priority === "high" && b.priority === "medium") {
          return -1;
        }
        if (a.priority === b.priority) {
          if (a.id < b.id) {
            return -1;
          }
          if (a.id > b.id) {
            return 1;
          }
        }
        return 0;
      });
    }

    if (orderCriterion === "executed") {
      tasksCopy.sort((a, b) => {
        if (a.executed === true && b.executed === false) {
          return -1;
        }
        if (a.executed === false && b.executed === true) {
          return 1;
        }
        if (a.executed === b.executed) {
          if (a.id < b.id) {
            return -1;
          }
          if (a.id > b.id) {
            return 1;
          }
        }
        return 0;
      });
    }

    if (orderCriterion === "pending") {
      tasksCopy.sort((a, b) => {
        if (a.executed === false && b.executed === true) {
          return -1;
        }
        if (a.executed === true && b.executed === false) {
          return 1;
        }
        if (a.executed === b.executed) {
          if (a.id < b.id) {
            return -1;
          }
          if (a.id > b.id) {
            return 1;
          }
        }
        return 0;
      });
    }

    return tasksCopy;
  }, [data, orderCriterion]);

  return (
    <TaskEditorContext.Provider
      value={{ loading, error, tasks: orderedTasks, reloadTasks: onReloadTasks, orderCriterion, toOrderCriterion }}
    >
      {children}
    </TaskEditorContext.Provider>
  );
};
