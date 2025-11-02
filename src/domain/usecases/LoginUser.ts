import { AuthRepository } from "../repositories/AuthRepository";
import { User } from "../entities/User";

export class LoginUser {

  constructor(private authRepository: AuthRepository) {};

  async execute(
    email: string,
    password: string,  
  ): Promise<User> {
    if (!email || !password) {
      throw new Error("❌ Email y contraseña son requeridos");
    }

    if (!email.includes("@")) {
      throw new Error("❌ El formato del email no es válido");
    }

    return this.authRepository.login(email, password);
  }

}