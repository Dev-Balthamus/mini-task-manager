import { TaskEditor } from "./assets/contexts/TaskEditorContext";
import TaskManagerContainer from "./components/TaskManagerContainer";
import "./App.css";

function App() {
  return (
    <div className="appContainer">
      <h1 className="appTitle">Mini Task Manager</h1>
      <TaskEditor>
        <TaskManagerContainer />
      </TaskEditor>
    </div>
  );
}

export default App;
