import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";
import { useUserAuth } from "../assets/contexts/UserAuthContext";
import { type UserCredentialsDTO } from "../assets/custom-hooks/useUser";
import { loginUser } from "../assets/apis";
import "../App.css";
import "./UserPages.css";

function UserLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Gestione di Caricamento ed Errore locali
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { login } = useUserAuth();
  const navigate = useNavigate();

  async function handleLogin(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    let toLogUser: UserCredentialsDTO;
    setError(null);

    if (!email || !password) {
      setError("Restano campi da compilare.");
      return;
    }

    if (email && password) {
      setLoading(true);
      toLogUser = { email, password };

      const loginProcessResult = await loginUser(toLogUser);

      if (loginProcessResult instanceof Object) {
        login(loginProcessResult);
        navigate("/tasks");
      } else if (typeof loginProcessResult === "string") {
        setError(loginProcessResult);
        setLoading(false);
      }
    }
  }

  return (
    <Container className="appContainer justify-content-center">
      <h1 className="appTitle">Mini Task Manager</h1>
      <Card className="userForm p-4 shadow-sm">
        <h2 className="userFormTitle">Accedi</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3" controlId="loginEmail">
            <Form.Label>E-mail utente</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => {
                setLoading(false);
                setEmail(e.target.value);
              }}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="loginPassword">
            <Form.Label>Password utente</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => {
                setLoading(false);
                setPassword(e.target.value);
              }}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100" disabled={loading}>
            {loading ? "Preparazione all'accesso..." : "Accedi"}
          </Button>
        </Form>
      </Card>
      <h4 className="appNavigation">
        Non hai un account? <Link to="/register">Registrati</Link>
      </h4>
    </Container>
  );
}

export default UserLoginPage;
