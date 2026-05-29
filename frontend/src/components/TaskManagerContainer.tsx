import { useState } from "react";
import { useTasksJSON } from "../assets/custom-hooks/useTasksJSON";
import TaskForm from "./TaskForm";
import Filters from "./Filters";
import TasksList from "./TasksList";

function TaskManagerContainer() {
  const { loading, error, data } = useTasksJSON();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <div className="newTaskContainer">
        <button onClick={openModal} className="taskItemCreate">
          New Task
        </button>
        <TaskForm isOpen={isModalOpen} whyIsOpen="createTask" onClose={closeModal} />
      </div>
      <Filters />
      <div className="tasksContainer">
        {loading && <h2>Loading Tasks' List...</h2>}
        {error && <h2>Error loading Tasks' List: {error.message}</h2>}
        {data && <TasksList items={data} />}
      </div>
    </>
  );
}

export default TaskManagerContainer;
