import { useState } from "react";
import { type Task } from "../assets/custom-hooks/useTasksJSON";
import type { ManageModal } from "../assets/custom-hooks/useModal";
import { useTaskEditor } from "../assets/contexts/TaskEditorContext";
import { addTask, editTask } from "../assets/apis";
import { Button, FloatingLabel, Form, Modal } from "react-bootstrap";
import "./TaskForm.css";

function TaskForm({ isOpen, whyIsOpen, onClose }: ManageModal) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");

  const { tasks, reloadTasks } = useTaskEditor();

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
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {whyIsOpen === "createTask" && <h2>Create New Task</h2>}
          {whyIsOpen !== "createTask" && <h2>Edit Selected Task</h2>}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <FloatingLabel controlId="TitleTI" label="Title" className="mb-3">
            <Form.Control
              as="input"
              placeholder={whyIsOpen === "createTask" ? "Set the task Title" : `${previousTitle}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              contentEditable
            />
          </FloatingLabel>
          <FloatingLabel controlId="DescriptionTI" label="Description" className="mb-3">
            <Form.Control
              as="input"
              placeholder="Set the task Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FloatingLabel>
          <Form.Select id="PriorityOG" className="mb-3" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">Select Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Form.Select>
          {whyIsOpen === "createTask" && (
            <Button variant="secondary" type="submit" onClick={handleTaskCreation}>
              Create Task
            </Button>
          )}
          {whyIsOpen !== "createTask" && (
            <Button variant="secondary" type="submit" onClick={handleTaskEditing}>
              Edit Task
            </Button>
          )}
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default TaskForm;
