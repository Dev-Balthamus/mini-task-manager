import TaskItem from "./TaskItem";

function TasksList({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <TaskItem key={item.id} item={item} />
      ))}
    </ul>
  );
}

export default TasksList;
