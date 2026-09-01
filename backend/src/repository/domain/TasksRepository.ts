import type { CreateTaskDTO, Task } from "./Task.js";

export interface ITasksRepository {
  getAll(): Promise<Task[]>;
  getById(id: string): Promise<Task | null>;
  create(taskData: CreateTaskDTO): Promise<Task>;
  update(id: string, taskData: Partial<CreateTaskDTO>): Promise<Task | null>;
  delete(id: string): Promise<Task | null>;
}
