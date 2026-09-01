import type { CreateTaskDTO, Task } from "./Task.js";

export interface ITasksRepository {
  getAll(): Promise<Task[]>;
  getById(id: number): Promise<Task | null>;
  create(taskData: CreateTaskDTO): Promise<Task>;
  update(id: number, taskData: Partial<CreateTaskDTO>): Promise<Task | null>;
  delete(id: number): Promise<Task | null>;
}
