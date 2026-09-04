import type { CreateUserDTO, User } from "./User.js";

export interface IUsersRepository {
  register(taskData: CreateUserDTO): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  getById(id: string): Promise<User | null>;
}
