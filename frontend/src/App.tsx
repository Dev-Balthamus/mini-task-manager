import "./App.css";
import { useTasksJSON } from "./assets/custom-hooks/useTasksJSON";
import Filters from "./components/Filters";
import TasksList from "./components/TasksList";

function App() {
  const { loading, error, data } = useTasksJSON();

  return (
    <div className="appContainer">
      <h1 className="appTitle">Mini Task Manager</h1>
      <button onClick={handleTaskCreation} className="taskItemCreate">
        New Task
      </button>
      <Filters />
      <div className="tasksContainer">
        {loading && <h2>Loading Tasks' List...</h2>}
        {error && <h2>Error loading Tasks' List: {error.message}</h2>}
        {data && <TasksList items={data} />}
      </div>
    </div>
  );
}

export default App;
