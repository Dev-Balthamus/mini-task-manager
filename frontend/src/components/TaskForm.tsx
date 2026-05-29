import { useState } from "react";
import type { Task } from "../assets/custom-hooks/useTasksJSON";

interface Modal {
  isOpen: boolean;
  whyIsOpen: string;
  onClose: () => void;
}

function TaskForm({ isOpen, whyIsOpen, onClose }: Modal) {
  if (!isOpen) return null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  let newTask: Task | null = null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* "modal-overlay" è lo sfondo oltre la modale. Se ci si clicca, la modale si chiude.
          "modal-container" è il contenitore della modale.
          "e.stopPropagation()" evita la chiusura della modale se si clicca in essa. */}
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {whyIsOpen === "createTask" && <h2>Create New Task</h2>}
        {whyIsOpen === "editTask" && <h2>Edit SelectedTask</h2>}
        <button onClick={onClose}>&times;</button>
        <form className="formContainer">
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="formTextInput" />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="formTextInput"
          />
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="formSelectInput">
            <option value="">Select Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {whyIsOpen === "createTask" && (
            <button type="submit" className="formSubmit" onClick={handleTaskCreation}>
              Create Task
            </button>
          )}
          {whyIsOpen === "editTask" && (
            <button type="submit" className="formSubmit" onClick={handleTaskEditing}>
              Edit Task
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default TaskForm;
