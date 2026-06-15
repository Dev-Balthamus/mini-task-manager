import { useState } from "react";
import { type Task } from "../assets/custom-hooks/useTasksJSON";
import type { Modal } from "../assets/custom-hooks/useModal";
import { useTaskEditor } from "../assets/contexts/TaskEditorContext";
import "./TaskForm.css";
import { addTask, editTask } from "../assets/apis";

function TaskForm({ isOpen, whyIsOpen, onClose }: Modal) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");

  const { tasks, reloadTasks } = useTaskEditor();

  if (!isOpen) return null;

  async function handleTaskCreation(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    let newTask: Task;

    if (!title || !priority) {
      alert("Title and Priority fields are required.");
      return;
    }

    if (title && priority) {
      newTask = {
        id: NaN,
        title,
        description,
        priority,
        executed: false,
      };

      await addTask(newTask);

      await reloadTasks();

      setTitle("");
      setDescription("");
      setPriority("");

      onClose();
    }
  }

  const taskToEdit = tasks!.find((t: Task) => t.id === whyIsOpen)!;
  const previousTitle = taskToEdit?.title;

  async function handleTaskEditing(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const editedTask = {
      ...taskToEdit,
      title,
      description,
      priority,
      executed: false, //Si assume che ogni edit a un task sia dovuto alla necessità di altre specifiche o altro tempo per completarne l'esecuzione
    };

    await editTask(editedTask);

    await reloadTasks();

    setTitle("");
    setDescription("");
    setPriority("");

    onClose();
  }

  return (
    <div className="modalOverlay" onClick={onClose}>
      {/* "modal-overlay" è lo sfondo oltre la modale. Se ci si clicca, la modale si chiude.
          "modal-container" è il contenitore della modale.
          "e.stopPropagation()" evita la chiusura della modale se si clicca in essa. */}
      <div className="modalContainer" onClick={(e) => e.stopPropagation()}>
        <form className="formContainer">
          <div className="formHeader">
            {whyIsOpen === "createTask" && <h2>Create New Task</h2>}
            {whyIsOpen !== "createTask" && <h2>Edit Selected Task</h2>}
            <button onClick={onClose} className="closeButton">
              &times;
            </button>
          </div>
          <div className="formField">
            <label className="formLabel">Title</label>
            <input
              type="text"
              placeholder={whyIsOpen === "createTask" ? "Title" : `${previousTitle}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="formTextInput"
            />
          </div>
          <div className="formField">
            <label className="formLabel">Description</label>
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="formTextInput"
            />
          </div>
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
          {whyIsOpen !== "createTask" && (
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
