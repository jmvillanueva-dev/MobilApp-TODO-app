import { TodoRepository } from "@/src/domain/repositories/TodoRepository";
import { Todo, CreateTodoDTO, UpdateTodoDTO } from "@/src/domain/entities/Todo";
import { FirebaseTodoDataSource } from "../datasource/FirebaseTodoDataSource";

// 🟢 EXACTAMENTE LA MISMA ESTRUCTURA que TodoRepositoryImpl
// Solo cambia el data source que usa

export class TodoRepositoryFirebaseImpl implements TodoRepository {
  constructor(private dataSource: FirebaseTodoDataSource) {}

  async getAll(): Promise<Todo[]> {
    return await this.dataSource.getAllTodos();
  }

  async getById(id: string): Promise<Todo | null> {
    return await this.dataSource.getTodoById(id);
  }

  async create(data: CreateTodoDTO): Promise<Todo> {
    return await this.dataSource.createTodo(data.title);
  }

  async update(data: UpdateTodoDTO): Promise<Todo> {
    return await this.dataSource.updateTodo(
      data.id,
      data.completed,
      data.title
    );
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.deleteTodo(id);
  }
}
