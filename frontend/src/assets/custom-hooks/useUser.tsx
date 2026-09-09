export const authURL = import.meta.env.VITE_AUTH_URL;

export interface User {
  id: string;
  email: string;
  password: string; // Password criptata
  created_at: Date;
  updated_at?: Date;
}

export type UserIdentityDTO = Omit<User, "password" | "created_at" | "updated_at">;

export type UserCredentialsDTO = Omit<User, "id" | "created_at" | "updated_at">;
