import { createContext, useContext } from "react";
import { type UserIdentityDTO } from "../custom-hooks/useUser";

interface UserAuthContext {
  loading: boolean;
  user: UserIdentityDTO | null;
  isAuthenticated: boolean;
  login: (userData: UserIdentityDTO) => void;
  logout: () => Promise<void>;
}

export const UserAuthContext = createContext<UserAuthContext | undefined>(undefined);

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error("useAuth must be used within the UserAuth Provider");
  }
  return context;
};
