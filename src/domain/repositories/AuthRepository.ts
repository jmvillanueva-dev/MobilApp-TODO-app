import { User } from '../entities/User'

export interface AuthRepository {
  // Registrar nuevo usuario con datos adicionales
  register(email: string, password: string, displayName: string): Promise<User>;

  // Iniciar Sesion
  login(email: string, password: string): Promise<User>;

  // Cerrar Sesion
  logout(): Promise<void>;

  // Obtener usuario actualmente autenticado
  getCurrentUser(): Promise<User | null>;

  // Escuchar cambios de autenticacion (observer pattern)
  onAuthStateChanged(callback: (user: User | null) => void): () => void;

  // Actualizar perfil de usuario
  updateProfile(userId: string, data: { displayName: string }): Promise<void>;

  // Recuperar contrasena via email
  sendPasswordResetEmail(email: string): Promise<void>;
}