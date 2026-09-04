import type { CreateUserDTO, User } from "../domain/User.js";
import type { IUsersRepository } from "../domain/UsersRepository.js";
import { pool } from "./pool.js";

export class PostgresUsersRepository implements IUsersRepository {
  async register(userData: CreateUserDTO): Promise<User> {
    const { email, password } = userData;
    const query = `
      INSERT INTO users (email, password)
      VALUES ($1, $2)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [email, password]);
    return rows[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = "SELECT * FROM users WHERE email = $1";
    const { rows } = await pool.query(query, [email]);
    return rows[0] || null;
  }

  async getById(id: string): Promise<User | null> {
    const query = "SELECT * FROM users WHERE id = $1";
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  }
}
