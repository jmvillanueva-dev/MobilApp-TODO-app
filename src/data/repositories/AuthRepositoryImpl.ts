import { AuthRepository } from "@/src/domain/repositories/AuthRepository";
import { User } from "@/src/domain/entities/User";
import { FirebaseAuthDataSource } from "@/src/data/datasource/FirebaseAuthDataSource";

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private dataSource: FirebaseAuthDataSource) {}

  async register(
    email: string,
    password: string,
    displayName: string
  ): Promise<User> {
    return this.dataSource.register(email, password, displayName);
  }

  async login(email: string, password: string) : Promise<User>{
    return this.dataSource.login(email, password);
  }

  async logout(): Promise<void> {
    await this.dataSource.logout();
  }

  async getCurrentUser(): Promise<User | null> {
    return this.dataSource.getCurrentUser();
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
      return this.dataSource.onAuthStateChanged(callback);
  }

}
