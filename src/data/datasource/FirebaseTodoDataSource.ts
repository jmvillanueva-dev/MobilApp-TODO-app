import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where, // ← NUEVO: para filtrar por userId
  Timestamp,
} from "firebase/firestore";
import { db } from "@/FirebaseConfig";
import { Todo } from "@/src/domain/entities/Todo";

export class FirebaseTodoDataSource {
  private collectionName = "todos";
  async initialize(): Promise<void> {
    console.log("Firebase initialized");
  }
  // ← MODIFICADO: ahora filtra por userId
  async getAllTodos(userId: string): Promise<Todo[]> {
    const q = query(
      collection(db, this.collectionName),
      where("userId", "==", userId), // ← NUEVO: solo tareas del usuario
      orderBy("createdAt", "desc")
    );
    console.log("UserId", userId);
    console.log("Query:", q);
    const querySnapshot = await getDocs(q);
    console.log("Query snapshot:", querySnapshot);
    return querySnapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        title: data.title,
        completed: data.completed,
        createdAt: data.createdAt.toDate(),
        userId: data.userId, // ← NUEVO
      };
    });
  }
  async getTodoById(id: string): Promise<Todo | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title,
      completed: data.completed,
      createdAt: data.createdAt.toDate(),
      userId: data.userId, // ← NUEVO
    };
  }
  // ← MODIFICADO: ahora recibe title y userId
  async createTodo(title: string, userId: string): Promise<Todo> {
    const newTodo = {
      title,
      completed: false,
      createdAt: Timestamp.now(),
      userId, // ← NUEVO: guardar el userId
    };
    const docRef = await addDoc(collection(db, this.collectionName), newTodo);
    return {
      id: docRef.id,
      title,
      completed: false,
      createdAt: new Date(),
      userId, // ← NUEVO
    };
  }
  async updateTodo(
    id: string,
    completed?: boolean,
    title?: string
  ): Promise<Todo> {
    const docRef = doc(db, this.collectionName, id);
    const updates: any = {};
    if (completed !== undefined) updates.completed = completed;
    if (title !== undefined) updates.title = title;
    await updateDoc(docRef, updates);
    const updated = await this.getTodoById(id);
    if (!updated) throw new Error("Todo not found after update");
    return updated;
  }
  async deleteTodo(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }
}
