import { AuthRepository } from "../repositories/AuthRepository";
import { User } from "../entities/User";
import { InvalidEmailError } from "../errors/AuthErrors";

export class RegisterUser {
  constructor(private authRepository: AuthRepository) {}

  async execute(
    email: string,
    password: string,
    displayName: string
  ): Promise<User> {
    // Validaciones de Negocio
    if (!email || !password || !displayName) {
      throw new Error("❌ Todos los campos son requeridos");
    }

    if (password.length < 6) {
      throw new Error("❌ La contraseña debe tener al menos 6 caracteres");
    }

    // Validar formato de email mejorado
    if (!this.isValidEmail(email)) {
      throw new InvalidEmailError("❌ El formato del email no es válido");
    }

    return this.authRepository.register(email, password, displayName);
  }

  private isValidEmail(email: string): boolean {
    // Regex mejorado para validación de email
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    // Verificar longitud máxima
    if (email.length > 254) {
      return false;
    }

    // Verificar que no empiece o termine con punto
    if (email.startsWith(".") || email.endsWith(".")) {
      return false;
    }

    // Verificar que tenga un @
    const atCount = (email.match(/@/g) || []).length;
    if (atCount !== 1) {
      return false;
    }

    // Verificar partes del email
    const parts = email.split("@");
    if (parts.length !== 2) {
      return false;
    }

    const [localPart, domainPart] = parts;

    // Validar parte local (antes del @)
    if (localPart.length === 0 || localPart.length > 64) {
      return false;
    }

    // Validar dominio (después del @)
    if (domainPart.length === 0 || domainPart.length > 253) {
      return false;
    }

    // Validar que el dominio tenga al menos un punto
    if (!domainPart.includes(".")) {
      return false;
    }

    // Validar que no tenga puntos consecutivos
    if (email.includes("..")) {
      return false;
    }

    return emailRegex.test(email);
  }
}
