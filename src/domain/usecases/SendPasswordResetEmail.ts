import { AuthRepository } from "../repositories/AuthRepository";

export class SendPasswordResetEmail {
  constructor(private authRepository: AuthRepository) {}

  async execute(email: string): Promise<void> {
    if (!email || !email.trim()) {
      throw new Error("❌ El email es requerido");
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("❌ El formato del email no es válido");
    }

    return this.authRepository.sendPasswordResetEmail(email.trim());
  }
}
