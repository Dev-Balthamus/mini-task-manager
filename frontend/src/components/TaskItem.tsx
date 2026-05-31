import type { Task } from "../assets/custom-hooks/useTasksJSON";
import { useState } from "react";
import { useModal } from "../assets/custom-hooks/useModal";
import TaskForm from "./TaskForm";

function TaskItem({ item }: { item: Task }) {
  const { isModalOpen, openModal, closeModal } = useModal();

  const [isChecked, setIsChecked] = useState(false);

  function toggleChecked() {
    setIsChecked(!isChecked);
  }

  return (
    <li className={`taskItem ${isChecked === true ? "taskItemExecuted" : ""}`}>
      <div className="taskItemTitle">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
      <div className="taskItemPriority">
        <h3>{item.priority}</h3>
      </div>
      <div className="taskItemStatus">
        <h3>Executed</h3>
        <input type="checkbox" className="taskItemStatusCheckbox" checked={isChecked} onChange={toggleChecked} readOnly />
      </div>
      <div className="taskItemActions">
        <button className="taskItemModify" onClick={openModal}>
          Modify
        </button>
        <TaskForm isOpen={isModalOpen} whyIsOpen={item.id} onClose={closeModal} />
        <button className="taskItemDelete">Delete</button>
      </div>
    </li>
  );
}

export default TaskItem;
