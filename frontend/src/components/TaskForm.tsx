import { useState } from "react";
import { type Task } from "../assets/custom-hooks/useTasksJSON";
import type { Modal } from "../assets/custom-hooks/useModal";
import { useTaskEditor } from "../assets/contexts/TaskEditorContext";
import "./TaskForm.css";

function TaskForm({ isOpen, whyIsOpen, onClose }: Modal) {
  if (!isOpen) return null;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");

  const { tasks, reloadTasks } = useTaskEditor();

  async function handleTaskCreation(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    let newTask: Task | null = null;

    if (!title || !priority) {
      alert("Title and Priority fields are required.");
      return;
    }

    if (title && priority) {
      newTask = {
        id: Date.now(),
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

  async function addTask(task: Task) {
    try {
      const response = await fetch("http://localhost:3000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
      });

      if (response.status !== 201) {
        throw new Error("Error in creating the new Task");
      }

      const addedTask = await response.json();
      return addedTask;
    } catch (error) {
      console.error(error);
    }
  }

  const taskToEdit = tasks?.find((t: Task) => t.id === whyIsOpen);
  const previousTitle = taskToEdit?.title;

  async function handleTaskEditing(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    let editedTask: Task = {
      id: whyIsOpen as number,
      title,
      description,
      priority,
      executed: false,
    };

    await editTask(editedTask);

    await reloadTasks();

    setTitle("");
    setDescription("");
    setPriority("");

    onClose();
  }

  async function editTask(task: Task) {
    try {
      const response = await fetch(`http://localhost:3000/api/tasks/${whyIsOpen as number}`, {
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
          <input
            type="text"
            placeholder={whyIsOpen === "createTask" ? "Title" : `${previousTitle}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="formTextInput"
          />
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
