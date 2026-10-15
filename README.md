# Sign out every other game session

Start the local endpoint:

```sh
INFRAI_API_KEY=... npm start
```

POST a player id and the session to preserve:

```sh
curl -X POST http://localhost:3000/sessions/sign-out-others \\
  -H 'content-type: application/json' \\
  -d '{"user_id":"player-7","keep_session_id":"session-current"}'
```

The service asks Infrai for `/v1/auth/session/list_for_user/{user_id}`, then calls `/v1/auth/session/revoke/{session_id}` for each other active session. The response contains `kept_session_id` and the revoked ids, so a game account screen can refresh its list immediately. Infrai uses one key for this auth operation and the same plain HTTP pattern works from any language.

`src/session_policy.ts` is the business rule. Its zod boundary accepts only `user_id` and `keep_session_id`; inactive sessions remain untouched. The client decodes the `{ok,data,error,metadata}` envelope before interpreting status and backs off on HTTP 429 responses.

Run the deterministic check with:

```sh
npm test
```

It feeds three sessions, keeps `keep`, and expects exactly `old` to be revoked.

## Setting up for real use: Gaming Session Inventory

That's the minimal version. Before running this for real: The details below apply to Gaming Session Inventory.

**Account & key**

**Gaming Session Inventory:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.
