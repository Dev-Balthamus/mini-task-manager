import { type ChangeEvent } from "react";
import { useTaskEditor } from "../assets/contexts/TaskEditorContext";
import type { Task } from "../assets/custom-hooks/useTasksJSON";
import { useModal } from "../assets/custom-hooks/useModal";
import { Button, ListGroup } from "react-bootstrap";
import TaskForm from "./TaskForm";
import { editTask, deleteTask } from "../assets/apis";
import "./TaskItem.css";

function TaskItem({ item }: { item: Task }) {
  const { isModalOpen, openModal, closeModal } = useModal();
  const { reloadTasks } = useTaskEditor();

  async function handleExecutedStatusChange(e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault();

    const nextExecutedStatus = e.target.checked;

    const editedTask = {
      ...item,
      executed: nextExecutedStatus,
    };

    await editTask(editedTask);

    await reloadTasks();
  }

  async function handleTaskDeletion(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    const proceed = confirm("Sei sicuro di voler cancellare questo task? L'azione è irreversibile.");

    if (proceed) {
      await deleteTask(item);

      await reloadTasks();
    } else return;
  }

  return (
    <ListGroup.Item className={`taskItem ${item.executed === true ? "taskItemExecuted" : ""}`}>
      <div className="taskItemTitle">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
      <div className="taskItemPriority">
        <h3>Priority</h3>
        <h3 id={`${item.priority === "high" ? "high" : item.priority === "medium" ? "medium" : "low"}`}>{item.priority}</h3>
      </div>
      <div className="taskItemStatus">
        <h3>Done?</h3>
        <input
          type="checkbox"
          className="taskItemStatusCheckbox"
          checked={item.executed}
          onChange={handleExecutedStatusChange}
          readOnly
        />
      </div>
      <div className="taskItemActions">
        <Button variant="secondary" onClick={openModal}>
          Modify
        </Button>
        <TaskForm isOpen={isModalOpen} whyIsOpen={item.id} onClose={closeModal} />
        <Button variant="secondary" onClick={handleTaskDeletion}>
          Delete
        </Button>
      </div>
    </ListGroup.Item>
  );
}

export default TaskItem;
