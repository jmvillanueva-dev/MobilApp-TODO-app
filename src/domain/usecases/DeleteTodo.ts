import { TodoRepository } from '../repositories/TodoRepository';

export class DeleteTodo {
  constructor(private repository: TodoRepository) {}

  async execute(id: string): Promise<void> {
    const todo = await this.repository.getById(id);

    if (!todo) {
      throw new Error("❌ Tarea no encontrada");
    }

    await this.repository.delete(id);
  }

}