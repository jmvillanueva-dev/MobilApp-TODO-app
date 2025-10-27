import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import * as SQLite from "expo-sqlite";

// 🔴 PROBLEMA: Todo está mezclado en un solo componente
// UI, lógica de negocio, y acceso a datos juntos

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

export default function TodosScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState("");
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  // 🔴 PROBLEMA: La UI conoce directamente cómo se accede a la base de datos
  useEffect(() => {
    initDatabase();
  }, []);

  const initDatabase = async () => {
    try {
      // 🔴 PROBLEMA: Lógica de inicialización de DB en el componente
      const database = await SQLite.openDatabaseAsync("todos.db");
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS todos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          completed INTEGER DEFAULT 0,
          createdAt TEXT NOT NULL
        );
      `);

      setDb(database);
      loadTodos(database);
    } catch (error) {
      console.error("Error initializing database:", error);
      Alert.alert("Error", "No se pudo inicializar la base de datos");
    }
  };

  const loadTodos = async (database: SQLite.SQLiteDatabase) => {
    try {
      // 🔴 PROBLEMA: Queries SQL directamente en el componente
      const result = await database.getAllAsync<Todo>(
        "SELECT * FROM todos ORDER BY createdAt DESC"
      );
      setTodos(result);
    } catch (error) {
      console.error("Error loading todos:", error);
      Alert.alert("Error", "No se pudieron cargar las tareas");
    }
  };

  const addTodo = async () => {
    if (!inputText.trim() || !db) return;

    try {
      // 🔴 PROBLEMA: La UI maneja directamente las operaciones de DB
      const result = await db.runAsync(
        "INSERT INTO todos (title, completed, createdAt) VALUES (?, ?, ?)",
        inputText.trim(),
        0,
        new Date().toISOString()
      );

      const newTodo: Todo = {
        id: result.lastInsertRowId,
        title: inputText.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
      };

      setTodos([newTodo, ...todos]);
      setInputText("");
    } catch (error) {
      console.error("Error adding todo:", error);
      Alert.alert("Error", "No se pudo agregar la tarea");
    }
  };

  const toggleTodo = async (id: number) => {
    if (!db) return;

    try {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return;

      // 🔴 PROBLEMA: Lógica SQL en el componente
      await db.runAsync(
        "UPDATE todos SET completed = ? WHERE id = ?",
        todo.completed ? 0 : 1,
        id
      );

      setTodos(
        todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    } catch (error) {
      console.error("Error toggling todo:", error);
      Alert.alert("Error", "No se pudo actualizar la tarea");
    }
  };

  const deleteTodo = async (id: number) => {
    if (!db) return;

    try {
      // 🔴 PROBLEMA: Lógica SQL en el componente
      await db.runAsync("DELETE FROM todos WHERE id = ?", id);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
      Alert.alert("Error", "No se pudo eliminar la tarea");
    }
  };

  const renderTodo = ({ item }: { item: Todo }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity
        style={styles.todoContent}
        onPress={() => toggleTodo(item.id)}
      >
        <View
          style={[styles.checkbox, item.completed && styles.checkboxChecked]}
        >
          {item.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text
          style={[styles.todoText, item.completed && styles.todoTextCompleted]}
        >
          {item.title}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => deleteTodo(item.id)}
        style={styles.deleteButton}
      >
        <Text style={styles.deleteButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mis Tareas</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Nueva tarea..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.addButton} onPress={addTodo}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={todos}
        renderItem={renderTodo}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />

      <Text style={styles.footer}>
        Total: {todos.length} | Completadas:{" "}
        {todos.filter((t) => t.completed).length}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 40,
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#007AFF",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  todoItem: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  todoContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#007AFF",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#007AFF",
  },
  checkmark: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  todoText: {
    fontSize: 16,
    flex: 1,
  },
  todoTextCompleted: {
    textDecorationLine: "line-through",
    color: "#999",
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  footer: {
    textAlign: "center",
    color: "#666",
    marginTop: 10,
    fontSize: 14,
  },
});
