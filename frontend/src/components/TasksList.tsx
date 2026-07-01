import { ListGroup } from "react-bootstrap";
import type { Task } from "../assets/custom-hooks/useTasksJSON";
import TaskItem from "./TaskItem";
import "./TasksList.css";

function TasksList({ items }: { items: Task[] }) {
  return (
    <ListGroup>
      {items.map((item: Task) => (
        <TaskItem key={item.id} item={item} />
      ))}
    </ListGroup>
  );
}

export default TasksList;
