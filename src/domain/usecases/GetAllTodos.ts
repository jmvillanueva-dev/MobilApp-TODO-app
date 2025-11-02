import { Todo } from "../entities/Todo";
import { TodoRepository } from "../repositories/TodoRepository";

export class GetAllTodos {
  constructor(private repository: TodoRepository) {}

  async execute(userId: string): Promise<Todo[]> {
    if (!userId) {
      throw new Error("User ID is required");
    }
    return await this.repository.getAll(userId);
  }
}
