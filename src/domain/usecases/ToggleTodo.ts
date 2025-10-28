import { Todo } from '../entities/Todo';
import { TodoRepository } from '../repositories/TodoRepository';


export class ToggleTodo {
  constructor(private repository: TodoRepository) {}

  async execute(id: string): Promise<Todo> {
    const todo = await this.repository.getById(id);

    if (!todo) {
      throw new Error("❌ Tarea no encontrada");
    }

    const updatedTodo = await this.repository.update({
      id: todo.id,
      completed: !todo.completed,
    });

    return updatedTodo;
  }

}