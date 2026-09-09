import { useState, type ReactNode } from "react";
import { authURL, type UserIdentityDTO } from "../custom-hooks/useUser";
import { UserAuthContext } from "./UserAuthContext";

export interface UserAuthProps {
  children: ReactNode;
}

export const UserAuth = ({ children }: UserAuthProps) => {
  const [user, setUser] = useState<UserIdentityDTO | null>(() => {
    const savedUser = localStorage.getItem("app_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Poiché lo stato 'user' è già disponibile sincronicamente dal localStorage,
  // 'loading' parte direttamente a false senza bisogno di useEffect.
  const [loading, setLoading] = useState(false);

  const login = (userData: UserIdentityDTO) => {
    setUser(userData);
    localStorage.setItem("app_user", JSON.stringify(userData));
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch(`${authURL}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Errore durante il logout", e);
    } finally {
      setUser(null);
      localStorage.removeItem("app_user");
      setLoading(false);
    }
  };

  return (
    <UserAuthContext.Provider
      value={{
        loading,
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};
