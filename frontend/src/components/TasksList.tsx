import type { Task } from "../assets/custom-hooks/useTasksJSON";
import TaskItem from "./TaskItem";
import "./TasksList.css";

function TasksList({ items }: { items: Task[] }) {
  return (
    <ul className="tasksList">
      {items.map((item: Task) => (
        <TaskItem key={item.id} item={item} />
      ))}
    </ul>
  );
}

export default TasksList;
