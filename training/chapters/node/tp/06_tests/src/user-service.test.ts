import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { UserService } from "./user-service.ts";
import type { User, UserRepository } from "./user-service.ts";

// A handful of fixtures the mocked repository can return.
const users: User[] = [
  { id: 1, name: "Ada Lovelace", email: "ada@example.com" },
  { id: 2, name: "Alan Turing", email: "alan@example.com" },
];

describe("UserService", () => {
  it("listUsers returns every user from the repository", async () => {
    // Build a repository whose methods are node:test mock functions.
    const repository: UserRepository = {
      findAll: mock.fn(async () => users),
      findById: mock.fn(async () => null),
    };
    const service = new UserService(repository);

    const result = await service.listUsers();

    // TODO: assert that `result` deep-equals `users`.
    // TODO: assert that `repository.findAll` was called exactly once.
    //       Hint: (repository.findAll as ReturnType<typeof mock.fn>).mock.callCount()
    assert.ok(result);
  });

  it("getUser returns the matching user when it exists", async () => {
    const repository: UserRepository = {
      findAll: mock.fn(async () => users),
      findById: mock.fn(async (id: number) => users.find((u) => u.id === id) ?? null),
    };
    const service = new UserService(repository);

    // TODO: call `service.getUser(1)` and assert it equals `users[0]`.
    // TODO: assert `repository.findById` was called once with the argument `1`.
    //       Hint: inspect `.mock.calls[0].arguments`.
    assert.ok(service);
  });

  it("getUser throws when the user is missing", async () => {
    const repository: UserRepository = {
      findAll: mock.fn(async () => users),
      findById: mock.fn(async () => null),
    };
    const service = new UserService(repository);

    // TODO: assert that `service.getUser(999)` rejects with an Error
    //       whose message contains "999".
    //       Hint: await assert.rejects(service.getUser(999), /999/);
    assert.ok(service);
  });
});
