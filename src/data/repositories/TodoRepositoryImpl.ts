import { TodoRepository } from '@/src/domain/repositories/TodoRepository';
import {
  Todo,
  CreateTodoDTO,
  UpdateTodoDTO,
} from "@/src/domain/entities/Todo";
import { SQLiteTodoDataSource } from '@/src/data/datasource/SQLiteTodoDataSource';


export class TodoRepositoryImpl implements TodoRepository {
  constructor(private dataSource: SQLiteTodoDataSource) {}

  async getAll(): Promise<Todo[]> {
    return this.dataSource.getAllTodos();
  }

  async getById(id: string): Promise<Todo | null> {
    return this.dataSource.getTodoById(id);
  }

  async create(data: CreateTodoDTO): Promise<Todo> {
    return this.dataSource.createTodo(data.title);
  }

  async update(todo: UpdateTodoDTO): Promise<Todo> {
    return this.dataSource.updateTodo(todo.id, todo.completed, todo.title);
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.deleteTodo(id);
  }

}