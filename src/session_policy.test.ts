import assert from "node:assert/strict";
import { signOutOthers } from "./session_policy.js";

const calls: string[] = [];
const client = { listSessions: async () => [{ id: "keep", active: true }, { id: "old", active: true }, { id: "idle", active: false }], revokeSession: async (id: string) => { calls.push(id); } };
const result = await signOutOthers(client, { user_id: "player-7", keep_session_id: "keep" });
assert.deepEqual(result.revoked_session_ids, ["old"]);
assert.deepEqual(calls, ["old"]);
console.log("session policy: kept current session and revoked one active peer");
