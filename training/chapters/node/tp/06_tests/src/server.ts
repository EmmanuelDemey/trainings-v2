import express from "express";
import type { Express, Request, Response } from "express";
import { UserService } from "./user-service.ts";
import type { User, UserRepository } from "./user-service.ts";

// In-memory repository so the app runs without a database.
const inMemoryRepository: UserRepository = {
  async findAll(): Promise<User[]> {
    return [
      { id: 1, name: "Ada Lovelace", email: "ada@example.com" },
      { id: 2, name: "Alan Turing", email: "alan@example.com" },
    ];
  },
  async findById(id: number): Promise<User | null> {
    const users = await this.findAll();
    return users.find((user) => user.id === id) ?? null;
  },
};

/**
 * Builds the Express application. Exported (without `listen`) so tests can
 * drive it with supertest, and so a real server can wrap it in `listen`.
 */
export function createApp(service = new UserService(inMemoryRepository)): Express {
  const app = express();

  app.get("/api/users", async (_req: Request, res: Response) => {
    const users = await service.listUsers();
    res.json(users);
  });

  return app;
}

export const app = createApp();

// Start a real server only when this file is executed directly (npm start).
if (import.meta.main) {
  const port = Number(process.env.PORT ?? 3000);
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}
