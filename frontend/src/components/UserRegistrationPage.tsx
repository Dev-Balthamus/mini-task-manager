import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";
import { type UserCredentialsDTO } from "../assets/custom-hooks/useUser";
import { registerUser } from "../assets/apis";
import "../App.css";
import "./UserPages.css";

function UserRegistrationPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Gestione di Caricamento ed Errore locali
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

  async function handleRegistration(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    let newUser: UserCredentialsDTO;
    setError(null);

    if (!email || !password) {
      setError("Compilare tutti i campi per procedere.");
      return;
    }

    // Verifica sincrona lato client per impostare la password come desiderato
    if (password !== confirmPassword) {
      setError("Non hai confermato la stessa password.");
      return;
    }

    if (email && password) {
      setLoading(true);
      newUser = { email, password };

      const message = await registerUser(newUser);

      if (message.includes("completata")) {
        setSuccess(message);
      } else if (message.includes("errore")) {
        setError(message);
      }

      setLoading(false);
    }
  }

  return (
    <Container className="appContainer justify-content-center">
      <h1 className="appTitle">Mini Task Manager</h1>
      <Card className="userForm p-4 shadow-sm">
        <h2 className="text-center mb-4">Registrazione</h2>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && (
          <Alert variant="success" onClose={() => navigate("/login")} dismissible>
            {success}
          </Alert>
        )}

        <Form onSubmit={handleRegistration}>
          <Form.Group className="mb-3" controlId="regEmail">
            <Form.Label>E-mail utente</Form.Label>
            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Form.Group>

          <Form.Group className="mb-3" controlId="regPassword">
            <Form.Label>Password utente</Form.Label>
            <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Form.Group>

          <Form.Group className="mb-3" controlId="regConfirmPW">
            <Form.Label>Conferma Password</Form.Label>
            <Form.Control
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="success" type="submit" className="w-100" disabled={loading}>
            {loading ? "Registrazione in corso..." : "Registrati"}
          </Button>
        </Form>
      </Card>
      <h4 className="appNavigation">
        Hai già un account? <Link to="/login">Accedi</Link>
      </h4>
    </Container>
  );
}

export default UserRegistrationPage;
