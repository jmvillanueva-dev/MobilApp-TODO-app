// Contrato: Define que operaciones existen, no como se implementan

import { Todo, CreateTodoDTO, UpdateTodoDTO } from '../entities/Todo';

export interface TodoRepository {
  getAll(userId:string): Promise<Todo[]>;
  getById(id: string): Promise<Todo | null>;
  create(todo: CreateTodoDTO): Promise<Todo>;
  update(todo: UpdateTodoDTO): Promise<Todo>;
  delete(id: string): Promise<void>;
}