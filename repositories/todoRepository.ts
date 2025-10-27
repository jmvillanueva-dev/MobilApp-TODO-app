import { getDb } from "@/data/db"
import { Todo } from "@/models/Todo"

function mapRow( row: any ): Todo {
  return {
    id: row.id,
    title: row.title,
    completed: row.completed === 1,
    createdAt: row.createdAt
  };
}

export const todoRepository = {
  async getAll(): Promise<Todo[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<any>
    ("SELECT * FROM todos ORDER BY createdAt DESC" );
    return rows.map(mapRow);
  },

  async add(title: string): Promise<Todo> {
    const db = await getDb();
    const createdAt = new Date().toISOString();
    const result = await db.runAsync(
      "INSERT INTO todos (title, completed, createdAt) VALUES (?, ?, ?)",
      title.trim(), 
      0, 
      createdAt
    );
    return {
      id: result.lastInsertRowId,
      title: title.trim(),
      completed: false,
      createdAt,
    };
  },

  async updateCompleted(id: number, completed: boolean): Promise<void> {
    const db = await getDb();
    await db.runAsync(
      "UPDATE todos SET completed = ? WHERE id = ?", completed ? 1 : 0, id
    );
  },

  async remove(id: number): Promise<void> {
    const db = await getDb();
    await db.runAsync("DELETE FROM todos WHERE id = ?", id);
  },
};