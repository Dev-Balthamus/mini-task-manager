import type { Task } from "../assets/custom-hooks/useTasksJSON";
import { useState } from "react";
import { useModal } from "../assets/custom-hooks/useModal";
import { useTaskEditor } from "../assets/contexts/TaskEditorContext";
import TaskForm from "./TaskForm";

function TaskItem({ item }: { item: Task }) {
  const { isModalOpen, openModal, closeModal } = useModal();

  const [isChecked, setIsChecked] = useState(item.executed);

  function toggleChecked() {
    setIsChecked(!isChecked);

    //Still to add a function to edit the task's "executed" property in the backend, to make the filter working effectively.
  }

  const { reloadTasks } = useTaskEditor();

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
      <div className="taskItemPriority">
        <h3>{item.priority}</h3>
      </div>
      <div className="taskItemStatus">
        <h3>Executed</h3>
        <input
          type="checkbox"
          className="taskItemStatusCheckbox"
          checked={item.executed}
          onChange={toggleChecked}
          readOnly
        />
      </div>
      <div className="taskItemActions">
        <button className="taskItemModify" onClick={openModal}>
          Modify
        </button>
        <TaskForm isOpen={isModalOpen} whyIsOpen={item.id} onClose={closeModal} />
        <button className="taskItemDelete" onClick={handleTaskDeletion}>
          Delete
        </button>
      </div>
    </li>
  );
}

export default TaskItem;
