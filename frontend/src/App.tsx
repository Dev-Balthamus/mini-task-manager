import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { UserAuth, type UserAuthProps } from "./assets/contexts/UserAuthProvider";
import { useUserAuth } from "./assets/contexts/UserAuthContext";
import UserLoginPage from "./components/UserLoginPage";
import UserRegistrationPage from "./components/UserRegistrationPage";
import TasksPage from "./components/TasksPage";

// Componente per definire le rotte protette
function ProtectedRoute({ children }: UserAuthProps) {
  const { isAuthenticated } = useUserAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <UserAuth>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<UserLoginPage />} />
          <Route path="/register" element={<UserRegistrationPage />} />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <TasksPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </UserAuth>
  );
}

export default App;
