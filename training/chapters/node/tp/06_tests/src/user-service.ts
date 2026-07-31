export interface User {
  id: number;
  name: string;
  email: string;
}

/**
 * Data-access contract for users. Injected into {@link UserService} so the
 * service can be unit-tested against a mock instead of a real database.
 */
export interface UserRepository {
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
}

/**
 * Business logic around users. Holds no I/O of its own: everything goes
 * through the injected repository, which makes the service trivial to mock.
 */
export class UserService {
  constructor(private readonly repository: UserRepository) {}

  async listUsers(): Promise<User[]> {
    return this.repository.findAll();
  }

  async getUser(id: number): Promise<User> {
    const user = await this.repository.findById(id);
    if (user === null) {
      throw new Error(`User ${id} not found`);
    }
    return user;
  }
}
