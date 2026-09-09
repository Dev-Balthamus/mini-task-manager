import { TaskEditor } from "../assets/contexts/TaskEditorProvider";
import { useUserAuth } from "../assets/contexts/UserAuthContext";
import HeadBar from "./HeadBar";
import TaskManagerContainer from "./TaskManagerContainer";
import "../App.css";

function TasksPage() {
  const { user } = useUserAuth();

  return (
    <div className="appContainer">
      <HeadBar />
      <h1 className="appTitle">
        Task Manager per l'utente: <br />
        {user!.email}
      </h1>
      <TaskEditor>
        <TaskManagerContainer />
      </TaskEditor>
    </div>
  );
}

export default TasksPage;
