import { AuthRepository } from "../repositories/AuthRepository";
import { User } from "../entities/User";

export class RegisterUser {
  constructor(private authRepository: AuthRepository) {}

  async execute(email: string, password: string, displayName: string): Promise<User> {
    // Validaciones de Negocio
    if (!email || !password || !displayName) {
      throw new Error("❌ Todos los campos son requeridos");
    }

    if (password.length < 6) {
      throw new Error("❌ La contraseña debe tener al menos 6 caracteres");
    }

    // Validar formato de email basico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("❌ El formato del email no es válido");
    }

    return this.authRepository.register(email, password, displayName);
  }

}