import "./App.css";
import TaskManagerContainer from "./components/TaskManagerContainer";

function App() {
  return (
    <div className="appContainer">
      <h1 className="appTitle">Mini Task Manager</h1>
      <TaskManagerContainer />
    </div>
  );
}

export default App;
