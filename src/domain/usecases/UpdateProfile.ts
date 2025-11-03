import { AuthRepository } from '../repositories/AuthRepository';

export class UpdateProfile {
  constructor(private authRepository: AuthRepository) {}

  async execute(userId: string, data: { displayName: string }): Promise<void> {
    return this.authRepository.updateProfile(userId, data);
  }
}
