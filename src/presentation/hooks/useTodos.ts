// 🟢 CUSTOM HOOK: La UI solo interactúa con este hook
// No conoce nada sobre SQLite, repositorios, o use cases

import { container } from "@/src/di/container";
import { Todo } from "@/src/domain/entities/Todo";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

export const useTodos = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await container.getAllTodos.execute();
      setTodos(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
      Alert.alert("Error", "No se pudieron cargar las tareas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const addTodo = async (title: string): Promise<boolean> => {
    try {
      const newTodo = await container.createTodo.execute({ title });
      setTodos([newTodo, ...todos]);
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al agregar tarea";
      Alert.alert("Error", message);
      return false;
    }
  };

  const toggleTodo = async (id: string): Promise<void> => {
    try {
      const updatedTodo = await container.toggleTodo.execute(id);
      setTodos(todos.map((t) => (t.id === id ? updatedTodo : t)));
    } catch (err) {
      Alert.alert("Error", "No se pudo actualizar la tarea");
    }
  };

  const deleteTodo = async (id: string): Promise<void> => {
    try {
      await container.deleteTodo.execute(id);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (err) {
      Alert.alert("Error", "No se pudo eliminar la tarea");
    }
  };

  return {
    todos,
    loading,
    error,
    addTodo,
    toggleTodo,
    deleteTodo,
    refresh: loadTodos,
  };
};
