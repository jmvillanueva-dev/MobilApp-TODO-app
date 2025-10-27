import { useEffect, useState } from "react";
import { Alert  } from "react-native";
import { Todo } from "@/models/Todo"; 
import { todoRepository } from "@/repositories/todoRepository";


export function useTodosController() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await todoRepository.getAll();
        setTodos(data);
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "No se pudieron cargar las tareas");
      }
    })();
  }, []);

  const addTodo = async (title: string) => {
    if (!title.trim()) return;
    try {
      const created = await todoRepository.add(title);
      setTodos((prev) => [created, ...prev]);
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo agregar la tarea");
    }
  };

  const toggleTodo = async (id: number) => {
    const current = todos.find((t) => t.id === id);
    if (!current) return;
    const next = !current.completed;
    try {
      await todoRepository.updateCompleted(id, next);
      setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: next } : t)));
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo actualizar la tarea");
    }  
  };

  const deleteTodo = async (id: number) => {
    try {
      await todoRepository.remove(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo eliminar la tarea");
    }
  };

  return { todos, addTodo, toggleTodo, deleteTodo };

}