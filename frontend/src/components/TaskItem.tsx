import { type ChangeEvent } from "react";
import type { Task } from "../assets/custom-hooks/useTasksJSON";
import { useModal } from "../assets/custom-hooks/useModal";
import { useTaskEditor } from "../assets/contexts/TaskEditorContext";
import TaskForm from "./TaskForm";

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

  async function editTask(task: Task) {
    try {
      const response = await fetch(`http://localhost:3000/api/tasks/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
      });

      if (response.status !== 200) {
        throw new Error("Error in updating the Task");
      }

      const editedTask = await response.json();
      return editedTask;
    } catch (error) {
      console.error(error);
    }
  }

  async function handleTaskDeletion(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/tasks/${item.id}`, {
        method: "DELETE",
      });

      if (response.status !== 200) {
        throw new Error("Error in deleting the Task");
      }

      await reloadTasks();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <li className={`taskItem ${item.executed === true ? "taskItemExecuted" : ""}`}>
      <div className="taskItemTitle">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
      <h3
        className={`taskItemPriority ${item.priority === "High" ? "high" : item.priority === "Medium" ? "medium" : "low"}`}
      >
        {item.priority}
      </h3>
      <div className="taskItemStatus">
        <h3>Executed</h3>
        <input
          type="checkbox"
          className="taskItemStatusCheckbox"
          checked={item.executed}
          onChange={handleExecutedStatusChange}
          readOnly
        />
      </div>
      <div className="taskItemActions">
        <button onClick={openModal}>Modify</button>
        <TaskForm isOpen={isModalOpen} whyIsOpen={item.id} onClose={closeModal} />
        <button onClick={handleTaskDeletion}>Delete</button>
      </div>
    </li>
  );
}

export default TaskItem;
