import { Todo, CreateTodoDTO } from '../entities/Todo';
import { TodoRepository } from '../repositories/TodoRepository';


export class CreateTodo {
  constructor(private repository: TodoRepository) {}

  async execute(data: CreateTodoDTO): Promise<Todo> {
    if (!data.title.trim()) {
      throw new Error("❌ Ingrese un título");
    }

    if (data.title.length < 3) {
      throw new Error("❌ El título debe tener al menos 3 caracteres");
    }

    if (data.title.length > 200) {
      throw new Error("❌ Rl titulo debe tener menos de 200 caracteres");
    }

    return this.repository.create(data);
  }
}