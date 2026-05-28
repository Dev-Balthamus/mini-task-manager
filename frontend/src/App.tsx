import "./App.css";
import Filters from "./components/Filters";
import TasksList from "./components/TasksList";

function App() {
  return (
    <div className="appContainer">
      <h1 className="appTitle">Mini Task Manager</h1>
      <button onClick={handleTaskCreation} className="taskItemCreate">
        New Task
      </button>
      <Filters />
      <TasksList items={[]} />
    </div>
  );
}

export default App;
