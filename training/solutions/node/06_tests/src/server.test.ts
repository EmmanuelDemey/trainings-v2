import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "./server.ts";

describe("GET /api/users", () => {
  it("responds with 200 and a JSON array of users", async () => {
    // supertest binds the app to an ephemeral port for the duration of the
    // request: no `listen`, no hard-coded port, no leaked server between tests.
    const response = await request(app).get("/api/users");

    assert.equal(response.status, 200);
    assert.match(response.headers["content-type"], /json/);
    assert.ok(Array.isArray(response.body));
    assert.equal(response.body.length, 2);
    assert.equal(response.body[0].name, "Ada Lovelace");
  });
});
