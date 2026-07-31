import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "./server.ts";

describe("GET /api/users", () => {
  it("responds with 200 and a JSON array of users", async () => {
    const response = await request(app).get("/api/users");

    // TODO: assert `response.status` is 200.
    // TODO: assert the `Content-Type` header matches /json/.
    // TODO: assert `response.body` is an array.
    // TODO: assert the first user has the expected `name` ("Ada Lovelace").
    assert.ok(response);
  });
});
