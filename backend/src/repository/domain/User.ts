export interface User {
  id: string;
  email: string;
  password: string; // Password criptata
  created_at: Date;
  updated_at?: Date;
}

// Tipo per la fase di creazione User: `id`, `created_at` e `updated_at` sono omessi in quanto generato dal database
export type CreateUserDTO = Omit<User, "id" | "created_at" | "updated_at">;
