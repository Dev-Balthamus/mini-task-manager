import type { Task } from "../assets/custom-hooks/useTasksJSON";
import TaskItem from "./TaskItem";

function TasksList({ items }: { items: Task[] }) {
  return (
    <ul>
      {items.map((item: Task) => (
        <TaskItem key={item.id} item={item} />
      ))}
    </ul>
  );
}

export default TasksList;
