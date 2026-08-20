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
    const findAll = mock.fn(async () => users);
    const repository: UserRepository = { findAll, findById: mock.fn(async () => null) };
    const service = new UserService(repository);

    const result = await service.listUsers();

    assert.deepEqual(result, users);
    // Not decoration: it is what proves the service did not cache, retry or
    // fan out behind your back.
    assert.equal(findAll.mock.callCount(), 1);
  });

  it("getUser returns the matching user when it exists", async () => {
    const findById = mock.fn(async (id: number) => users.find((u) => u.id === id) ?? null);
    const repository: UserRepository = { findAll: mock.fn(async () => users), findById };
    const service = new UserService(repository);

    const result = await service.getUser(1);

    assert.deepEqual(result, users[0]);
    assert.equal(findById.mock.callCount(), 1);
    assert.deepEqual(findById.mock.calls[0].arguments, [1]);
  });

  it("getUser throws when the user is missing", async () => {
    const repository: UserRepository = {
      findAll: mock.fn(async () => users),
      findById: mock.fn(async () => null),
    };
    const service = new UserService(repository);

    // `assert.rejects` takes the promise (or a function returning one) — do NOT
    // `await service.getUser(999)` first, the rejection would escape the assert.
    await assert.rejects(service.getUser(999), /999/);
  });
});
