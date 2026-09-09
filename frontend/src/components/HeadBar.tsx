import { useUserAuth } from "../assets/contexts/UserAuthContext";
import { Button } from "react-bootstrap";
import "./HeadBar.css";

function HeadBar() {
  const { user, logout } = useUserAuth();
  return (
    <div className="headBarContainer">
      <h3 className="headBarTitle">Mini Task Manager</h3>
      <div className="headBarButtons">
        <Button className="userNameButton" variant="link" size="sm" disabled>
          {user!.email}
        </Button>
        <Button variant="outline-danger" size="sm" onClick={logout}>
          Logout
        </Button>
      </div>
    </div>
  );
}

export default HeadBar;
