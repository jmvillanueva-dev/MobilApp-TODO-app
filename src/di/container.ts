// 🟢 DEPENDENCY INJECTION: Aquí se conectan todas las piezas

// Este es el único lugar que conoce las implementaciones concretas

// import { SQLiteTodoDataSource } from "@/src/data/datasource/SQLiteTodoDataSource";
// import { TodoRepositoryImpl } from "@/src/data/repositories/TodoRepositoryImpl";

import { FirebaseTodoDataSource } from "../data/datasource/FirebaseTodoDataSource";
import { TodoRepositoryFirebaseImpl } from "../data/repositories/TodoRepositoryFirebaseImpl";

import { GetAllTodos } from "@/src/domain/usecases/GetAllTodos";

import { CreateTodo } from "@/src/domain/usecases/CreateTodo";

import { ToggleTodo } from "@/src/domain/usecases/ToggleTodo";

import { DeleteTodo } from "@/src/domain/usecases/DeleteTodo";

// 🟢 Singleton para mantener una sola instancia

class DIContainer {
  private static instance: DIContainer;

  private _dataSource: FirebaseTodoDataSource | null = null;

  private _repository: TodoRepositoryFirebaseImpl | null = null;

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }

    return DIContainer.instance;
  }

  async initialize(): Promise<void> {
    this._dataSource = new FirebaseTodoDataSource();

    await this._dataSource.initialize();

    this._repository = new TodoRepositoryFirebaseImpl(this._dataSource);
  }

  // 🟢 Use Cases - cada uno recibe el repository

  //Cada caso de uso necesita un repository para acceder a los datos

  get getAllTodos(): GetAllTodos {
    if (!this._repository) throw new Error("Container not initialized");

    return new GetAllTodos(this._repository);
  }

  get createTodo(): CreateTodo {
    if (!this._repository) throw new Error("Container not initialized");

    return new CreateTodo(this._repository);
  }

  get toggleTodo(): ToggleTodo {
    if (!this._repository) throw new Error("Container not initialized");

    return new ToggleTodo(this._repository);
  }

  get deleteTodo(): DeleteTodo {
    if (!this._repository) throw new Error("Container not initialized");

    return new DeleteTodo(this._repository);
  }
}

export const container = DIContainer.getInstance();
