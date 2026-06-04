import { useModal } from "../assets/custom-hooks/useModal";
import TaskForm from "./TaskForm";
import Filters from "./Filters";
import TasksList from "./TasksList";
import { useTaskEditor } from "../assets/contexts/TaskEditorContext";
import "./TaskManagerContainer.css";

function TaskManagerContainer() {
  const { isModalOpen, openModal, closeModal } = useModal();
  const { loading, error, tasks } = useTaskEditor();

  return (
    <div className="taskManagerContainer">
      <div className="newTaskContainer">
        <button onClick={openModal} className="taskItemCreate">
          New Task
        </button>
        <TaskForm isOpen={isModalOpen} whyIsOpen="createTask" onClose={closeModal} />
      </div>

      <div className="tasksContainer">
        {tasks && <Filters />}
        {loading && <h2>Loading Tasks' List...</h2>}
        {error && <h2>Error loading Tasks' List: {error.message}</h2>}
        {(!tasks || tasks.length === 0) && (
          <h2>
            Tasks' List is currently empty.
            <br />
            Let's create the first task!
          </h2>
        )}
        {tasks && <TasksList items={tasks} />}
      </div>
    </div>
  );
}

export default TaskManagerContainer;
