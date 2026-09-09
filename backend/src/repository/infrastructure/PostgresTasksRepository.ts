import type { CreateTaskDTO, Task } from "../domain/Task.js";
import type { ITasksRepository } from "../domain/TasksRepository.js";
import { pool } from "./pool.js";

export class PostgresTasksRepository implements ITasksRepository {
  async getAll(userId: string): Promise<Task[]> {
    const query = `SELECT * FROM tasks WHERE user_id = $1 ORDER BY id ASC`;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  async getById(id: string, userId: string): Promise<Task | null> {
    const query = `SELECT * FROM tasks WHERE id = $1 AND user_id = $2`;
    const values = [id, userId];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }

  async create(taskData: CreateTaskDTO & { userId: string }): Promise<Task> {
    const { title, description, priority, executed, userId } = taskData;
    const query = `
      INSERT INTO tasks (title, description, priority, executed, user_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `;
    const values = [title, description, priority, executed, userId];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  async update(id: string, userId: string, taskData: Partial<CreateTaskDTO>): Promise<Task | null> {
    const { title, description, priority, executed } = taskData;
    const query = `
      UPDATE tasks 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          priority = COALESCE($3, priority),
          executed = COALESCE($4, executed)
      WHERE id = $5 AND user_id = $6
      RETURNING *
    `;
    const values = [title, description, priority, executed, id, userId];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }

  async delete(id: string, userId: string): Promise<Task | null> {
    const query = `DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *`;
    const values = [id, userId];
    const { rows } = await pool.query(query, values);
    return rows[0] || null;
  }
}
