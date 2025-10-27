import * as SQLite from "expo-sqlite";

let instance: SQLite.SQLiteDatabase | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (instance) return instance;

  const db = await SQLite.openDatabaseAsync("todos.db");
  await db.execAsync(`
    PRAGMA journla_mode = WAL;
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER NOT NULL,
      createdAt TEXT NOT NULL
    );
  
    `)
    instance = db;
    return db;
}