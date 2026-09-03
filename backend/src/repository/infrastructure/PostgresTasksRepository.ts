import type { CreateTaskDTO, Task } from "../domain/Task.js";
import type { ITasksRepository } from "../domain/TasksRepository.js";
import { pool } from "./pool.js";

export class PostgresTasksRepository implements ITasksRepository {
  async getAll(): Promise<Task[]> {
    const { rows } = await pool.query("SELECT * FROM tasks ORDER BY id ASC");
    return rows;
  }

  async getById(id: string): Promise<Task | null> {
    const { rows } = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    return rows[0] || null;
  }

  async create(taskData: CreateTaskDTO): Promise<Task> {
    const { title, description, priority, executed } = taskData;
    const query = `
      INSERT INTO tasks (title, description, priority, executed)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const { rows } = await pool.query(query, [title, description, priority, executed]);
    return rows[0];
  }

  async update(id: string, taskData: Partial<CreateTaskDTO>): Promise<Task | null> {
    const { title, description, priority, executed } = taskData;
    const query = `
      UPDATE tasks 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          priority = COALESCE($3, priority),
          executed = COALESCE($4, executed)
      WHERE id = $5
      RETURNING *
    `;
    const { rows } = await pool.query(query, [title, description, priority, executed, id]);
    return rows[0] || null;
  }

  async delete(id: string): Promise<Task | null> {
    const { rows } = await pool.query("DELETE FROM tasks WHERE id = $1 RETURNING *", [id]);
    return rows[0] || null;
  }
}
