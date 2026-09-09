import type { CreateTaskDTO, Task } from "./Task.js";

export interface ITasksRepository {
  getAll(userId: string): Promise<Task[]>;
  getById(id: string, userId: string): Promise<Task | null>;
  create(taskData: CreateTaskDTO & { userId: string }): Promise<Task>;
  update(id: string, userId: string, taskData: Partial<CreateTaskDTO>): Promise<Task | null>;
  delete(id: string, userId: string): Promise<Task | null>;
}
